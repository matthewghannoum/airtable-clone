import type { Column } from "../../../types";

export type Condition = {
  columnId: string;
  columnType: "text" | "number";
  operator: string;
  value: string | number;
};

export type GroupOperator = "and" | "or";

export type ConditionGroup = {
  conditions: string[]; // condition id or group id
  groupOperator: GroupOperator;
};

export type ConditionTree = Record<string, ConditionGroup>; // node id -> group id
export type Filters = Record<string, Condition>;

export type ConditionsState = {
  conditionTree: ConditionTree;
  filters: Filters;
  columns: Column[];
  setColumns: (columns: Column[]) => void;
  addCondition: (groupId: string, condition?: Condition) => void;
  createNewConditionGroup: (
    parentGroupId: string,
    operator?: GroupOperator,
  ) => string; // returns group id
  updateFilter: (conditionId: string, updatedCondition: Condition) => void;
};
