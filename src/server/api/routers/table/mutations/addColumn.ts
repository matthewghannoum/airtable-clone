import { protectedProcedure } from "@/server/api/trpc";
import { airtableColumns, viewDisplaySettings } from "@/server/db/schema";
import { sql } from "drizzle-orm";
import z from "zod";

const addColumn = protectedProcedure
  .input(
    z.object({
      columnId: z.string(),
      tableId: z.string(),
      viewId: z.string(),
      name: z.string().min(1).max(100),
      type: z.enum(["text", "number"]),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    await ctx.db.insert(airtableColumns).values({
      id: input.columnId,
      airtableId: input.tableId,
      name: input.name,
      type: input.type,
    });

    await ctx.db.insert(viewDisplaySettings).values({
      viewId: input.viewId,
      columnId: input.columnId,
      displayOrderNum: sql`(SELECT COUNT(*) + 1 FROM ${viewDisplaySettings} WHERE ${viewDisplaySettings.viewId} = ${input.viewId})`,
    });
  });

export default addColumn;
