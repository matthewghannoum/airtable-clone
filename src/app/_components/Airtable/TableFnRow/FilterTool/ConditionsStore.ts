import { create } from "zustand";
import type { ConditionsState } from "./types";

export const useConditions = create<ConditionsState>()((set) => ({
  isInit: false,
  conditionTree: { root: { conditions: [], groupOperator: "and" } },
  filters: {},
  columns: [],
  // setColumns: (columns) => {
  //   set(() => ({
  //     columns,
  //   }));
  // },
  init: (columns, conditionTree, filters) => {
    set((s) => ({
      conditionTree: { ...(conditionTree ?? s.conditionTree) },
      filters: { ...(filters ?? s.filters) },
      columns,
      isInit: true,
    }));
  },
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

    set(({ filters, columns }) => ({
      filters: {
        ...filters,
        [conditionId]: condition ?? {
          columnId: columns[0]?.id ?? "",
          columnType: columns[0]?.type ?? "text",
          operator: columns[0]?.type === "number" ? "gt" : "contains",
          value: "",
        },
      },
    }));
  },
  createNewConditionGroup: (parentGroupId, optionalGroupOperator) => {
    const groupOperator = optionalGroupOperator ?? "and";
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
  removeFilter: (groupId, conditionId) => {
    set(({ filters, conditionTree }) => ({
      filters: Object.fromEntries(
        Object.entries(filters).filter(([key, _]) => key !== conditionId),
      ),
      conditionTree: {
        ...conditionTree,
        [groupId]: {
          ...conditionTree[groupId]!,
          conditions: conditionTree[groupId]!.conditions.filter(
            (id) => id !== conditionId,
          ),
        },
      },
    }));
  },
  removeConditionGroup: (groupId) => {
    set(({ conditionTree }) => {
      const parentGroup = Object.entries(conditionTree).find(
        ([treeGroupId, conditionGroup]) => {
          if (treeGroupId === groupId) return false;

          for (const id of conditionGroup.conditions) {
            if (id === groupId) return true;
          }

          return false;
        },
      );

      if (!parentGroup) return { conditionTree };

      const [parentGroupId, _] = parentGroup;

      return {
        conditionTree: {
          ...conditionTree,
          [parentGroupId]: {
            ...conditionTree[parentGroupId]!,
            conditions: conditionTree[parentGroupId]!.conditions.filter(
              (id) => id !== groupId,
            ),
          },
        },
      };
    });
  },
  updateGroupOperator: (groupId, groupOperator) => {
    set(({ conditionTree }) => ({
      conditionTree: {
        ...conditionTree,
        [groupId]: { ...conditionTree[groupId]!, groupOperator },
      },
    }));
  },
}));
