import { airtableColumns, airtableRows } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { and, eq, max, sql } from "drizzle-orm";
import type { AnyColumn } from "drizzle-orm";
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
    .input(z.object({ tableId: z.string() }))
    .query(async ({ ctx, input }) => {
      const columns = await ctx.db
        .select()
        .from(airtableColumns)
        .where(eq(airtableColumns.airtableId, input.tableId));

      const rows = await ctx.db
        .select({ values: airtableRows.values, id: airtableRows.id })
        .from(airtableRows)
        .where(eq(airtableRows.airtableId, input.tableId))
        .orderBy(airtableRows.createdTimestamp);

      return {
        columns,
        rows: rows.map((row) => row.values),
        rowIds: rows.map((row) => row.id),
      };
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
  getRows: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(airtableRows)
        .where(eq(airtableRows.airtableId, input.tableId));

      const columns = await ctx.db
        .select()
        .from(airtableColumns)
        .where(eq(airtableColumns.airtableId, input.tableId));

      const columnIdToType: Record<string, "text" | "number"> = {};
      for (const column of columns) {
        columnIdToType[column.id] = column.type;
      }

      const cleanedRows = rows
        .filter((row) => columnIdToType[row.id])
        .map((row) => {
          const values = row.values;

          for (const { id: columnId } of columns) {
            values[columnId] ??= null;
          }

          return { ...row, values };
        });

      return cleanedRows;
    }),
});
