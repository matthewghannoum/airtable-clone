import { protectedProcedure } from "@/server/api/trpc";
import { viewColSettings } from "@/server/db/schema";
import { and, eq, sql } from "drizzle-orm";
import z from "zod";

const updateSorts = protectedProcedure
  .input(
    z.object({
      tableId: z.string(),
      viewId: z.string(),
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
    // update the sort order and priority of the specified columns for a given view
    for (const { columnId, sortOrder, sortPriority } of input.sorts) {
      await ctx.db
        .update(viewColSettings)
        .set({ sortOrder, sortPriority })
        .where(
          and(
            eq(viewColSettings.id, input.viewId),
            eq(viewColSettings.columnId, columnId),
          ),
        );
    }

    // if a column is not in the input sorts, clear its sortOrder and sortPriority
    if (input.sorts.length > 0) {
      await ctx.db
        .update(viewColSettings)
        .set({
          sortOrder: null,
          sortPriority: null,
        })
        .where(
          and(
            eq(viewColSettings.viewId, input.viewId),
            // airtableColumns.id not in input.sorts.map(s => s.columnId)
            sql`${viewColSettings.columnId} NOT IN (${sql.join(
              input.sorts.map((s) => sql`${s.columnId}`),
              sql`,`,
            )})`,
          ),
        );
    } else {
      await ctx.db
        .update(viewColSettings)
        .set({
          sortOrder: null,
          sortPriority: null,
        })
        .where(eq(viewColSettings.viewId, input.viewId));
    }
  });

export default updateSorts;
