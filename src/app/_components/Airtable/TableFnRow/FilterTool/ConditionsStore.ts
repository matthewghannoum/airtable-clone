import { create } from "zustand";
import type { ConditionsState } from "./types";

export const useConditions = create<ConditionsState>()((set) => ({
  conditionTree: { root: { conditions: [], groupOperator: "and" } },
  filters: {},
  addCondition: (groupId, condition) => {
    const conditionId = crypto.randomUUID();

    // condition can be a base condition/filter or a condition group
    set((s) => ({
      conditionTree: {
        ...s.conditionTree,
        [groupId]: {
          conditions: [
            ...(s.conditionTree[groupId]?.conditions ?? []),
            conditionId,
          ],
          groupOperator: s.conditionTree[groupId]?.groupOperator ?? "and",
        },
      },
    }));

    set((s) => ({
      filters: { ...s.filters, [conditionId]: condition },
    }));
  },
  createNewConditionGroup: (parentGroupId, groupOperator) => {
    const groupId = `group-id:${crypto.randomUUID()}`;

    set((s) => ({
      conditionTree: {
        ...s.conditionTree,
        [groupId]: {
          conditions: [],
          groupOperator: groupOperator,
        },
        [parentGroupId]: {
          conditions: [
            ...(s.conditionTree[parentGroupId]?.conditions ?? []),
            groupId,
          ],
          groupOperator: s.conditionTree[parentGroupId]?.groupOperator ?? "and",
        },
      },
    }));

    return groupId;
  },
  updateFilter: (conditionId, updatedCondition) => {
    set((s) => ({
      filters: { ...s.filters, [conditionId]: updatedCondition },
    }));
  },
}));
