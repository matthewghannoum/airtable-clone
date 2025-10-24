"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type {
  FilterWithId,
  NumberFilterOperator,
  TextFilterOperator,
} from "./types";

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

const textFilterOptions: {
  value: TextFilterOperator;
  label: string;
  requiresValue: boolean;
}[] = [
  { value: "contains", label: "contains", requiresValue: true },
  { value: "not_contains", label: "does not contain", requiresValue: true },
  { value: "equals", label: "is", requiresValue: true },
  { value: "is_not_empty", label: "is not empty", requiresValue: false },
  { value: "is_empty", label: "is empty", requiresValue: false },
];

const numberFilterOptions: {
  value: NumberFilterOperator;
  label: string;
  requiresValue: boolean;
}[] = [
  { value: "gt", label: ">", requiresValue: true },
  { value: "lt", label: "<", requiresValue: true },
  { value: "eq", label: "=", requiresValue: true },
];

function createFilterId() {
  return Math.random().toString(36).slice(2);
}

function FilterTool({
  columns,
  filters,
  onFiltersChange,
}: {
  columns: Column[];
  filters: FilterWithId[];
  onFiltersChange: (filters: FilterWithId[]) => void;
}) {
  const getTextOption = (operator: TextFilterOperator) =>
    textFilterOptions.find((option) => option.value === operator);

  const getNumberOption = (operator: NumberFilterOperator) =>
    numberFilterOptions.find((option) => option.value === operator);

  function addFilter(column: Column) {
    if (!column) return;

    const newFilter: FilterWithId =
      column.type === "text"
        ? {
            id: createFilterId(),
            columnId: column.id,
            columnType: "text",
            operator: textFilterOptions[0]!.value,
          }
        : {
            id: createFilterId(),
            columnId: column.id,
            columnType: "number",
            operator: numberFilterOptions[0]!.value,
          };

    onFiltersChange([...filters, newFilter]);
  }

  function removeFilter(filterId: string) {
    onFiltersChange(filters.filter((filter) => filter.id !== filterId));
  }

  function updateColumn(filterId: string, columnId: string) {
    const column = columns.find((col) => col.id === columnId);
    if (!column) return;

    onFiltersChange(
      filters.map((filter) => {
        if (filter.id !== filterId) return filter;

        if (column.type === filter.columnType) {
          return { ...filter, columnId: column.id };
        }

        return column.type === "text"
          ? {
              id: filter.id,
              columnId: column.id,
              columnType: "text",
              operator: textFilterOptions[0]!.value,
            }
          : {
              id: filter.id,
              columnId: column.id,
              columnType: "number",
              operator: numberFilterOptions[0]!.value,
            };
      }),
    );
  }

  function updateOperator(
    filterId: string,
    operator: TextFilterOperator | NumberFilterOperator,
  ) {
    onFiltersChange(
      filters.map((filter) => {
        if (filter.id !== filterId) return filter;

        if (filter.columnType === "text") {
          const option = getTextOption(operator as TextFilterOperator);

          if (!option) return filter;

          return option.requiresValue
            ? { ...filter, operator: operator as TextFilterOperator }
            : {
                ...filter,
                operator: operator as TextFilterOperator,
                value: undefined,
              };
        }

        const option = getNumberOption(operator as NumberFilterOperator);
        if (!option) return filter;

        return { ...filter, operator: operator as NumberFilterOperator };
      }),
    );
  }

  function updateValue(
    filterId: string,
    value: string | number | null | undefined,
  ) {
    onFiltersChange(
      filters.map((filter) =>
        filter.id === filterId ? { ...filter, value } : filter,
      ),
    );
  }

  const hasFilters = filters.length > 0;

  return (
    <Popover>
      <PopoverTrigger className="cursor-pointer">
        <Button
          variant="ghost"
          className={
            hasFilters ? "bg-neutral-100 text-neutral-900 hover:bg-neutral-200" : ""
          }
        >
          <div className="flex items-center justify-center gap-2">
            <ListFilter size={20} />
            <p>Filter</p>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-full min-w-md">
        <div className="flex flex-col items-start justify-start gap-2">
          <div className="flex w-full items-center justify-start gap-2">
            <p className="text-sm font-medium">Filter by</p>
          </div>

          <hr className="w-full" />

          <div className="w-full">
            {hasFilters ? (
              <div className="flex flex-col items-start justify-start gap-3">
                {filters.map((filter) => {
                  const requiresValue =
                    filter.columnType === "text"
                      ? getTextOption(filter.operator)?.requiresValue ?? false
                      : getNumberOption(filter.operator)?.requiresValue ?? false;

                  const operatorOptions =
                    filter.columnType === "text"
                      ? textFilterOptions
                      : numberFilterOptions;

                  return (
                    <div
                      key={filter.id}
                      className="flex w-full items-center justify-start gap-3"
                    >
                      <Select
                        value={filter.columnId}
                        onValueChange={(value) => updateColumn(filter.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Column" />
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
                        value={filter.operator}
                        onValueChange={(value) =>
                          updateOperator(filter.id, value as TextFilterOperator | NumberFilterOperator)
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Operator" />
                        </SelectTrigger>

                        <SelectContent>
                          {operatorOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {requiresValue ? (
                        filter.columnType === "text" ? (
                          <Input
                            className="w-full"
                            value={
                              typeof filter.value === "string" ? filter.value : ""
                            }
                            onChange={(event) =>
                              updateValue(filter.id, event.target.value)
                            }
                          />
                        ) : (
                          <Input
                            className="w-full"
                            type="number"
                            value={
                              typeof filter.value === "number" && !Number.isNaN(filter.value)
                                ? filter.value
                                : ""
                            }
                            onChange={(event) =>
                              updateValue(
                                filter.id,
                                event.target.value === ""
                                  ? undefined
                                  : Number(event.target.value),
                              )
                            }
                          />
                        )
                      ) : (
                        <div className="flex-1" />
                      )}

                      <X
                        size={18}
                        className="cursor-pointer"
                        onClick={() => removeFilter(filter.id)}
                      />
                    </div>
                  );
                })}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 hover:bg-transparent">
                      <div className="flex items-center justify-center gap-1">
                        <Plus size={10} />
                        <p>Add filter</p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    {columns.map((column) => (
                      <DropdownMenuItem
                        key={column.id}
                        onClick={() => addFilter(column)}
                      >
                        {column.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                {columns.map((column) => (
                  <PopoverListItem
                    key={column.id}
                    text={column.name}
                    icon={
                      column.type === "text" ? (
                        <TextInitial size={15} />
                      ) : (
                        <Tally5 size={15} />
                      )
                    }
                    onClick={() => addFilter(column)}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

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
  filters,
  onFiltersChange,
}: {
  tableId: string;
  columns: Column[];
  filters: FilterWithId[];
  onFiltersChange: (filters: FilterWithId[]) => void;
}) {
  return (
    <div className="flex w-full items-center justify-end gap-1 border-t border-b border-neutral-300 p-1">
      <Button variant="ghost">
        <div className="flex items-center justify-center gap-2">
          <EyeOff size={20} />
          <p>Hide fields</p>
        </div>
      </Button>

      <FilterTool
        columns={columns}
        filters={filters}
        onFiltersChange={onFiltersChange}
      />

      <SortTool tableId={tableId} columns={columns} />
    </div>
  );
}
