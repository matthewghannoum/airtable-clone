import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  airtableColumns,
  airtableRows,
  airtables,
  bases,
} from "@/server/db/schema";
import { count, eq } from "drizzle-orm";

import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "@/server/db/schema";

type DB = PostgresJsDatabase<typeof schema>;
type Tx = Parameters<Parameters<DB["transaction"]>[0]>[0];

async function addNewTable(baseId: string, tableName: string, db: DB) {
  const tableId = await db.transaction(async (tx) => {
    const [airtableRow] = await tx
      .insert(airtables)
      .values({
        name: tableName,
        baseId,
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

    return airtableRow.id;
  });

  return tableId;
}

export const basesRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx.session;

    const userId = user.id;

    if (typeof userId !== "string") {
      throw new Error("No user ID in session");
    }

    const { baseId, tableId } = await ctx.db.transaction(async (tx) => {
      // Type assertion for the returned row, adjust as per your schema
      const [baseRow] = await tx
        .insert(bases)
        .values({
          name: "Untitled Base",
          ownerId: userId,
        })
        .returning();

      if (!baseRow) {
        throw new Error("Failed to create base");
      }

      const airtableId = await addNewTable(baseRow.id, "Table 1", tx);

      return { baseId: baseRow.id, tableId: airtableId };
    });

    return { baseId, tableId };
  }),
  updateName: protectedProcedure
    .input(
      z.object({
        baseId: z.string(),
        name: z.string().min(1).max(255),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, baseId } = input;

      const result = await ctx.db
        .update(bases)
        .set({ name })
        .where(eq(bases.id, baseId))
        .returning();

      if (result.length === 0) {
        throw new Error("Base not found or you do not have permission to edit");
      }

      return result[0];
    }),
  addTable: protectedProcedure
    .input(
      z.object({
        baseId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { baseId } = input;

      const tableId = await ctx.db.transaction(async (tx: Tx) => {
        const [countRow] = await ctx.db
          .select({ count: count(airtables.id) })
          .from(airtables)
          .where(eq(airtables.baseId, baseId));

        if (!countRow) {
          throw new Error("Base not found");
        }

        const tableId = await addNewTable(
          baseId,
          `Table ${countRow.count + 1}`,
          tx,
        );

        return tableId;
      });

      return { tableId };
    }),
});
