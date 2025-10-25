import { protectedProcedure } from "@/server/api/trpc";
import type { Tx } from "@/server/api/types";
import { airtables } from "@/server/db/schema";
import z from "zod";
import addNewTable from "../utils/addNewTable";
import { count, eq } from "drizzle-orm";

const addTableToBase = protectedProcedure
  .input(
    z.object({
      tableId: z.string(),
      baseId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const tableId = await ctx.db.transaction(async (tx: Tx) => {
      const [countRow] = await ctx.db
        .select({ count: count(airtables.id) })
        .from(airtables)
        .where(eq(airtables.baseId, input.baseId));

      if (!countRow) {
        throw new Error("Base not found");
      }

      const tableId = await addNewTable(
        input.baseId,
        `Table ${countRow.count + 1}`,
        tx,
        input.tableId,
      );

      return tableId;
    });

    return { tableId };
  });

export default addTableToBase;
