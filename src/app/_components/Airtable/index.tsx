"use client";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { api } from "@/trpc/react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
import ATHeader from "./ATHeader";
import ATAddRow from "./ATAddRow";
import ATAddCol from "./ATAddCol";
import TableFnRow from "../TableFnRow";
import ATViewsBar from "./ATViewsBar";

export default function Airtable({
  tableId,
  viewId,
}: {
  tableId: string;
  viewId: string;
}) {
  const utils = api.useUtils();

  // For now the entire table will be refetched
  // TODO: Create a row component that fetches and updates its own data
  const { data: tableData, refetch } = api.table.get.useQuery({
    tableId,
    viewId,
  });

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

  const [isViewsBarHidden, setIsViewsBarHidden] = useState(true);

  const [selectedCell, setSelectedCell] = useState<{
    rowId: string;
    columnId: string;
  } | null>(null);

  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    columnId: string;
    draftValue: string;
  } | null>(null);
  const skipBlurCommitRef = useRef(false);

  const getColumnMeta = (columnId: string) =>
    tableData?.columns.find((col) => col.id === columnId);

  const toDraftValue = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value);
  };

  const parseDraftValue = (
    columnId: string,
    draftValue: string,
  ): string | number | null => {
    const column = getColumnMeta(columnId);

    if (draftValue === "") {
      return null;
    }

    if (column?.type === "number") {
      const parsed = Number(draftValue);
      return Number.isNaN(parsed) ? null : parsed;
    }

    return draftValue;
  };

  const startEditing = (
    rowId: string,
    columnId: string,
    value: string | number | null | undefined,
  ) => {
    skipBlurCommitRef.current = false;
    setEditingCell({
      rowId,
      columnId,
      draftValue: toDraftValue(value),
    });
  };

  const finishEditing = (action: "submit" | "cancel") => {
    if (!editingCell) {
      return;
    }

    if (action === "submit") {
      updateCell.mutate({
        tableId,
        rowId: editingCell.rowId,
        columnId: editingCell.columnId,
        cellValue: parseDraftValue(
          editingCell.columnId,
          editingCell.draftValue,
        ),
      });
    }

    setEditingCell(null);
    setSelectedCell({
      rowId: editingCell.rowId,
      columnId: editingCell.columnId,
    });
  };

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
          startEditing(
            targetRow.id,
            targetCell.column.id,
            targetCell.getValue() as string | number | null,
          );
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
      await utils.table.get.cancel({ tableId, viewId });

      // 2) snapshot previous cache
      const prev = utils.table.get.getData({ tableId, viewId });

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

        utils.table.get.setData({ tableId, viewId }, () => ({
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
        utils.table.get.setData({ tableId, viewId }, context.prev);
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      void utils.table.get.invalidate({ tableId, viewId });
    },
  });

  return (
    <div className="h-full w-full">
      {tableData?.columns && (
        <TableFnRow
          tableId={tableId}
          viewId={viewId}
          columns={tableData.columns}
          toggleViewsBar={() => setIsViewsBarHidden(!isViewsBarHidden)}
        />
      )}

      <div className="flex h-full w-full items-start justify-start">
        {!isViewsBarHidden && <ATViewsBar tableId={tableId} viewId={viewId} />}

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

                {row.getVisibleCells().map((cell) => {
                  const isEditingCell =
                    editingCell?.rowId === row.id &&
                    editingCell?.columnId === cell.column.id;

                  return (
                    <TableCell
                      key={cell.id}
                      className={`border-r border-neutral-300 ${
                        isEditingCell
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
                          startEditing(
                            row.id,
                            cell.column.id,
                            cell.getValue() as string | number | null,
                          );
                        } else {
                          setSelectedCell({
                            rowId: row.id,
                            columnId: cell.column.id,
                          });
                          setEditingCell(null);
                        }
                      }}
                    >
                      {isEditingCell ? (
                        <input
                          autoFocus
                          className="w-full bg-transparent outline-none"
                          type={
                            getColumnMeta(cell.column.id)?.type === "number"
                              ? "number"
                              : "text"
                          }
                          value={editingCell?.draftValue ?? ""}
                          onChange={(e) => {
                            const { value } = e.target;

                            setEditingCell((current) => {
                              if (!current) {
                                return current;
                              }

                              if (
                                current.rowId !== row.id ||
                                current.columnId !== cell.column.id
                              ) {
                                return current;
                              }

                              return {
                                ...current,
                                draftValue: value,
                              };
                            });

                            setSelectedCell({
                              rowId: row.id,
                              columnId: cell.column.id,
                            });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              e.stopPropagation();
                              skipBlurCommitRef.current = true;
                              finishEditing("submit");
                            }
                            if (e.key === "Escape") {
                              e.preventDefault();
                              e.stopPropagation();
                              skipBlurCommitRef.current = true;
                              finishEditing("cancel");
                            }
                          }}
                          onBlur={() => {
                            if (skipBlurCommitRef.current) {
                              skipBlurCommitRef.current = false;
                              return;
                            }

                            finishEditing("submit");
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
                  );
                })}
              </TableRow>
            ))}

            {tableData?.columns && (
              <ATAddRow
                tableId={tableId}
                viewId={viewId}
                columns={tableData.columns}
                refetch={async () => {
                  await refetch();
                }}
              />
            )}
          </TableBody>
        </Table>

        <ATAddCol tableId={tableId} viewId={viewId} />
      </div>
    </div>
  );
}
