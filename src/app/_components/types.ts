export type TableData =
  | {
      columns: {
        id: string;
        name: string;
        type: "number" | "text";
        displayOrderNum: number;
        airtableId: string;
      }[];
      rows: unknown[];
    }
  | undefined;

export type Column = {
  id: string;
  name: string;
  type: "number" | "text";
  displayOrderNum: number;
  airtableId: string;
};
