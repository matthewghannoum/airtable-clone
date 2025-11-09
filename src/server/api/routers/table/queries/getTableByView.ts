import { protectedProcedure } from "@/server/api/trpc";
import {
  airtableColumns,
  airtableRows,
  viewDisplaySettings,
  viewSorts,
} from "@/server/db/schema";
import { and, count, eq, sql } from "drizzle-orm";
import z from "zod";
import getSQLFilters from "../utils/getSQLFilters";
import getFilterData from "../utils/getFilterData";

const getTableByView = protectedProcedure
  .input(
    z.object({
      tableId: z.string(),
      viewId: z.string(),
      limit: z.number().min(1).max(100),
      cursor: z.number().nullish(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const viewSettings = await ctx.db
      .select()
      .from(airtableColumns)
      .leftJoin(
        viewSorts,
        and(
          eq(viewSorts.columnId, airtableColumns.id),
          eq(viewSorts.viewId, input.viewId),
        ),
      )
      .leftJoin(
        viewDisplaySettings,
        eq(viewDisplaySettings.columnId, airtableColumns.id),
      )
      .where(eq(airtableColumns.airtableId, input.tableId));

    const columns = viewSettings.map(
      ({ at_column: col, view_sort, view_display }) => {
        const displayOrderNum = view_display?.displayOrderNum ?? 0;
        const isHidden = view_display?.isHidden ?? false;

        if (!view_sort)
          return {
            ...col,
            sortOrder: null,
            sortPriority: null,
            displayOrderNum,
            isHidden,
          };

        const { sortOrder, sortPriority } = view_sort;

        return {
          ...col,
          ...{ sortOrder, sortPriority, displayOrderNum, isHidden },
        };
      },
    );

    const orderBy = columns
      .map((col) => {
        if (col.sortOrder && col.sortPriority !== null) {
          // raw sql is safe here because col.id and col.type are from our own db which we control
          // and is validated
          // validate inputs you’ll turn into SQL keywords
          const dir = col.sortOrder === "desc" ? "DESC" : "ASC";

          // build the JSON ->> expression with the key bound as a parameter (safe)
          const baseExpr =
            col.type === "number"
              ? sql`(${airtableRows.values} ->> ${col.id})::numeric`
              : sql`${airtableRows.values} ->> ${col.id}`;

          // append direction as a constant (validated above)
          const orderExpr = sql`${baseExpr} ${sql.raw(dir)} NULLS LAST`;
          return {
            orderByComponent: orderExpr,
            sortPriority: col.sortPriority,
          };
        }
        return null;
      })
      .filter((c) => c !== null)
      .sort((a, b) => a.sortPriority - b.sortPriority)
      .map((c) => c.orderByComponent);

    const cursor = input.cursor ?? 0;

    const filterData = await getFilterData(ctx.db, input.viewId);

    const sqlFilters =
      filterData && filterData !== "no filters"
        ? getSQLFilters(filterData.conditionTree, filterData.filters)
        : undefined;

    const rowsQuery = ctx.db
      .select({ values: airtableRows.values, id: airtableRows.id })
      .from(airtableRows)
      .where(and(eq(airtableRows.airtableId, input.tableId), sqlFilters))
      .orderBy(...orderBy, airtableRows.insertionOrder)
      .offset(cursor)
      .limit(input.limit);

    // console.log("rowsQuery.toSQL()", rowsQuery.toSQL());

    const rows = await rowsQuery;

    const [numRows] = await ctx.db
      .select({ count: count(airtableRows) })
      .from(airtableRows)
      .where(eq(airtableRows.airtableId, input.tableId));

    return {
      columns,
      rows: rows.map((row) => row.values),
      rowIds: rows.map((row) => row.id),
      nextCursor:
        cursor + input.limit >= (numRows?.count ?? 0)
          ? null
          : cursor + input.limit + 1,
      numRows: numRows?.count ?? 0,
    };
  });

export default getTableByView;
