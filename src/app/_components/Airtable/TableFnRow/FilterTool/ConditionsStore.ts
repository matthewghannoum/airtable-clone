import { create } from "zustand";
import type { ConditionsState } from "./types";

export const useConditions = create<ConditionsState>()((set) => ({
  conditionGroupMap: { root: { conditions: [], groupOperator: "and" } },
  addCondition: (groupId, condition) => {
    // condition can be a base condition/filter or a condition group
    set((s) => ({
      conditionGroupMap: {
        ...s.conditionGroupMap,
        [groupId]: {
          conditions: [
            ...(s.conditionGroupMap[groupId]?.conditions ?? []),
            condition,
          ],
          groupOperator: s.conditionGroupMap[groupId]?.groupOperator ?? "and",
        },
      },
    }));
  },
  createNewConditionGroup: (parentGroupId, groupOperator) => {
    const newGroupid = crypto.randomUUID();

    set((s) => ({
      conditionGroupMap: {
        ...s.conditionGroupMap,
        [newGroupid]: {
          conditions: [],
          groupOperator: groupOperator,
        },
        [parentGroupId]: {
          conditions: [
            ...(s.conditionGroupMap[parentGroupId]?.conditions ?? []),
            newGroupid,
          ],
          groupOperator:
            s.conditionGroupMap[parentGroupId]?.groupOperator ?? "and",
        },
      },
    }));

    return newGroupid;
  },
}));
