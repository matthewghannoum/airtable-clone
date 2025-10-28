import { protectedProcedure } from "@/server/api/trpc";
import { airtableViews } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import z from "zod";

const updateViewName = protectedProcedure
  .input(z.object({ viewId: z.string(), name: z.string() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.db
      .update(airtableViews)
      .set({ name: input.name })
      .where(eq(airtableViews.id, input.viewId));
  });

export default updateViewName;
