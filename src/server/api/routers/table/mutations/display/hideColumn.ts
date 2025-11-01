import { protectedProcedure } from "@/server/api/trpc";
import { viewDisplaySettings } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import z from "zod";

const updateIsHiddenColumn = protectedProcedure
  .input(
    z.object({
      viewId: z.string(),
      columnId: z.string(),
      isHidden: z.boolean(),
    }),
  )
  .mutation(async ({ input: { viewId, columnId, isHidden }, ctx }) => {
    await ctx.db
      .update(viewDisplaySettings)
      .set({ isHidden })
      .where(
        and(
          eq(viewDisplaySettings.viewId, viewId),
          eq(viewDisplaySettings.columnId, columnId),
        ),
      );
  });

export default updateIsHiddenColumn;
