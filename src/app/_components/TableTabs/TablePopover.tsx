"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PopoverListItem from "../common/PopoverListItem";
import { ChevronDown, Plus } from "lucide-react";
import { api } from "@/trpc/react";
import type { Dispatch, SetStateAction } from "react";

type Table = { id: string; name: string };

export default function TablePopover({
  baseId,
  tables,
  setTableTabs,
}: {
  baseId: string;
  tables: Table[];
  setTableTabs: Dispatch<
    SetStateAction<
      {
        id: string;
        name: string;
      }[]
    >
  >;
}) {
  const addTable = api.bases.addTable.useMutation({
    onMutate: () => {
      setTableTabs((prev) => [
        ...prev,
        { id: "loading", name: `Table ${prev.length + 1}` },
      ]);
    },
    onSuccess: (data) => {
      setTableTabs((prev) => {
        const newTables = prev.filter((table) => table.id !== "loading");
        return [
          ...newTables,
          { id: data.tableId, name: `Table ${newTables.length + 1}` },
        ];
      });
    },
    onError: () => {
      setTableTabs((prev) => prev.filter((table) => table.id !== "loading"));
      alert("Failed to add table");
    },
  });

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

        <PopoverListItem
          text="Add table"
          icon={<Plus />}
          onClick={() =>
            addTable.mutate({ baseId, tableId: crypto.randomUUID() })
          }
        />
      </PopoverContent>
    </Popover>
  );
}
