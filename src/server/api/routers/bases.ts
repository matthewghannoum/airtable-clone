import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { airtables, bases } from "@/server/db/schema";

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

      return baseRow.id;
    });

    return baseId;
  }),
});
