import type { DB } from "@/server/api/types";
import { viewFilters } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { ConditionTree, Filters } from "../mutations/filters/InputSchemas";

export default async function getFilterData(db: DB, viewId: string) {
  const [filterRow] = await db
    .select()
    .from(viewFilters)
    .where(eq(viewFilters.viewId, viewId));

  if (!filterRow) return "no filters";

  const conditionTree = ConditionTree.parse(filterRow?.conditionTree);
  const filters = Filters.parse(filterRow?.filters);

  return { conditionTree, filters };
}
