import { createTRPCRouter } from "@/server/api/trpc";
import getTableByView from "./queries/getTableByView";
import createEmptyRow from "./mutations/createEmptyRow";
import addColumn from "./mutations/addColumn";
import updateCell from "./mutations/updateCell";
import getViews from "./queries/getViews";
import createNewView from "./mutations/createNewView";
import updateViewName from "./mutations/updateViewName";
import addSort from "./mutations/sorts/addSort";
import getSorts from "./mutations/sorts/getSorts";
import {
  updateSortColumn,
  updateSortOrder,
  updateSortPriority,
} from "./mutations/sorts/updateSort";
import removeSort from "./mutations/sorts/removeSort";
import updateIsHiddenColumn from "./mutations/display/hideColumn";
import addRandomRows from "./mutations/addRandomRows";
import getFilters from "./mutations/filters/getFilters";
import updateFilters from "./mutations/filters/updateFilters";

export const tableRouter = createTRPCRouter({
  get: getTableByView,
  createEmptyRow,
  addColumn,
  updateCell,
  getViews,
  createNewView,
  updateViewName,
  addSort,
  getSorts,
  updateSortOrder,
  updateSortPriority,
  updateSortColumn,
  removeSort,
  updateIsHiddenColumn,
  addRandomRows,
  updateFilters,
  getFilters,
});
