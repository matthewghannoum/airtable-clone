import { flexRender, type Table } from "@tanstack/react-table";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tally5, TextInitial } from "lucide-react";
import type { Column, TableData } from "../types";

export default function ATHeader({
  table,
  columns,
}: {
  table: Table<unknown>;
  columns: Column[];
}) {
  return (
    <TableHeader>
      {table.getHeaderGroups().map((hg) => (
        <TableRow key={hg.id}>
          <TableHead>
            <Checkbox />
          </TableHead>

          {hg.headers.map((header, index) => (
            <TableHead
              key={header.id}
              className={
                index !== hg.headers.length - 1
                  ? "border-r border-neutral-300"
                  : ""
              }
            >
              <div className="flex items-center justify-start gap-2">
                {columns.find((col) => col.id === header.id)?.type ===
                "text" ? (
                  <TextInitial size={15} />
                ) : columns.find((col) => col.id === header.id)?.type ===
                  "number" ? (
                  <Tally5 size={15} />
                ) : null}
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </div>
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  );
}
