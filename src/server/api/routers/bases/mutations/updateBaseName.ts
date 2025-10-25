import { z } from "zod";
import { protectedProcedure } from "@/server/api/trpc";
import { bases } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const updateBaseName = protectedProcedure
  .input(
    z.object({
      baseId: z.string(),
      name: z.string().min(1).max(255),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { name, baseId } = input;

    const result = await ctx.db
      .update(bases)
      .set({ name })
      .where(eq(bases.id, baseId))
      .returning();

    if (result.length === 0) {
      throw new Error("Base not found or you do not have permission to edit");
    }

    return result[0];
  });

export default updateBaseName;
