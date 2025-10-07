import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { airtableColumns, airtables, bases } from "@/server/db/schema";

export const basesRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx.session;

    const baseId = await ctx.db.transaction(async (tx) => {
      // Type assertion for the returned row, adjust as per your schema
      const [baseRow] = await tx
        .insert(bases)
        .values({
          name: "Untitled Base",
          ownerId: user.id,
        })
        .returning();

      if (!baseRow) {
        throw new Error("Failed to create base");
      }

      await tx.insert(airtables).values({
        name: "Table 1",
        baseId: baseRow.id,
      });

      await tx.insert(airtableColumns).values([
        {
          name: "Name",
          type: "text",
          displayOrderNum: 1,
          airtableId: baseRow.id,
        },
        {
          name: "Notes",
          type: "text",
          displayOrderNum: 2,
          airtableId: baseRow.id,
        },
        {
          name: "Number of PRs",
          type: "number",
          displayOrderNum: 3,
          airtableId: baseRow.id,
        },
      ]);

      return baseRow.id;
    });

    return baseId;
  }),
});
