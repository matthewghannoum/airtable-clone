import type { DB } from "@/server/api/types";
import { airtableRows } from "@/server/db/schema";
import { eq, max } from "drizzle-orm";

export default async function getMaxInsertionOrder(db: DB, tableId: string) {
  const [row] = await db
    .select({
      maxOrder: max(airtableRows.insertionOrder),
    })
    .from(airtableRows)
    .where(eq(airtableRows.airtableId, tableId));

  return row?.maxOrder ?? 0;
}
