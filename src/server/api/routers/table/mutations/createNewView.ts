import { protectedProcedure } from "@/server/api/trpc";
import { airtableViews, viewFilters } from "@/server/db/schema";
import z from "zod";

const createNewView = protectedProcedure
  .input(z.object({ viewId: z.string(), tableId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.db.transaction(async (tx) => {
      await tx.insert(airtableViews).values({
        id: input.viewId,
        name: "Table view",
        airtableId: input.tableId,
      });

      await tx.insert(viewFilters).values({
        viewId: input.viewId,
        conditionTree: { root: { conditions: [], groupOperator: "and" } },
        filters: {},
      });
    });
  });

export default createNewView;
