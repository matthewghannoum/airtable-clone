import { protectedProcedure } from "@/server/api/trpc";
import { airtableViews } from "@/server/db/schema";
import z from "zod";

const createNewView = protectedProcedure
  .input(z.object({ viewId: z.string(), tableId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.db.insert(airtableViews).values({
      id: input.viewId,
      name: "Table view",
      airtableId: input.tableId,
    });
  });

export default createNewView;
