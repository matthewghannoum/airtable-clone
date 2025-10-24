export type Column = {
  id: string;
  name: string;
  type: "number" | "text";
  displayOrderNum: number;
  airtableId: string;
};

export type TableData =
  | {
      columns: Column[];
      rows: unknown[];
    }
  | undefined;

export type TextFilterOperator =
  | "contains"
  | "equals"
  | "is_empty"
  | "is_not_empty"
  | "not_contains";

export type NumberFilterOperator = "eq" | "gt" | "lt";

export type FilterCondition =
  | {
      columnId: string;
      columnType: "text";
      operator: TextFilterOperator;
      value?: string | null;
    }
  | {
      columnId: string;
      columnType: "number";
      operator: NumberFilterOperator;
      value?: number | null;
    };

export type FilterWithId = FilterCondition & { id: string };
