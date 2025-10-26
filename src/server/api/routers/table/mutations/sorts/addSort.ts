import { protectedProcedure } from "@/server/api/trpc";
import { viewSorts } from "@/server/db/schema";
import { count, eq } from "drizzle-orm";
import z from "zod";

const addSort = protectedProcedure
  .input(
    z.object({
      viewId: z.string(),
      settingId: z.string(),
      columnId: z.string(),
      columnType: z.enum(["text", "number"]),
    }),
  )
  .mutation(async ({ ctx, input: { viewId, settingId, columnId } }) => {
    const [numSorts] = await ctx.db
      .select({ count: count() })
      .from(viewSorts)
      .where(eq(viewSorts.viewId, viewId));

    if (!numSorts) {
      throw Error("Could not count the number of sorts.");
    }

    await ctx.db.insert(viewSorts).values({
      id: settingId,
      viewId,
      columnId,
      sortOrder: "asc",
      sortPriority: numSorts.count + 1,
    });
  });

export default addSort;
