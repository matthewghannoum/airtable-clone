import { protectedProcedure } from "@/server/api/trpc";
import {
  airtableColumns,
  airtableRows,
  viewDisplaySettings,
  viewSorts,
} from "@/server/db/schema";
import { and, eq, sql } from "drizzle-orm";
import z from "zod";

const getTableByView = protectedProcedure
  .input(z.object({ tableId: z.string(), viewId: z.string() }))
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
      ({ at_column: col, view_sorts, view_displays }) => {
        const displayOrderNum = view_displays?.displayOrderNum ?? 0;
        const isHidden = view_displays?.isHidden ?? false;

        if (!view_sorts)
          return {
            ...col,
            sortOrder: null,
            sortPriority: null,
            displayOrderNum,
            isHidden,
          };

        const { sortOrder, sortPriority } = view_sorts;

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
            // col.sortOrder === "asc"
            //   ? asc(orderByComponent)
            //   : desc(orderByComponent),
            sortPriority: col.sortPriority,
          };
        }
        return null;
      })
      .filter((c) => c !== null)
      .sort((a, b) => a.sortPriority - b.sortPriority)
      .map((c) => c.orderByComponent);

    const rows = await ctx.db
      .select({ values: airtableRows.values, id: airtableRows.id })
      .from(airtableRows)
      .where(eq(airtableRows.airtableId, input.tableId))
      .orderBy(...orderBy, airtableRows.insertionOrder); // airtableRows.createdTimestamp

    return {
      columns,
      rows: rows.map((row) => row.values),
      rowIds: rows.map((row) => row.id),
    };
  });

export default getTableByView;
