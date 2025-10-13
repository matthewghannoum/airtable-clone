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
