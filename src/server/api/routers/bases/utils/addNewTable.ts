import {
  airtableColumns,
  airtableRows,
  airtables,
  airtableViews,
  viewDisplaySettings,
  viewFilters,
} from "@/server/db/schema";
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
          airtableId: airtableRow.id,
        },
        {
          name: "Notes",
          type: "text",
          airtableId: airtableRow.id,
        },
        {
          name: "Number of PRs",
          type: "number",
          airtableId: airtableRow.id,
        },
      ])
      .returning();

    const [defaultView] = await tx
      .insert(airtableViews)
      .values({ name: "Table view", airtableId: airtableRow.id })
      .returning();

    if (!defaultView) {
      throw new Error("Failed to create the default view");
    }

    const nameId = columnRows.find((col) => col.name === "Name")?.id;
    const notesId = columnRows.find((col) => col.name === "Notes")?.id;
    const numberOfPrsId = columnRows.find(
      (col) => col.name === "Number of PRs",
    )?.id;

    if (!nameId || !notesId || !numberOfPrsId) {
      throw new Error("Failed to create columns");
    }

    await tx.insert(viewDisplaySettings).values([
      { viewId: defaultView.id, columnId: nameId, displayOrderNum: 1 },
      { viewId: defaultView.id, columnId: notesId, displayOrderNum: 2 },
      { viewId: defaultView.id, columnId: numberOfPrsId, displayOrderNum: 3 },
    ]);

    await tx.insert(viewFilters).values({
      viewId: defaultView.id,
      conditionTree: { root: { conditions: [], groupOperator: "and" } },
      filters: {},
    });

    await tx.insert(airtableRows).values([
      {
        airtableId: airtableRow.id,
        values: {
          [nameId]: "John Smith",
          [notesId]: "JS Dev.",
          [numberOfPrsId]: 5,
        },
        insertionOrder: 1,
      },
    ]);

    return airtableRow.id;
  });

  return returnedTableId;
}
