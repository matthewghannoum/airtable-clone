import { protectedProcedure } from "@/server/api/trpc";
import { airtableColumns } from "@/server/db/schema";
import { eq, max, sql } from "drizzle-orm";
import z from "zod";

const addColumn = protectedProcedure
  .input(
    z.object({
      columnId: z.string(),
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
        id: input.columnId,
        airtableId: input.tableId,
        name: input.name,
        type: input.type,
        displayOrderNum: sql`COALESCE((${maxOrderNum}), 0) + 1`,
      })
      .returning();

    return newColumn;
  });

export default addColumn;
