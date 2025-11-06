import { protectedProcedure } from "@/server/api/trpc";
import z from "zod";

const groupOperator = z.enum(["and", "or"]);

const Condition = z.object({
  columnId: z.string(),
  columnType: z.enum(["text", "number"]),
  operator: z.enum([
    "ge",
    "le",
    "contains",
    "not-contains",
    "equal-to",
    "is-empty",
    "is-not-empty",
  ]),
  groupOperator: z.enum(["first-condition", "and", "or"]),
  value: z.union([z.string(), z.number()]),
});

const ConditionTreeComponent = z.record(groupOperator, z.array(Condition));

const ConditionTree = z.record(
  groupOperator,
  z.object({
    node: z.union([ConditionTreeComponent, groupOperator]),
    nodeType: z.enum(["node", "leaf"]),
  }),
);

const maxDepth = 100;

const addFilters = protectedProcedure
  .input(
    z.object({
      tableId: z.string(),
      viewId: z.string(),
      conditionTree: ConditionTree,
    }),
  )
  .query(({ ctx, input }) => {});

export default addFilters;
