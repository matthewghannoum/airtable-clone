"use client";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { api } from "@/trpc/react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ATHeader from "./ATHeader";
import ATAddRow from "./ATAddRow";
import ATAddCol from "./ATAddCol";
import TableFnRow from "./TableFnRow";
import ATViewsBar from "./ATViewsBar";

export const limit = 100;

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
  const { data, fetchNextPage, isFetching } = api.table.get.useInfiniteQuery(
    {
      tableId,
      viewId,
      limit,
    },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  const tableData = useMemo(() => {
    const columns = data?.pages[0]?.columns ?? [];
    const rows =
      data?.pages
        .map(({ rows }) => rows)
        ?.reduce((accRows, currentRows) => [...accRows, ...currentRows]) ?? [];
    const rowIds =
      data?.pages
        .map(({ rowIds }) => rowIds)
        ?.reduce((accRowIds, currentRowIds) => [
          ...accRowIds,
          ...currentRowIds,
        ]) ?? [];
    return { columns, rows, rowIds };
  }, [data]);

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
      await utils.table.get.cancel({ tableId, viewId, limit });

      // 2) snapshot previous cache
      const prev = utils.table.get.getInfiniteData({ tableId, viewId, limit });

      // 3) update cache optimistically
      if (prev) {
        utils.table.get.setInfiniteData({ tableId, viewId, limit }, (old) => {
          if (!old) return { pages: [], pageParams: [] };

          return {
            ...old,
            pages:
              old?.pages.map((page) => ({
                ...page,
                rows: page.rows.map((row, index) => {
                  if (rowId === rowIds[index]) {
                    return {
                      ...row,
                      [columnId]: cellValue,
                    };
                  }
                  return row;
                }),
              })) ?? [],
          };
        });
      }

      // 4) pass snapshot to error handler for rollback
      return { prev };
    },
    onError: (err, newTodo, context) => {
      if (context?.prev) {
        utils.table.get.setInfiniteData(
          { tableId, viewId, limit },
          context.prev,
        );
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      void utils.table.get.invalidate({ tableId, viewId });
    },
  });

  const totalFetched = tableData.rows.length;
  const totalDBRowCount = data?.pages[0]?.numRows ?? 0;

  const tableContainerRef = useRef<HTMLTableElement>(null);

  // called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        // once the user has scrolled within 500px of the bottom of the table, fetch more data if we can
        if (
          scrollHeight - scrollTop - clientHeight < 500 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          void fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount],
  );

  // a check on mount and after a fetch to see if the table is already scrolled to the bottom and immediately needs to fetch more data
  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  const { rows } = table.getRowModel();

  // TODO: move tablebody and this virualizer to a lower order component to avoid rerendering the virtualizer
  // https://github.com/TanStack/table/blob/main/examples/react/virtualized-rows/src/main.tsx
  const rowVirtualizer = useVirtualizer<HTMLTableElement, HTMLTableRowElement>({
    count: rows.length + 1,
    estimateSize: () => 36, // estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    // measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== "undefined" && navigator.userAgent.includes("Firefox")
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 50,
  });

  // Create % widths once, reuse everywhere
  const colWidthPercentage = `calc(48px-${100 / tableData.columns.length}%)`;

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

      {/* TanStack virtualizer requires a fixed height for the table container (calculated as the screen - total height divs on top of the container) */}
      <div
        data-slot="table-container"
        className="relative flex h-[calc(100vh-134px)] w-full items-start justify-start overflow-auto"
        onScroll={(e) => fetchMoreOnBottomReached(e.currentTarget)}
        ref={tableContainerRef}
      >
        {!isViewsBarHidden && <ATViewsBar tableId={tableId} viewId={viewId} />}

        <Table className="h-full w-full border-collapse bg-white">
          {tableData?.columns && (
            <ATHeader
              table={table}
              columns={tableData.columns}
              colWidthPercentage={colWidthPercentage}
            />
          )}

          <TableBody
            className="relative"
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const rowIndex = virtualRow.index;
              const row = rows[rowIndex];

              if (rowIndex === totalFetched - 1 && tableData?.columns)
                return (
                  <ATAddRow
                    key={rowIndex}
                    tableId={tableId}
                    viewId={viewId}
                    columns={tableData.columns}
                    virtualRowStart={virtualRow.start}
                  />
                );

              if (!row) return <Fragment key={rowIndex}></Fragment>;

              return (
                <TableRow
                  key={rowIndex}
                  className="flex w-full"
                  style={{
                    position: "absolute",
                    transform: `translateY(${virtualRow.start}px)`, // this should always be a `style` as it changes on scroll
                  }}
                >
                  <TableCell className="h-9 max-w-12 flex-none">
                    <div className="flex h-full items-center pr-6">
                      <p className="ml-1">{rowIndex + 1}</p>
                    </div>
                  </TableCell>

                  {row.getVisibleCells().map((cell) => {
                    const isEditingCell =
                      editingCell?.rowId === row.id &&
                      editingCell?.columnId === cell.column.id;

                    if (
                      tableData?.columns.find(
                        (col) => col.id === cell.column.id,
                      )?.isHidden
                    )
                      return <Fragment key={cell.id}></Fragment>;

                    return (
                      <TableCell
                        key={cell.id}
                        className={`h-9 w-full flex-1 overflow-x-auto border-r border-neutral-300 ${
                          isEditingCell
                            ? "border-2 border-blue-500 bg-white"
                            : selectedCell?.rowId === row.id &&
                                selectedCell?.columnId === cell.column.id
                              ? "border-2 border-blue-400 bg-white"
                              : ""
                        }`}
                        style={{ flex: `0 0 ${colWidthPercentage}` }}
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
                        <div className="flex h-full w-full items-center">
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
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <ATAddCol tableId={tableId} viewId={viewId} />
      </div>
    </div>
  );
}
