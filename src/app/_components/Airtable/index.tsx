"use client";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { api } from "@/trpc/react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useState } from "react";
import ATHeader from "./ATHeader";
import ATAddRow from "./ATAddRow";

export default function Airtable({ tableId }: { tableId: string }) {
  // For now the entire table will be refetched
  // TODO: Create a row component that fetches and updates its own data
  const { data: tableData, refetch } = api.table.get.useQuery({ tableId });

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

  const [isCellEditing, setIsCellEditing] = useState<{
    rowIndex: number;
    columnId: string;
  } | null>(null);

  return (
    <Table className="w-full border-collapse bg-white">
      {tableData?.columns && (
        <ATHeader table={table} columns={tableData.columns} />
      )}

      <TableBody className="border-b border-neutral-300">
        {table.getRowModel().rows.map((row, rowIndex) => (
          <TableRow key={row.id}>
            <TableCell>
              <p className="ml-1">{rowIndex + 1}</p>
            </TableCell>

            {row.getVisibleCells().map((cell, index) => (
              <TableCell
                key={cell.id}
                className={`${
                  index !== row.getVisibleCells().length - 1
                    ? "border-r border-neutral-300"
                    : ""
                }`}
                onClick={() =>
                  setIsCellEditing({ rowIndex, columnId: cell.column.id })
                }
              >
                {isCellEditing?.rowIndex === rowIndex &&
                isCellEditing?.columnId === cell.column.id ? (
                  <input
                    autoFocus
                    className="bg-transparent outline-none"
                    type={
                      tableData?.columns.find(
                        (col) => col.id === cell.column.id,
                      )?.type === "number"
                        ? "number"
                        : "text"
                    }
                    defaultValue={cell.getValue() as string | number}
                  />
                ) : (
                  flexRender(cell.column.columnDef.cell, cell.getContext())
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}

        {tableData?.columns && (
          <ATAddRow
            tableId={tableId}
            columns={tableData.columns}
            refetch={async () => {
              await refetch();
            }}
          />
        )}
      </TableBody>
    </Table>
  );
}
