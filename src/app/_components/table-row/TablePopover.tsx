"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PopoverListItem from "../common/PopoverListItem";
import { ChevronDown, Plus } from "lucide-react";

export default function TablePopover({
  tables,
}: {
  tables: { id: string; name: string }[];
}) {
  return (
    <Popover>
      <PopoverTrigger className="ml-2 cursor-pointer">
        <ChevronDown size={20} className="text-neutral-500" />
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="flex flex-col items-start justify-start gap-2"
      >
        {tables.map((table) => (
          <PopoverListItem key={table.id} text={table.name} />
        ))}

        <hr className="w-full" />

        <PopoverListItem text="Add table" icon={<Plus />} />
      </PopoverContent>
    </Popover>
  );
}
