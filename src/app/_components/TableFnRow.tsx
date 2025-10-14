"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowDownUp,
  CircleQuestionMark,
  EyeOff,
  ListFilter,
  MoveRight,
  Plus,
  Tally5,
  TextInitial,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PopoverListItem from "./common/PopoverListItem";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/trpc/react";

type Column = {
  id: string;
  name: string;
  type: "number" | "text";
  displayOrderNum: number;
  sortOrder: "asc" | "desc" | null;
  sortPriority: number | null;
  airtableId: string;
};

function SortOrderItem({ type }: { type: "text" | "number" }) {
  const lowChar = type === "text" ? "A" : "1";
  const highChar = type === "text" ? "Z" : "9";

  return (
    <>
      <SelectItem value="asc">
        <div className="flex items-center justify-start gap-2">
          <p>{lowChar}</p>
          <MoveRight size={15} />
          <p>{highChar}</p>
        </div>
      </SelectItem>

      <SelectItem value="desc">
        <div className="flex items-center justify-start gap-2">
          <p>{highChar}</p>
          <MoveRight size={15} />
          <p>{lowChar}</p>
        </div>
      </SelectItem>
    </>
  );
}

type SortColumn = {
  id: string;
  name: string;
  type: "number" | "text";
  displayOrderNum: number;
  sortOrder: "asc" | "desc";
  sortPriority: number;
  airtableId: string;
};

function SortTool({
  tableId,
  columns,
}: {
  tableId: string;
  columns: Column[];
}) {
  const utils = api.useUtils();

  const [sortColumns, setSortColumns] = useState<SortColumn[]>(
    columns
      .map((col) =>
        col.sortOrder || col.sortPriority
          ? {
              ...col,
              sortOrder: col.sortOrder,
              sortPriority: col.sortPriority,
            }
          : null,
      )
      .filter((col): col is SortColumn => col !== null),
  );

  const updateSorts = api.table.updateSorts.useMutation({
    onSuccess: () => {
      void utils.table.get.invalidate({ tableId });
    },
  });

  useEffect(() => {
    const sorts = sortColumns.map((sortColumn, index) => ({
      columnId: sortColumn.id,
      sortOrder: sortColumn.sortOrder,
      sortPriority: index,
    }));

    updateSorts.mutate({ sorts, tableId });
  }, [sortColumns]);

  function addSort(column: SortColumn) {
    if (sortColumns.find((sort) => sort.id === column.id)) return;

    setSortColumns((prev) => [...prev, { ...column, sortOrder: "asc" }]);
  }

  function updateSortOrder(columnId: string, order: "asc" | "desc") {
    setSortColumns((prev) =>
      prev.map((sortColumn) =>
        sortColumn.id === columnId
          ? { ...sortColumn, sortOrder: order }
          : sortColumn,
      ),
    );
  }

  function updateColumn(columnId: string, newColumn: Column) {
    setSortColumns((prev) =>
      prev.map((sortColumn) =>
        sortColumn.id === columnId
          ? { ...sortColumn, column: newColumn }
          : sortColumn,
      ),
    );
  }

  function removeSort(columnId: string) {
    setSortColumns((prev) =>
      prev.filter((sortColumn) => sortColumn.id !== columnId),
    );
  }

  function isColumnSelected(columnId: string) {
    return sortColumns.some((sortColumn) => sortColumn.id === columnId);
  }

  return (
    <Popover>
      <PopoverTrigger className="ml-2 cursor-pointer">
        <Button variant="ghost">
          <div className="flex items-center justify-center gap-2">
            <ArrowDownUp size={20} />
            <p>Sort</p>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-full min-w-md">
        <div className="flex flex-col items-start justify-start gap-2">
          <div className="flex w-full items-center justify-start gap-2">
            <p className="text-sm font-medium">Sort by</p>
            <Tooltip>
              <TooltipTrigger>
                <CircleQuestionMark size={15} />
              </TooltipTrigger>

              <TooltipContent side="right">
                <p>Learn more about sorting</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <hr className="w-full" />

          <div className="w-full">
            {sortColumns.length !== 0 ? (
              <div className="flex flex-col items-start justify-start gap-2">
                {sortColumns.map((sortColumn, index) => (
                  <div
                    key={index}
                    className="flex w-full items-center justify-start gap-3"
                  >
                    <Select
                      value={sortColumn.id}
                      onValueChange={(value) =>
                        updateColumn(
                          sortColumn.id,
                          columns.find((col) => col.id === value)!,
                        )
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Column type" />
                      </SelectTrigger>

                      <SelectContent>
                        {columns.map((columnOption) => (
                          <SelectItem
                            key={columnOption.id}
                            value={columnOption.id}
                          >
                            {columnOption.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={sortColumn.sortOrder}
                      onValueChange={(value) =>
                        updateSortOrder(sortColumn.id, value as "asc" | "desc")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sort order" />
                      </SelectTrigger>

                      <SelectContent>
                        <SortOrderItem type={sortColumn.type} />
                      </SelectContent>
                    </Select>

                    <X
                      size={25}
                      className="ml-2 cursor-pointer"
                      onClick={() => removeSort(sortColumn.id)}
                    />
                  </div>
                ))}

                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button
                      variant="ghost"
                      className="p-0 hover:bg-transparent"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <Plus size={10} />
                        <p>Add another sort</p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    {columns.map((column, index) => (
                      <>
                        {!isColumnSelected(column.id) && (
                          <DropdownMenuItem
                            key={index}
                            onClick={() =>
                              addSort({
                                ...column,
                                sortOrder: "asc",
                                sortPriority: index,
                              })
                            }
                          >
                            {column.name}
                          </DropdownMenuItem>
                        )}
                      </>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                {columns.map((column, index) => (
                  <>
                    <PopoverListItem
                      key={index}
                      text={column.name}
                      icon={
                        column.type === "text" ? (
                          <TextInitial size={15} />
                        ) : (
                          <Tally5 size={15} />
                        )
                      }
                      onClick={() =>
                        addSort({
                          ...column,
                          sortOrder: "asc",
                          sortPriority: index,
                        })
                      }
                    />
                  </>
                ))}
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function TableFnRow({
  tableId,
  columns,
}: {
  tableId: string;
  columns: Column[];
}) {
  return (
    <div className="flex w-full items-center justify-end gap-1 border-t border-b border-neutral-300 p-1">
      <Button variant="ghost">
        <div className="flex items-center justify-center gap-2">
          <EyeOff size={20} />
          <p>Hide fields</p>
        </div>
      </Button>

      <Button variant="ghost">
        <div className="flex items-center justify-center gap-2">
          <ListFilter size={20} />
          <p>Filter</p>
        </div>
      </Button>

      <SortTool tableId={tableId} columns={columns} />
    </div>
  );
}
