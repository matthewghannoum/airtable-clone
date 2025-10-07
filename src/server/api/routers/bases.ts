import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  airtableColumns,
  airtableRows,
  airtables,
  bases,
} from "@/server/db/schema";

export const basesRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx.session;

    const { baseId, tableId } = await ctx.db.transaction(async (tx) => {
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

      const [airtableRow] = await tx
        .insert(airtables)
        .values({
          name: "Table 1",
          baseId: baseRow.id,
        })
        .returning();

      if (!airtableRow) {
        throw new Error("Failed to create airtable");
      }

      const columnRows = await tx
        .insert(airtableColumns)
        .values([
          {
            name: "Name",
            type: "text",
            displayOrderNum: 1,
            airtableId: airtableRow.id,
          },
          {
            name: "Notes",
            type: "text",
            displayOrderNum: 2,
            airtableId: airtableRow.id,
          },
          {
            name: "Number of PRs",
            type: "number",
            displayOrderNum: 3,
            airtableId: airtableRow.id,
          },
        ])
        .returning();

      const nameId = columnRows.find((col) => col.name === "Name")?.id;
      const notesId = columnRows.find((col) => col.name === "Notes")?.id;
      const numberOfPrsId = columnRows.find(
        (col) => col.name === "Number of PRs",
      )?.id;

      if (!nameId || !notesId || !numberOfPrsId) {
        throw new Error("Failed to create columns");
      }

      await tx.insert(airtableRows).values([
        {
          airtableId: airtableRow.id,
          values: {
            [nameId]: "John Smith",
            [notesId]: "JS Dev.",
            [numberOfPrsId]: 5,
          },
        },
      ]);

      return { baseId: baseRow.id, tableId: airtableRow.id };
    });

    return { baseId, tableId };
  }),
});
