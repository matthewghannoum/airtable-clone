import { protectedProcedure } from "@/server/api/trpc";
import { viewSorts } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import z from "zod";

const updateSortOrder = protectedProcedure
  .input(
    z.object({ settingId: z.string(), sortOrder: z.enum(["asc", "desc"]) }),
  )
  .mutation(async ({ ctx, input: { settingId, sortOrder } }) => {
    await ctx.db
      .update(viewSorts)
      .set({ sortOrder })
      .where(eq(viewSorts.id, settingId));
  });

const updateSortColumn = protectedProcedure
  .input(z.object({ settingId: z.string(), columnId: z.string() }))
  .mutation(async ({ ctx, input: { settingId, columnId } }) => {
    await ctx.db
      .update(viewSorts)
      .set({ columnId })
      .where(eq(viewSorts.id, settingId));
  });

const updateSortPriority = protectedProcedure
  .input(z.array(z.object({ settingId: z.string(), sortPriority: z.number() })))
  .mutation(async ({ ctx, input }) => {
    await Promise.all(
      input.map(({ settingId, sortPriority }) =>
        ctx.db
          .update(viewSorts)
          .set({ sortPriority })
          .where(eq(viewSorts.id, settingId)),
      ),
    );
  });

export { updateSortOrder, updateSortPriority, updateSortColumn };
