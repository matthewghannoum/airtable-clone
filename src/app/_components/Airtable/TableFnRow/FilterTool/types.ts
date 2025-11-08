import type { Column } from "../../../types";

export type Operator =
  | "contains"
  | "not-contains"
  | "equal-to"
  | "is-empty"
  | "is-not-empty"
  | "gt"
  | "lt";

export type Condition = {
  columnId: string;
  columnType: "text" | "number";
  operator: Operator;
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
  isInit: boolean;
  conditionTree: ConditionTree;
  filters: Filters;
  columns: Column[];
  // setColumns: (columns: Column[]) => void;
  addCondition: (groupId: string, condition?: Condition) => void;
  createNewConditionGroup: (
    parentGroupId: string,
    operator?: GroupOperator,
  ) => string; // returns group id
  updateFilter: (conditionId: string, updatedCondition: Condition) => void;
  removeFilter: (groupId: string, conditionId: string) => void;
  removeConditionGroup: (groupId: string) => void;
  init: (
    columns: Column[],
    conditionTree?: ConditionTree,
    filters?: Filters,
  ) => void;
};
