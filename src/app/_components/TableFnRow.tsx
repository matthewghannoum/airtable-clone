"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowDownUp,
  CircleQuestionMark,
  EyeOff,
  ListFilter,
  MoveRight,
  Tally5,
  TextInitial,
} from "lucide-react";
import type { Column } from "./types";
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
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

function SortTool({ columns }: { columns: Column[] }) {
  const [selectedSorts, setSelectedSorts] = useState<
    { column: Column; sortOrder: "asc" | "desc" }[]
  >([]);

  function updateSortOrder(columnId: string, order: "asc" | "desc") {
    setSelectedSorts((prev) =>
      prev.map((sort) =>
        sort.column.id === columnId ? { ...sort, sortOrder: order } : sort,
      ),
    );
  }

  function updateColumn(columnId: string, newColumn: Column) {
    setSelectedSorts((prev) =>
      prev.map((sort) =>
        sort.column.id === columnId ? { ...sort, column: newColumn } : sort,
      ),
    );
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

      <PopoverContent align="end">
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
            {selectedSorts.length !== 0 ? (
              <>
                {selectedSorts.map(({ column, sortOrder }, index) => (
                  <div
                    key={index}
                    className="flex w-full items-center justify-start gap-2"
                  >
                    <Select
                      value={column.id}
                      onValueChange={(value) =>
                        updateColumn(
                          column.id,
                          columns.find((col) => col.id === value)!,
                        )
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Column type" />
                      </SelectTrigger>

                      <SelectContent>
                        {columns.map((columnOption, optionindex) => (
                          <SelectItem key={optionindex} value={columnOption.id}>
                            {columnOption.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={sortOrder}
                      onValueChange={(value) =>
                        updateSortOrder(column.id, value as "asc" | "desc")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sort order" />
                      </SelectTrigger>

                      <SelectContent>
                        <SortOrderItem type={column.type} />
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </>
            ) : (
              <>
                {columns.map((column, index) => (
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
                      setSelectedSorts((prev) => [
                        ...prev,
                        { column, sortOrder: "asc" },
                      ])
                    }
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

export default function TableFnRow({ columns }: { columns: Column[] }) {
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

      <SortTool columns={columns} />
    </div>
  );
}
