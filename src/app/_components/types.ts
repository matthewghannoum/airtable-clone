// export type Column = {
//   id: string;
//   name: string;
//   type: "number" | "text";
//   displayOrderNum: number;
//   airtableId: string;
// };

export type Column = {
  id: string;
  name: string;
  type: "number" | "text";
  displayOrderNum: number;
  sortOrder: "asc" | "desc" | null;
  sortPriority: number | null;
  airtableId: string;
  isHidden: boolean;
};

export type TableData =
  | {
      columns: Column[];
      rows: unknown[];
    }
  | undefined;
