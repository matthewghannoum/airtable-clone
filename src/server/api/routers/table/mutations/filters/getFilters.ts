import { protectedProcedure } from "@/server/api/trpc";
import { viewFilters } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import z from "zod";

const getFilters = protectedProcedure
  .input(z.object({ viewId: z.string() }))
  .query(async ({ ctx, input: { viewId } }) => {
    return await ctx.db
      .select()
      .from(viewFilters)
      .where(eq(viewFilters.viewId, viewId));
  });

export default getFilters;
