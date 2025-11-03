import { protectedProcedure } from "@/server/api/trpc";
import { airtableColumns, airtableRows } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import z from "zod";
import { faker } from "@faker-js/faker";

const addRandomRows = protectedProcedure
  .input(
    z.object({
      tableId: z.string(),
      numRows: z.number().int().gte(1).lte(100000),
    }),
  )
  .mutation(async ({ ctx, input: { tableId, numRows } }) => {
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

    const randomRows: Record<string, string | number>[] = [];

    for (let i = 1; i <= numRows; i++) {
      const randomRow: Record<string, string | number> = {};

      for (const { id, name, type } of columns) {
        if (type === "number") {
          randomRow[id] = faker.number.int({ min: -1000, max: 1000 });
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

      randomRows.push(randomRow);
    }

    await ctx.db.insert(airtableRows).values(
      randomRows.map((randomRow) => ({
        values: randomRow,
        airtableId: tableId,
      })),
    );

    const endTime = Date.now();

    const executionTime = Math.round((endTime - startTime) / 1000);

    console.log(
      `Generated and inserted ${numRows} random rows in: ${executionTime} seconds.`,
    );
  });

export default addRandomRows;
