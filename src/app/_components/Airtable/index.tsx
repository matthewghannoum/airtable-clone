"use client";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { api } from "@/trpc/react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import ATHeader from "./ATHeader";
import ATAddRow from "./ATAddRow";
import ATAddCol from "./ATAddCol";
import TableFnRow from "../TableFnRow";

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

  const [selectedCell, setSelectedCell] = useState<{
    rowId: string;
    columnId: string;
  } | null>(null);

  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    columnId: string;
    cellValue?: string | number | null;
  } | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const visibleColumns = table
        .getVisibleLeafColumns()
        .map((column) => column.id);

      if (editingCell) {
        return;
      }

      if (!selectedCell) {
        return;
      }

      const rows = table.getRowModel().rows;
      const rowIndex = rows.findIndex((row) => row.id === selectedCell.rowId);
      const columnIndex = visibleColumns.findIndex(
        (id) => id === selectedCell.columnId,
      );

      if (rowIndex === -1 || columnIndex === -1) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setSelectedCell(null);
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const targetRow = rows[rowIndex];
        const targetCell = targetRow?.getVisibleCells()[columnIndex];
        if (targetRow && targetCell) {
          setEditingCell({
            rowId: targetRow.id,
            columnId: targetCell.column.id,
            cellValue: targetCell.getValue() as string | number | null,
          });
        }
        return;
      }

      let nextRowIndex = rowIndex;
      let nextColumnIndex = columnIndex;

      switch (event.key) {
        case "ArrowUp":
          nextRowIndex = Math.max(0, rowIndex - 1);
          break;
        case "ArrowDown":
          nextRowIndex = Math.min(rows.length - 1, rowIndex + 1);
          break;
        case "ArrowLeft":
          nextColumnIndex = Math.max(0, columnIndex - 1);
          break;
        case "ArrowRight":
          nextColumnIndex = Math.min(
            visibleColumns.length - 1,
            columnIndex + 1,
          );
          break;
        default:
          return;
      }

      if (nextRowIndex === rowIndex && nextColumnIndex === columnIndex) {
        event.preventDefault();
        return;
      }

      const nextRow = rows[nextRowIndex];
      const nextCell = nextRow?.getVisibleCells()[nextColumnIndex];

      if (nextRow && nextCell) {
        event.preventDefault();
        setSelectedCell({
          rowId: nextRow.id,
          columnId: nextCell.column.id,
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editingCell, selectedCell, table]);

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
    <div className="flex w-full flex-col items-start justify-start">
      {tableData?.columns && (
        <TableFnRow tableId={tableId} columns={tableData.columns} />
      )}

      <div className="flex w-full items-start justify-start">
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

                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={`border-r border-neutral-300 ${
                      editingCell?.rowId === row.id &&
                      editingCell?.columnId === cell.column.id
                        ? "border-2 border-blue-500 bg-white"
                        : selectedCell?.rowId === row.id &&
                            selectedCell?.columnId === cell.column.id
                          ? "border-2 border-blue-400 bg-white"
                          : ""
                    }`}
                    onClick={() => {
                      if (
                        selectedCell?.rowId === row.id &&
                        selectedCell?.columnId === cell.column.id
                      ) {
                        setSelectedCell({
                          rowId: row.id,
                          columnId: cell.column.id,
                        });
                        setEditingCell({
                          rowId: row.id,
                          columnId: cell.column.id,
                          cellValue: cell.getValue() as string | number | null,
                        });
                      } else {
                        setSelectedCell({
                          rowId: row.id,
                          columnId: cell.column.id,
                        });
                        setEditingCell(null);
                      }
                    }}
                  >
                    {editingCell?.rowId === row.id &&
                    editingCell?.columnId === cell.column.id ? (
                      <input
                        autoFocus
                        className="w-full bg-transparent outline-none"
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
                          setSelectedCell({
                            rowId: row.id,
                            columnId: cell.column.id,
                          });
                        }}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            editingCell &&
                            editingCell.cellValue !== undefined
                          ) {
                            updateCell.mutate({
                              tableId,
                              rowId: editingCell.rowId,
                              columnId: editingCell.columnId,
                              cellValue: editingCell.cellValue,
                            });
                            setEditingCell(null);
                            setSelectedCell({
                              rowId: editingCell.rowId,
                              columnId: editingCell.columnId,
                            });
                          }
                          if (e.key === "Escape") {
                            setEditingCell(null);
                            setSelectedCell({
                              rowId: row.id,
                              columnId: cell.column.id,
                            });
                          }
                        }}
                        onBlur={() => {
                          if (
                            editingCell &&
                            editingCell.cellValue !== undefined &&
                            editingCell.rowId === row.id &&
                            editingCell.columnId === cell.column.id
                          ) {
                            updateCell.mutate({
                              tableId,
                              rowId: editingCell.rowId,
                              columnId: editingCell.columnId,
                              cellValue: editingCell.cellValue,
                            });
                            setEditingCell(null);
                            setSelectedCell({
                              rowId: editingCell.rowId,
                              columnId: editingCell.columnId,
                            });
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </div>
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

        <ATAddCol tableId={tableId} />
      </div>
    </div>
  );
}
