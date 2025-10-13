"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowDownUp,
  CircleQuestionMark,
  EyeOff,
  ListFilter,
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
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
