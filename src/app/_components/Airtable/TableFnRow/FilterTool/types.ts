export type Condition = {
  conditionId: string;
  columnId: string;
  columnType: "text" | "number";
  operator: string;
  value: string | number;
};

export type GroupOperator = "and" | "or";

export type ConditionGroup = {
  conditions: (string | Condition)[];
  groupOperator: GroupOperator;
};

export type ConditionGroupMap = Record<string, ConditionGroup>;

export type ConditionsState = {
  conditionGroupMap: ConditionGroupMap;
  addCondition: (groupId: string, condition: Condition) => void;
  createNewConditionGroup: (
    parentGroupId: string,
    groupOperator: GroupOperator,
  ) => string; // returns group id
};
