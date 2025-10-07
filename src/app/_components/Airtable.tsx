"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Tally5, TextInitial } from "lucide-react";

export default function Airtable({ tableId }: { tableId: string }) {
  const { data: tableData } = api.table.get.useQuery({ tableId });

  const rows = tableData ? tableData.rows : [];

  const table = useReactTable({
    data: rows,
    columns: tableData
      ? tableData.columns.map((col) => ({
          accessorKey: col.id,
          header: col.name,
        }))
      : [],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table className="w-full border-collapse bg-white">
      <TableHeader>
        {table.getHeaderGroups().map((hg) => (
          <TableRow key={hg.id}>
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
                  {tableData?.columns.find((col) => col.id === header.id)
                    ?.type === "text" ? (
                    <TextInitial size={15} />
                  ) : tableData?.columns.find((col) => col.id === header.id)
                      ?.type === "number" ? (
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
      <TableBody className="border-b border-neutral-300">
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell, index) => (
              <TableCell
                key={cell.id}
                className={
                  index !== row.getVisibleCells().length - 1
                    ? "border-r border-neutral-300"
                    : ""
                }
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
