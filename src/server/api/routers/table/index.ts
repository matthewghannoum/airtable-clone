import { createTRPCRouter } from "@/server/api/trpc";
import getTable from "./queries/getTable";
import createEmptyRow from "./mutations/createEmptyRow";
import updateSorts from "./mutations/updateSorts";
import addColumn from "./mutations/addColumn";
import updateCell from "./mutations/updateCell";

export const tableRouter = createTRPCRouter({
  get: getTable,
  createEmptyRow,
  updateSorts,
  addColumn,
  updateCell,
});
