import { airtableColumns, airtableRows } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { eq } from "drizzle-orm";
import { z } from "zod";

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
        .select({ values: airtableRows.values })
        .from(airtableRows)
        .where(eq(airtableRows.airtableId, input.tableId));

      return {
        columns,
        rows: rows.map((row) => row.values),
      };
    }),
  updateRow: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        rowId: z.string(),
        values: z.record(
          z.string(),
          z.union([z.string(), z.number(), z.null()]),
        ),
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

      for (const [columnId, value] of Object.entries(input.values)) {
        const expectedType = columnIdToType[columnId];

        if (!expectedType) {
          throw new Error(`Unknown column ID: ${columnId}`);
        }

        if (value === null) continue;

        if (expectedType === "number" && !z.number().safeParse(value).success) {
          throw new Error(`Expected number for column ${columnId}`);
        }

        if (expectedType === "text" && !z.string().safeParse(value).success) {
          throw new Error(`Expected string for column ${columnId}`);
        }
      }

      const [row] = await ctx.db
        .update(airtableRows)
        .set({ values: input.values })
        .where(eq(airtableRows.id, input.rowId))
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
          const values = row.values as Record<string, string | number | null>;

          for (const { id: columnId } of columns) {
            values[columnId] ??= null;
          }

          return { ...row, values };
        });

      return cleanedRows;
    }),
});
