export type Condition = {
  columnId: string;
  columnType: "text" | "number";
  operator: string;
  value: string | number;
};

export type GroupOperator = "and" | "or";

export type ConditionGroup = {
  conditions: string[]; // string could be a group id or condition id
  groupOperator: GroupOperator;
};

export type ConditionTree = Record<string, ConditionGroup>;
export type Filters = Record<string, Condition>;

export type ConditionsState = {
  conditionTree: ConditionTree;
  filters: Filters;
  addCondition: (groupId: string, condition: Condition) => void;
  createNewConditionGroup: (
    parentGroupId: string,
    groupOperator: GroupOperator,
  ) => string; // returns group id
  updateFilter: (conditionId: string, updatedCondition: Condition) => void;
};
