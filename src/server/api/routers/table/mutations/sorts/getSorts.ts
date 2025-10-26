import { protectedProcedure } from "@/server/api/trpc";
import { airtableColumns, viewSorts } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import z from "zod";

const getSorts = protectedProcedure
  .input(z.object({ viewId: z.string() }))
  .query(async ({ ctx, input: { viewId } }) => {
    const sorts = await ctx.db
      .select({
        id: viewSorts.id,
        viewId: viewSorts.viewId,
        columnId: viewSorts.columnId,
        sortOrder: viewSorts.sortOrder,
        sortPriority: viewSorts.sortPriority,
        columnType: airtableColumns.type,
      })
      .from(viewSorts)
      .innerJoin(airtableColumns, eq(viewSorts.columnId, airtableColumns.id))
      .where(eq(viewSorts.viewId, viewId));

    return sorts;
  });

export default getSorts;
