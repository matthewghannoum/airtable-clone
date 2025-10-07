"use client";

import { Checkbox } from "@/components/ui/checkbox";
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
import { Tally5, TextInitial, Plus } from "lucide-react";

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
        {table.getRowModel().rows.map((row, rowIndex) => (
          <TableRow key={row.id}>
            <TableCell>
              <p className="ml-1">{rowIndex + 1}</p>
            </TableCell>

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

        <TableRow className="cursor-pointer">
          <TableCell>
            <Plus size={15} />
          </TableCell>
          {tableData?.columns.map((_, index) => (
            <TableCell key={index} className="p-2">
              <p className="invisible">a</p>
            </TableCell>
          ))}
        </TableRow>
      </TableBody>
    </Table>
  );
}
