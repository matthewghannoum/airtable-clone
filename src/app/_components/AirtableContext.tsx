import type { Table } from "@tanstack/react-table";
import { createContext, useContext, type ReactNode } from "react";

type TableServerProps = {
  tableId: string;
  viewId: string;
  table: Table<Record<string, string | number | null>>;
};

const Ctx = createContext<TableServerProps | null>(null);

export function AirtableProvider({
  value,
  children,
}: {
  value: TableServerProps;
  children: ReactNode;
}) {
  console.log("rendering airtable provider!!!");
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAirtable = () => {
  const v = useContext(Ctx);
  if (v === null)
    throw new Error("useAirtable must be inside a AirtableProvider");
  return v;
};
