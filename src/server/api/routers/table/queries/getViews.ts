import { protectedProcedure } from "@/server/api/trpc";
import { airtableViews } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import z from "zod";

const getViews = protectedProcedure
  .input(z.object({ tableId: z.string() }))
  .query(async ({ ctx, input }) => {
    const views = await ctx.db
      .select()
      .from(airtableViews)
      .where(eq(airtableViews.airtableId, input.tableId));

    return views;
  });

export default getViews;
