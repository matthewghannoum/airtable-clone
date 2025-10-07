import { airtableColumns, airtableRows } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const tableRouter = createTRPCRouter({
  getColumns: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .query(async ({ ctx, input }) => {
      const columns = await ctx.db
        .select()
        .from(airtableColumns)
        .where(eq(airtableColumns.airtableId, input.tableId));
      return columns;
    }),
  getRows: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select({ values: airtableRows.values })
        .from(airtableRows)
        .where(eq(airtableRows.airtableId, input.tableId));

      return rows.map((row) => row.values);
    }),
});
