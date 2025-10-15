import { airtableColumns, airtableRows } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { and, asc, desc, eq, max, sql } from "drizzle-orm";
import type { AnyColumn, SQL } from "drizzle-orm";
import { z } from "zod";

function jsonbSet(column: AnyColumn, key: string, value: unknown) {
  return sql`jsonb_set(
    ${column},
    ARRAY[${key}]::text[],
    ${JSON.stringify(value)}::jsonb,
    true
  )`;
}

export const tableRouter = createTRPCRouter({
  createEmptyRow: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const columns = await ctx.db
        .select()
        .from(airtableColumns)
        .where(eq(airtableColumns.airtableId, input.tableId));

      const values: Record<string, null> = {};
      for (const column of columns) {
        values[column.id] = null;
      }

      const [newRow] = await ctx.db
        .insert(airtableRows)
        .values({
          airtableId: input.tableId,
          values,
        })
        .returning();

      return newRow;
    }),
  get: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        filters: z
          .array(
            z.union([
              z.object({
                columnId: z.string(),
                columnType: z.literal("text"),
                operator: z.enum([
                  "contains",
                  "equals",
                  "is_empty",
                  "is_not_empty",
                  "not_contains",
                ]),
                value: z.string().optional().nullable(),
              }),
              z.object({
                columnId: z.string(),
                columnType: z.literal("number"),
                operator: z.enum(["eq", "gt", "lt"]),
                value: z.union([z.number(), z.null()]).optional(),
              }),
            ]),
          )
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const columns = await ctx.db
        .select()
        .from(airtableColumns)
        .where(eq(airtableColumns.airtableId, input.tableId));

      const columnIdToType: Record<string, "text" | "number"> = {};
      for (const column of columns) {
        columnIdToType[column.id] = column.type;
      }

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
            const orderExpr = sql`${baseExpr} ${sql.raw(dir)}`;
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

      const filterConditions: SQL[] = [];

      for (const filter of input.filters ?? []) {
        const expectedType = columnIdToType[filter.columnId];

        if (!expectedType || expectedType !== filter.columnType) {
          continue;
        }

        if (filter.columnType === "text") {
          const value = filter.value ?? undefined;

          if (filter.operator === "is_not_empty") {
            filterConditions.push(
              sql`(${airtableRows.values} -> ${filter.columnId}) IS NOT NULL AND ${
                airtableRows.values
              } ->> ${filter.columnId} != ''`,
            );
            continue;
          }

          if (filter.operator === "is_empty") {
            filterConditions.push(
              sql`(${airtableRows.values} -> ${filter.columnId}) IS NULL OR ${
                airtableRows.values
              } ->> ${filter.columnId} = ''`,
            );
            continue;
          }

          if (
            (filter.operator === "contains" ||
              filter.operator === "not_contains" ||
              filter.operator === "equals") &&
            (value === undefined || value === null || value === "")
          ) {
            continue;
          }

          if (filter.operator === "contains") {
            filterConditions.push(
              sql`${airtableRows.values} ->> ${filter.columnId} ILIKE ${`%${value}%`}`,
            );
            continue;
          }

          if (filter.operator === "not_contains") {
            filterConditions.push(
              sql`${airtableRows.values} ->> ${filter.columnId} NOT ILIKE ${`%${value}%`}`,
            );
            continue;
          }

          if (filter.operator === "equals") {
            filterConditions.push(
              sql`${airtableRows.values} ->> ${filter.columnId} = ${value}`,
            );
          }
        } else if (filter.columnType === "number") {
          if (typeof filter.value !== "number" || Number.isNaN(filter.value)) {
            continue;
          }

          const numericValueExpression = sql`(${airtableRows.values} ->> ${filter.columnId})::numeric`;

          if (filter.operator === "gt") {
            filterConditions.push(sql`${numericValueExpression} > ${filter.value}`);
            continue;
          }

          if (filter.operator === "lt") {
            filterConditions.push(sql`${numericValueExpression} < ${filter.value}`);
            continue;
          }

          if (filter.operator === "eq") {
            filterConditions.push(sql`${numericValueExpression} = ${filter.value}`);
          }
        }
      }

      let whereClause: SQL = eq(airtableRows.airtableId, input.tableId);

      if (filterConditions.length > 0) {
        whereClause = and(eq(airtableRows.airtableId, input.tableId), ...filterConditions);
      }

      const rows = await ctx.db
        .select({ values: airtableRows.values, id: airtableRows.id })
        .from(airtableRows)
        .where(whereClause)
        .orderBy(...orderBy); // airtableRows.createdTimestamp

      return {
        columns,
        rows: rows.map((row) => row.values),
        rowIds: rows.map((row) => row.id),
      };
    }),
  updateSorts: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        sorts: z.array(
          z.object({
            columnId: z.string(),
            sortOrder: z.enum(["asc", "desc"]),
            sortPriority: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // update the sort order and priority of the specified columns
      for (const sort of input.sorts) {
        await ctx.db
          .update(airtableColumns)
          .set({
            sortOrder: sort.sortOrder,
            sortPriority: sort.sortPriority,
          })
          .where(
            and(
              eq(airtableColumns.airtableId, input.tableId),
              eq(airtableColumns.id, sort.columnId),
            ),
          );
      }

      // if a column is not in the input sorts, clear its sortOrder and sortPriority
      if (input.sorts.length > 0) {
        await ctx.db
          .update(airtableColumns)
          .set({
            sortOrder: null,
            sortPriority: null,
          })
          .where(
            and(
              eq(airtableColumns.airtableId, input.tableId),
              // airtableColumns.id not in input.sorts.map(s => s.columnId)
              sql`${airtableColumns.id} NOT IN (${sql.join(
                input.sorts.map((s) => sql`${s.columnId}`),
                sql`,`,
              )})`,
            ),
          );
      } else {
        await ctx.db
          .update(airtableColumns)
          .set({
            sortOrder: null,
            sortPriority: null,
          })
          .where(eq(airtableColumns.airtableId, input.tableId));
      }
    }),
  addColumn: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        name: z.string().min(1).max(100),
        type: z.enum(["text", "number"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const maxOrderNum = ctx.db
        .select({
          maxOrderNum: max(airtableColumns.displayOrderNum),
        })
        .from(airtableColumns)
        .where(eq(airtableColumns.airtableId, input.tableId));

      const [newColumn] = await ctx.db
        .insert(airtableColumns)
        .values({
          airtableId: input.tableId,
          name: input.name,
          type: input.type,
          displayOrderNum: sql`COALESCE((${maxOrderNum}), 0) + 1`,
        })
        .returning();

      return newColumn;
    }),
  updateCell: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        rowId: z.string(),
        columnId: z.string(),
        cellValue: z.union([z.string(), z.number(), z.null()]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const columns = await ctx.db
        .select()
        .from(airtableColumns)
        .where(eq(airtableColumns.airtableId, input.tableId));

      const columnIdToType: Record<string, "text" | "number"> = {};
      for (const column of columns) {
        columnIdToType[column.id] = column.type;
      }

      const columnId = input.columnId;
      const cellValue = input.cellValue;

      const expectedType = columnIdToType[columnId];

      if (!expectedType) {
        throw new Error(`Unknown column ID: ${columnId}`);
      }

      if (cellValue !== null) {
        if (
          expectedType === "number" &&
          !z.number().safeParse(cellValue).success
        ) {
          throw new Error(`Expected number for column ${columnId}`);
        }

        if (
          expectedType === "text" &&
          !z.string().safeParse(cellValue).success
        ) {
          throw new Error(`Expected string for column ${columnId}`);
        }
      }

      const [row] = await ctx.db
        .update(airtableRows)
        .set({
          values: jsonbSet(airtableRows.values, columnId, cellValue),
        })
        .where(
          and(
            eq(airtableRows.airtableId, input.tableId),
            eq(airtableRows.id, input.rowId),
          ),
        )
        .returning();

      if (!row) {
        throw new Error("Failed to insert row");
      }

      return row;
    }),
});
