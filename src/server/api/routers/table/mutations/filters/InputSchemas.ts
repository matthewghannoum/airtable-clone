import z from "zod";

export const Condition = z.object({
  columnId: z.string(),
  columnType: z.enum(["text", "number"]),
  operator: z.string(),
  value: z.union([z.string(), z.number()]),
});

export const ConditionGroup = z.object({
  conditions: z.array(z.string()),
  groupOperator: z.enum(["and", "or"]),
});

export const ConditionTree = z.record(z.string(), ConditionGroup);

export const Filters = z.record(z.string(), Condition);
