import { protectedProcedure } from "@/server/api/trpc";
import { airtableColumns, airtableRows } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import z from "zod";
import { faker } from "@faker-js/faker";
import getMaxInsertionOrder from "../utils/getMaxInsertOrder";
import { env } from "@/env";

const addRandomRows = protectedProcedure
  .input(
    z.object({
      tableId: z.string(),
      numRows: z.number().int().gte(1).lte(100000),
    }),
  )
  .mutation(async ({ ctx, input: { tableId, numRows } }) => {
    const adminUsers = env.ADMIN_USERS?.split(", ") ?? [];

    const userEmail = ctx.session.user.email;

    if (
      userEmail &&
      !adminUsers.includes(userEmail) &&
      env.NODE_ENV !== "development"
    )
      throw Error("User does not have permission to use this feature.");

    const startTime = Date.now();

    const columns = await ctx.db
      .select()
      .from(airtableColumns)
      .where(eq(airtableColumns.airtableId, tableId));

    const columnNames = columns.map(({ name }) => name);

    const nameColumns = columnNames.filter((name) =>
      name.toLowerCase().includes("name"),
    );
    const largeTextColumns = columnNames.filter((name) =>
      name.toLowerCase().includes("notes"),
    );
    const emailColumns = columnNames.filter((name) =>
      name.toLowerCase().includes("email"),
    );

    const randomRowsBatches: Record<string, string | number>[][] = [[]];

    const batchSize = 10000;

    for (let i = 1; i <= numRows; i++) {
      if (i % batchSize === 0) randomRowsBatches.push([]);

      const randomRow: Record<string, string | number> = {};

      for (const { id, name, type } of columns) {
        if (type === "number") {
          randomRow[id] = faker.number.int({
            min: name.toLowerCase().includes("number") ? 1 : -1000,
            max: 1000,
          });
          continue;
        }

        if (nameColumns.includes(name)) {
          randomRow[id] = faker.person.fullName();
        } else if (largeTextColumns.includes(name)) {
          randomRow[id] = faker.lorem.lines({ min: 1, max: 10 });
        } else if (emailColumns.includes(name)) {
          randomRow[id] = faker.internet.email();
        } else {
          randomRow[id] = faker.lorem.words({ min: 1, max: 5 });
        }
      }

      randomRowsBatches[randomRowsBatches.length - 1]?.push(randomRow);
    }

    const maxInsertionOrder = await getMaxInsertionOrder(ctx.db, tableId);

    for (const [i, randomRows] of randomRowsBatches.entries()) {
      await ctx.db.insert(airtableRows).values(
        randomRows.map((randomRow, index) => ({
          values: randomRow,
          airtableId: tableId,
          insertionOrder: batchSize * i + maxInsertionOrder + index + 1,
        })),
      );
    }

    const endTime = Date.now();

    const executionTime = Math.round((endTime - startTime) / 1000);

    console.log(
      `Generated and inserted ${numRows} random rows in: ${executionTime} seconds.`,
    );
  });

export default addRandomRows;
