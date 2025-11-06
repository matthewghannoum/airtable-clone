import { protectedProcedure } from "@/server/api/trpc";
import z from "zod";
import { ConditionGroups } from "./utils/FilterSchemas";

const addFilters = protectedProcedure
  .input(
    z.object({
      tableId: z.string(),
      viewId: z.string(),
      conditionGroups: ConditionGroups,
    }),
  )
  .mutation(({ ctx, input }) => {});

export default addFilters;
