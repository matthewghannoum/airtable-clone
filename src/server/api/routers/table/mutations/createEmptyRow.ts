import { protectedProcedure } from "@/server/api/trpc";
import { airtableColumns, airtableRows } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import z from "zod";

const createEmptyRow = protectedProcedure
  .input(
    z.object({
      rowId: z.string(), // a rowId is provided by the client so it can optimistically update the client correctly
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
        id: input.rowId,
        airtableId: input.tableId,
        values,
      })
      .returning();

    return newRow;
  });

export default createEmptyRow;
