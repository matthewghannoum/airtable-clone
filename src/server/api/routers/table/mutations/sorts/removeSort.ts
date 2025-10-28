import { protectedProcedure } from "@/server/api/trpc";
import { viewSorts } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import z from "zod";

const removeSort = protectedProcedure
  .input(
    z.object({
      settingId: z.string(),
      viewId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input: { settingId } }) => {
    await ctx.db.delete(viewSorts).where(eq(viewSorts.id, settingId));
  });

export default removeSort;
