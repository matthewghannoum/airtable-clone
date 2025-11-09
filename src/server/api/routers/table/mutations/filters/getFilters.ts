import { protectedProcedure } from "@/server/api/trpc";
import z from "zod";
import getFilterData from "../../utils/getFilterData";

const getFilters = protectedProcedure
  .input(z.object({ viewId: z.string() }))
  .query(async ({ ctx, input: { viewId } }) => {
    return await getFilterData(ctx.db, viewId);
  });

export default getFilters;
