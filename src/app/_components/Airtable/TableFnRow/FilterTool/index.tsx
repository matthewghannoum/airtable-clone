import { Button } from "@/components/ui/button";
import { ListFilter, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect } from "react";
import type { Column } from "../../../types";
import { useConditions } from "./ConditionsStore";
import ConditionGroup from "./ConditionGroup";
import type { ConditionTree, Filters } from "./types";
import { api } from "@/trpc/react";

// function groupHasFilter(conditionTree: ConditionTree, groupId: string) {
//   const { conditions } = conditionTree[groupId]!;

//   const filters = conditions.filter(
//     (condition) => !condition.includes("group-id:"),
//   );

//   if (filters.length > 0) return true;

//   const groups = conditions.filter((condition) =>
//     condition.includes("group-id:"),
//   );

//   for (const groupId of groups) {
//     return groupHasFilter(conditionTree, groupId);
//   }

//   return false;
// }

// function getCompletedConditions(
//   conditionTree: ConditionTree,
//   filters: Filters,
// ) {
//   const completedFilters = Object.fromEntries(
//     Object.entries(filters).filter(
//       ([_, filter]) =>
//         filter.value !== "" ||
//         filter.operator === "is-empty" ||
//         filter.operator === "is-not-empty",
//     ),
//   );

//   const removeGroupIds: string[] = [];

//   for (const groupId of Object.keys(conditionTree)) {
//     const hasFilters = groupHasFilter(conditionTree, "root");

//     // remove the group id as a condition from other condition groups
//     if (!hasFilters) {
//       removeGroupIds.push(groupId);

//       for (const [groupId2, { conditions }] of Object.entries(conditionTree)) {
//         if (groupId === groupId2) continue;

//         conditionTree[groupId2]!.conditions = conditions.filter(
//           (conditionId) => conditionId !== groupId,
//         );
//       }
//     }
//   }

//   // remove the group id from the tree
//   const completedContionTree = Object.fromEntries(
//     Object.entries(conditionTree).filter(
//       ([key]) => !removeGroupIds.includes(key),
//     ),
//   );

//   return {
//     completedFilters,
//     completedContionTree,
//   };
// }

export default function FilterTool({
  viewId,
  columns,
}: {
  viewId: string;
  columns: Column[];
}) {
  const { data: filterData } = api.table.getFilters.useQuery({ viewId });
  const updateFilters = api.table.updateFilters.useMutation();

  const isInitConditions = useConditions((state) => state.isInit);
  const conditionTree = useConditions((state) => state.conditionTree);
  const filters = useConditions((state) => state.filters);

  const initConditions = useConditions((state) => state.init);
  const addCondition = useConditions((state) => state.addCondition);
  const createNewConditionGroup = useConditions(
    (state) => state.createNewConditionGroup,
  );

  useEffect(() => {
    if (filterData) {
      if (filterData === "no filters") {
        initConditions(columns, undefined, undefined);
        addCondition("root");
        return;
      }

      const { conditionTree, filters } = filterData;
      initConditions(columns, conditionTree, filters);
    }
  }, [filterData, columns]);

  useEffect(() => {
    if (isInitConditions) {
      updateFilters.mutate({
        viewId,
        conditionTree,
        filters,
      });
    }
  }, [conditionTree, filters]);

  return (
    <Popover>
      <PopoverTrigger className="ml-2 cursor-pointer">
        <Button variant="ghost">
          <div className="flex items-center justify-center gap-2">
            <ListFilter size={20} />
            <p>Filter</p>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-full min-w-md">
        <div className="flex flex-col items-start justify-start gap-2">
          <div className="flex w-full items-center justify-start gap-2">
            <p className="text-sm font-medium">In this view, show records</p>
          </div>

          <hr className="w-full" />

          <div className="flex w-full flex-col items-start justify-start gap-3">
            <ConditionGroup columns={columns} />

            <div>
              <Button
                variant="ghost"
                className="text-sm font-normal text-gray-500"
                onClick={() => addCondition("root")}
              >
                <div className="flex items-center justify-center gap-2">
                  <Plus size={5} />
                  <p>Add condition</p>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="text-sm font-normal text-gray-500"
                onClick={() => createNewConditionGroup("root")}
              >
                <div className="flex items-center justify-center gap-2">
                  <Plus size={5} />
                  <p>Add condition group</p>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
