import { protectedProcedure } from "@/server/api/trpc";
import { airtableColumns, airtableRows } from "@/server/db/schema";
import { and, eq, sql } from "drizzle-orm";
import z from "zod";

const searchDisplayOrder = protectedProcedure
  .input(
    z.object({
      tableId: z.string(),
      columnId: z.string(),
      value: z.string().trim().min(1),
    }),
  )
  .query(async ({ ctx, input }) => {
    const [column] = await ctx.db
      .select({ id: airtableColumns.id })
      .from(airtableColumns)
      .where(
        and(
          eq(airtableColumns.id, input.columnId),
          eq(airtableColumns.airtableId, input.tableId),
        ),
      )
      .limit(1);

    if (!column) {
      return { displayOrderNumber: null } as const;
    }

    const searchPattern = `%${input.value}%`;

    const [match] = await ctx.db
      .select({ displayOrderNumber: airtableRows.insertionOrder })
      .from(airtableRows)
      .where(
        and(
          eq(airtableRows.airtableId, input.tableId),
          sql`${airtableRows.values} ->> ${input.columnId} ILIKE ${searchPattern}`,
        ),
      )
      .orderBy(airtableRows.insertionOrder)
      .limit(1);

    return {
      displayOrderNumber: match?.displayOrderNumber ?? null,
    } as const;
  });

export default searchDisplayOrder;
