"use client";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { api } from "@/trpc/react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useState } from "react";
import ATHeader from "./ATHeader";
import ATAddRow from "./ATAddRow";

export default function Airtable({ tableId }: { tableId: string }) {
  const utils = api.useUtils();

  // For now the entire table will be refetched
  // TODO: Create a row component that fetches and updates its own data
  const { data: tableData, refetch } = api.table.get.useQuery({ tableId });

  const rowValues = tableData ? tableData.rows : [];
  const rowIds = tableData ? tableData.rowIds : [];

  const table = useReactTable({
    data: rowValues,
    columns: tableData
      ? tableData.columns.map((col) => ({
          accessorKey: col.id,
          header: col.name,
        }))
      : [],
    getCoreRowModel: getCoreRowModel(),
    getRowId: (_, index) => rowIds[index] ?? index.toString(),
  });

  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    columnId: string;
    cellValue?: string | number | null;
  } | null>(null);

  const updateCell = api.table.updateCell.useMutation({
    onMutate: async (input) => {
      const { rowId, columnId, cellValue } = input;

      // 1) stop outgoing refetches so we don't overwrite our optimistic change
      await utils.table.get.cancel({ tableId });

      // 2) snapshot previous cache
      const prev = utils.table.get.getData({ tableId });

      // 3) update cache optimistically
      if (prev) {
        const newRows = prev.rows.map((row, index) => {
          if (rowId === rowIds[index]) {
            return {
              ...row,
              [columnId]: cellValue,
            };
          }
          return row;
        });

        utils.table.get.setData({ tableId }, () => ({
          columns: prev.columns,
          rows: newRows,
          rowIds: prev.rowIds,
        }));
      }

      // 4) pass snapshot to error handler for rollback
      return { prev };
    },
    onError: (err, newTodo, context) => {
      if (context?.prev) {
        utils.table.get.setData({ tableId }, context.prev);
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      void utils.table.get.invalidate({ tableId });
    },
  });

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
                  setEditingCell({ rowId: row.id, columnId: cell.column.id })
                }
              >
                {editingCell?.rowId === row.id &&
                editingCell?.columnId === cell.column.id ? (
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
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? null
                          : tableData?.columns.find(
                                (col) => col.id === cell.column.id,
                              )?.type === "number"
                            ? Number(e.target.value)
                            : e.target.value;

                      setEditingCell({
                        rowId: row.id,
                        columnId: cell.column.id,
                        cellValue: value,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        editingCell?.cellValue !== undefined
                      ) {
                        updateCell.mutate({
                          tableId,
                          rowId: editingCell.rowId,
                          columnId: editingCell.columnId,
                          cellValue: editingCell.cellValue,
                        });
                        setEditingCell(null);
                      }
                      if (e.key === "Escape") {
                        setEditingCell(null);
                      }
                    }}
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
