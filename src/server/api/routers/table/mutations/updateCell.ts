import { airtableColumns, airtableRows } from "@/server/db/schema";
import { protectedProcedure } from "@/server/api/trpc";
import { and, eq, sql } from "drizzle-orm";
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

const updateCell = protectedProcedure
  .input(
    z.object({
      rowId: z.string(), // a rowId is provided by the client so it can optimistically update the client correctly
      tableId: z.string(),
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

      if (expectedType === "text" && !z.string().safeParse(cellValue).success) {
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
  });

export default updateCell;
