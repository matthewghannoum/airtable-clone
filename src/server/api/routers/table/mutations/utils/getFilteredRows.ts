// import { airtableRows } from "@/server/db/schema";
// import { and, or, type SQL, sql } from "drizzle-orm";
// import type z from "zod";
// import type { ConditionGroups } from "./utils/FilterSchemas";

// const operatorSqlMap = {
//   gt: (columnId: string, val: unknown) =>
//     sql`${airtableRows}->>${sql.raw(columnId)} > ${val}`,
//   lt: (columnId: string, val: unknown) =>
//     sql`${airtableRows}->>${sql.raw(columnId)} < ${val}`,
//   contains: (columnId: string, val: unknown) =>
//     sql`${airtableRows}->>${sql.raw(columnId)} LIKE ${val}`,
//   "not-contains": (columnId: string, val: unknown) =>
//     sql`NOT ${airtableRows}->>${sql.raw(columnId)} LIKE ${val}`,
//   "equal-to": (columnId: string, val: unknown) =>
//     sql`${airtableRows}->>${sql.raw(columnId)} = ${val}`,
//   "is-empty": (columnId: string, _: unknown) =>
//     // or(eq(field, ""), isNull(field)),
//     sql`${airtableRows}->>${sql.raw(columnId)} = ${""} OR ${airtableRows}->>${sql.raw(columnId)} IS NULL`,
//   "is-not-empty": (columnId: string, _: unknown) =>
//     sql`${airtableRows}->>${sql.raw(columnId)} != ${""} AND ${airtableRows}->>${sql.raw(columnId)} IS NOT NULL`,
// };

// const maxDepth = 100;

// function getFilters(
//   conditionGroups: z.infer<typeof ConditionGroups>,
//   parentNodeId = "root",
//   depth = 1,
// ) {
//   if (depth >= maxDepth) throw new Error("Max filter depth exceeded");

//   const conditionGroup = conditionGroups[parentNodeId]!;
//   const sqlFilters: (SQL | undefined)[] = [];

//   for (const condition of conditionGroup.conditions) {
//     if (typeof condition === "string") {
//       const groupId = condition;
//       sqlFilters.push(getFilters(conditionGroups, groupId, depth + 1));

//       continue;
//     }

//     const { columnId, operator, value } = condition;

//     const filter = operatorSqlMap[operator](columnId, value);

//     sqlFilters.push(filter);
//   }

//   if (conditionGroup.groupOperator === "and") return and(...sqlFilters);
//   return or(...sqlFilters);
// }
