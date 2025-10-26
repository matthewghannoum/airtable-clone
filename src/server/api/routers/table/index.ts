import { createTRPCRouter } from "@/server/api/trpc";
import getTableByView from "./queries/getTableByView";
import createEmptyRow from "./mutations/createEmptyRow";
import updateSorts from "./mutations/updateSorts";
import addColumn from "./mutations/addColumn";
import updateCell from "./mutations/updateCell";
import getViews from "./queries/getViews";
import createNewView from "./mutations/createNewView";
import updateViewName from "./mutations/updateViewName";

export const tableRouter = createTRPCRouter({
  get: getTableByView,
  createEmptyRow,
  updateSorts,
  addColumn,
  updateCell,
  getViews,
  createNewView,
  updateViewName,
});
