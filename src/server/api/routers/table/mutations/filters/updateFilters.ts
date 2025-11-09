import { protectedProcedure } from "@/server/api/trpc";
import { viewFilters } from "@/server/db/schema";
import { count, eq } from "drizzle-orm";
import z from "zod";
import { ConditionTree, Filters } from "./InputSchemas";

const updateFilters = protectedProcedure
  .input(
    z.object({
      viewId: z.string(),
      conditionTree: ConditionTree,
      filters: Filters,
    }),
  )
  .mutation(async ({ ctx, input: { viewId, conditionTree, filters } }) => {
    const [filterRows] = await ctx.db
      .select({ count: count(viewFilters.viewId) })
      .from(viewFilters)
      .where(eq(viewFilters.viewId, viewId));

    if (filterRows && filterRows.count > 0) {
      await ctx.db
        .update(viewFilters)
        .set({
          conditionTree,
          filters,
        })
        .where(eq(viewFilters.viewId, viewId));
      return;
    }

    await ctx.db.insert(viewFilters).values({
      viewId,
      conditionTree,
      filters,
    });
  });

export default updateFilters;
