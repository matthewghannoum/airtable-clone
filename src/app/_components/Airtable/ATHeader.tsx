import { flexRender, type Table } from "@tanstack/react-table";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tally5, TextInitial } from "lucide-react";
import type { Column } from "../types";
import { Fragment } from "react";

export default function ATHeader({
  table,
  columns,
  colWidthPercentage,
}: {
  table: Table<Record<string, string | number | null>>;
  columns: Column[];
  colWidthPercentage: string;
}) {
  return (
    <TableHeader>
      {table.getHeaderGroups().map((hg) => (
        <TableRow key={hg.id} className="flex w-full hover:bg-transparent">
          <TableHead className="flex-none">
            <div className="flex h-full items-center pr-6">
              <Checkbox />
            </div>
          </TableHead>

          {hg.headers.map((header, index) => (
            <Fragment key={index}>
              {!columns.find((col) => col.id === header.id)?.isHidden && (
                <TableHead
                  key={header.id}
                  className="flex-1 border-r border-neutral-300"
                  style={{ flex: `0 0 ${colWidthPercentage}` }}
                >
                  <div className="flex h-full items-center justify-start gap-2">
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
              )}
            </Fragment>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  );
}
