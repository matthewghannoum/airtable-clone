import { protectedProcedure } from "@/server/api/trpc";
import { viewFilters } from "@/server/db/schema";
import { count, eq } from "drizzle-orm";
import z from "zod";

const Condition = z.object({
  columnId: z.string(),
  columnType: z.string(),
  operator: z.string(),
  value: z.union([z.string(), z.number()]),
});

const ConditionGroup = z.object({
  conditions: z.array(z.string()),
  groupOperator: z.enum(["and", "or"]),
});

const ConditionTree = z.record(z.string(), ConditionGroup);

const Filters = z.record(z.string(), Condition);

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
