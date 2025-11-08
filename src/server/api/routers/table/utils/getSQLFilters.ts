import { airtableRows } from "@/server/db/schema";
import { and, or, type SQL, sql } from "drizzle-orm";
import type z from "zod";
import type { ConditionTree, Filters } from "../mutations/filters/InputSchemas";

const operatorSqlMap = {
  gt: (columnId: string, val: unknown) =>
    sql`(${airtableRows.values}->>'${sql.raw(columnId)}')::NUMERIC > ${val}`,
  lt: (columnId: string, val: unknown) =>
    sql`(${airtableRows.values}->>'${sql.raw(columnId)}')::NUMERIC < ${val}`,
  contains: (columnId: string, val: unknown) =>
    sql`${airtableRows.values}->>'${sql.raw(columnId)}' LIKE ${`%${val as string}%`}`,
  "not-contains": (columnId: string, val: unknown) =>
    sql`NOT ${airtableRows.values}->>'${sql.raw(columnId)}' LIKE ${`%${val as string}%`}`,
  "equal-to": (columnId: string, val: unknown) =>
    sql`${airtableRows.values}->>'${sql.raw(columnId)}' = ${val}`,
  "is-empty": (columnId: string, _: unknown) =>
    sql`${airtableRows.values}->>'${sql.raw(columnId)}' = ${""} OR ${airtableRows.values}->>'${sql.raw(columnId)}' IS NULL`,
  "is-not-empty": (columnId: string, _: unknown) =>
    sql`${airtableRows.values}->>'${sql.raw(columnId)}' != ${""} AND ${airtableRows.values}->>'${sql.raw(columnId)}' IS NOT NULL`,
};

const maxDepth = 100;

export default function getSQLFilters(
  conditionTree: z.infer<typeof ConditionTree>,
  filters: z.infer<typeof Filters>,
  parentNodeId = "root",
  depth = 1,
) {
  if (depth >= maxDepth) throw new Error("Max filter depth exceeded");

  const conditionGroup = conditionTree[parentNodeId]!;
  const sqlFilters: (SQL | undefined)[] = [];

  for (const conditionId of conditionGroup.conditions) {
    if (conditionId.includes("group-id:")) {
      sqlFilters.push(
        getSQLFilters(conditionTree, filters, conditionId, depth + 1),
      );
      continue;
    }

    const { columnId, operator, value } = filters[conditionId]!;

    const filter = operatorSqlMap[operator](columnId, value);

    sqlFilters.push(filter);
  }

  if (conditionGroup.groupOperator === "and") return and(...sqlFilters);
  return or(...sqlFilters);
}
