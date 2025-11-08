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
import PopoverListItem from "../../../common/PopoverListItem";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Fragment,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
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
import type { Column } from "../../../types";
import { Input } from "@/components/ui/input";
import type { Condition } from "./types";

const stringOperators = [
  "contains",
  "not-contains",
  "equal-to",
  "is-empty",
  "is-not-empty",
];

const numberOperators = ["gt", "lt"];

export default function Filter({
  columns,
  condition: { columnId, columnType, operator, value: filterValue },
}: {
  condition: Condition;
  columns: Column[];
}) {
  return (
    <div className="flex items-center justify-start gap-2">
      <Select
        value={columnId}
        // onValueChange={(columnId) =>
        //   setColumnFilters((prev) => {
        //     return prev.map((filter, currentIndex) => {
        //       const columnType =
        //         columns.find((col) => col.id === columnId)?.type ?? "text";

        //       if (index === currentIndex)
        //         return {
        //           ...filter,
        //           columnId,
        //           columnType,
        //           operator: columnType === "text" ? stringOperators[0]! : "ge",
        //           value: "",
        //         };

        //       return filter;
        //     });
        //   })
        // }
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

      <Select
        value={operator}
        // onValueChange={(operator) => {
        //   setColumnFilters((prev) => {
        //     return prev.map((filter, currentIndex) => {
        //       if (index === currentIndex) return { ...filter, operator };

        //       return filter;
        //     });
        //   });
        // }}
      >
        <SelectTrigger className="w-full min-w-48">
          <SelectValue placeholder="Column type" />
        </SelectTrigger>

        <SelectContent>
          {(columnType === "number" ? numberOperators : stringOperators).map(
            (operator, index) => (
              <SelectItem key={index} value={operator}>
                {operator.split("-").join(" ")}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>

      <Input
        className="min-w-48"
        type={columnType === "text" ? "text" : "number"}
        value={filterValue}
        // onChange={(e) => {
        //   setColumnFilters((prev) => {
        //     return prev.map((filter, currentIndex) => {
        //       if (index === currentIndex)
        //         return { ...filter, value: e.target.value };

        //       return filter;
        //     });
        //   });
        // }}
      />

      <Button variant="ghost" className="items-centerj flex justify-center">
        <Trash2 size={15} />
      </Button>
    </div>
  );
}
