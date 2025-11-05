import { Button } from "@/components/ui/button";
import {
  ArrowDownUp,
  CircleQuestionMark,
  ListFilter,
  MoveRight,
  Plus,
  Tally5,
  TextInitial,
  Trash2,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PopoverListItem from "../../common/PopoverListItem";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Fragment, useEffect, useState } from "react";
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
import type { Column } from "../../types";
import { Input } from "@/components/ui/input";

const stringOperators = [
  "contains",
  "not-contains",
  "equal-to",
  "is-empty",
  "is-not-empty",
];

function getStartCondition(firstColumn: Column) {
  return {
    columnId: firstColumn.id,
    columnType: firstColumn.type,
    operator: firstColumn.type === "text" ? "contains" : "ge",
    value: "",
  };
}

export default function FilterTool({
  tableId,
  viewId,
  columns,
}: {
  tableId: string;
  viewId: string;
  columns: Column[];
}) {
  const utils = api.useUtils();

  const { data: sorts } = api.table.getSorts.useQuery({ viewId });

  const [columnFilters, setColumnFilters] = useState<
    {
      columnId: string;
      columnType: "text" | "number";
      operator: string;
      value: string;
    }[]
  >([]);

  useEffect(() => {
    // console.log("columns", columns);
    // console.log("columnFilters", columnFilters);
    // console.log(columnFilters.length);

    if (columnFilters.length === 0)
      setColumnFilters(columns[0] ? [getStartCondition(columns[0])] : []);
  }, [columns]);

  useEffect(() => console.log("columnFilters", columnFilters), [columnFilters]);

  return (
    <Popover>
      <PopoverTrigger className="ml-2 cursor-pointer">
        <Button variant="ghost">
          <div className="flex items-center justify-center gap-2">
            <ListFilter size={20} />
            <p>Filter</p>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-full min-w-md">
        <div className="flex flex-col items-start justify-start gap-2">
          <div className="flex w-full items-center justify-start gap-2">
            <p className="text-sm font-medium">In this view, show records</p>
          </div>

          <hr className="w-full" />

          <div className="flex w-full flex-col items-start justify-start gap-3">
            {columnFilters.map(
              ({ columnId, columnType, operator, value: filterValue }, index) =>
                columnId && (
                  <div
                    key={index}
                    className="flex items-center justify-start gap-2"
                  >
                    <Select
                      value={columnId}
                      onValueChange={(columnId) =>
                        setColumnFilters((prev) => {
                          return prev.map((filter, currentIndex) => {
                            const columnType =
                              columns.find((col) => col.id === columnId)
                                ?.type ?? "text";

                            if (index === currentIndex)
                              return {
                                columnId,
                                columnType,
                                operator:
                                  columnType === "text"
                                    ? stringOperators[0]!
                                    : "ge",
                                value: "",
                              };

                            return filter;
                          });
                        })
                      }
                    >
                      <SelectTrigger className="w-full min-w-48">
                        <SelectValue placeholder="Column type" />
                      </SelectTrigger>

                      <SelectContent>
                        {columns.map((column) => (
                          <SelectItem key={column.id} value={column.id}>
                            {column.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {columnType === "text" ? (
                      <Select
                        value={stringOperators[0]}
                        onValueChange={(operator) => {
                          setColumnFilters((prev) => {
                            return prev.map((filter, currentIndex) => {
                              if (index === currentIndex)
                                return { ...filter, operator };

                              return filter;
                            });
                          });
                        }}
                      >
                        <SelectTrigger className="w-full min-w-48">
                          <SelectValue placeholder="Column type" />
                        </SelectTrigger>

                        <SelectContent>
                          {stringOperators.map((operator, index) => (
                            <SelectItem key={index} value={operator}>
                              {operator.split("-").join(" ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select
                        value={operator}
                        onValueChange={(operator) => {
                          setColumnFilters((prev) => {
                            return prev.map((filter, currentIndex) => {
                              if (index === currentIndex)
                                return { ...filter, operator };

                              return filter;
                            });
                          });
                        }}
                      >
                        <SelectTrigger className="w-full min-w-48">
                          <SelectValue placeholder="Column type" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="ge">greater than</SelectItem>

                          <SelectItem value="le">less than</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    <Input
                      className="min-w-48"
                      type={columnType === "text" ? "text" : "number"}
                      value={filterValue}
                      onChange={(e) => {
                        setColumnFilters((prev) => {
                          return prev.map((filter, currentIndex) => {
                            if (index === currentIndex)
                              return { ...filter, value: e.target.value };

                            return filter;
                          });
                        });
                      }}
                    />

                    <Button
                      variant="ghost"
                      className="items-centerj flex justify-center"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                ),
            )}

            <Button
              variant="ghost"
              className="items-centerj flex justify-center"
              onClick={() =>
                setColumnFilters((prev) => [
                  ...prev,
                  getStartCondition(columns[0]!),
                ])
              }
            >
              <Plus size={15} />
              <p>Add condition</p>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
