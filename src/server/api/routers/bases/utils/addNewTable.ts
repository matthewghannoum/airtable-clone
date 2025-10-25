import { airtableColumns, airtableRows, airtables } from "@/server/db/schema";
import type { DB } from "../../../types";

export default async function addNewTable(
  baseId: string,
  tableName: string,
  db: DB,
  tableId: string | undefined = undefined,
) {
  const returnedTableId = await db.transaction(async (tx) => {
    const [airtableRow] = await tx
      .insert(airtables)
      .values({
        ...(tableId && { id: tableId }),
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

  return returnedTableId;
}
