import { protectedProcedure } from "@/server/api/trpc";
import { viewFilters } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import z from "zod";
import { ConditionTree, Filters } from "./InputSchemas";

const getFilters = protectedProcedure
  .input(z.object({ viewId: z.string() }))
  .query(async ({ ctx, input: { viewId } }) => {
    const [filterRow] = await ctx.db
      .select()
      .from(viewFilters)
      .where(eq(viewFilters.viewId, viewId));

    const conditionTree = ConditionTree.parse(filterRow?.conditionTree);
    const filters = Filters.parse(filterRow?.filters);

    return { conditionTree, filters };
  });

export default getFilters;
