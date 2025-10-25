import { protectedProcedure } from "@/server/api/trpc";
import { airtableColumns } from "@/server/db/schema";
import { and, eq, sql } from "drizzle-orm";
import z from "zod";

const updateSorts = protectedProcedure
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
  });

export default updateSorts;
