import z from "zod";

export const groupOperator = z.enum(["and", "or"]);

export const Filter = z.object({
  columnId: z.string(),
  columnType: z.enum(["text", "number"]),
  operator: z.enum([
    "gt",
    "lt",
    "contains",
    "not-contains",
    "equal-to",
    "is-empty",
    "is-not-empty",
  ]),
  groupOperator: z.enum(["first-condition", "and", "or"]),
  value: z.union([z.string(), z.number()]),
});

// save this as jsonb to db
export const ConditionGroups = z.record(
  z.string(),
  z.object({
    groupOperator: groupOperator,
    conditions: z.array(z.union([z.string(), Filter])),
  }),
);
