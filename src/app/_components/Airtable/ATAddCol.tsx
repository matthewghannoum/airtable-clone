import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { Plus, Tally5, TextInitial } from "lucide-react";
import { useState } from "react";
import PopoverListItem from "../common/PopoverListItem";

export default function ATAddCol({ tableId }: { tableId: string }) {
  const utils = api.useUtils();

  const [isAddingCol, setIsAddingCol] = useState(false);
  const [colType, setColType] = useState<"text" | "number" | null>(null);
  const [colName, setColName] = useState<string | null>(null);

  const addCol = api.table.addColumn.useMutation({
    onMutate: async ({ columnId, name, type }) => {
      // 1) stop outgoing refetches so we don't overwrite our optimistic change
      await utils.table.get.cancel({ tableId });

      // 2) snapshot previous cache
      const prev = utils.table.get.getData({ tableId });

      // 3) update cache optimistically
      if (prev) {
        const newCol = {
          id: columnId,
          name: name,
          displayOrderNum: prev.columns.length,
          type: type,
          airtableId: tableId,
          sortOrder: null,
          sortPriority: null,
        };

        utils.table.get.setData({ tableId }, () => ({
          columns: [...prev.columns, newCol],
          rows: prev.rows,
          rowIds: prev.rowIds,
        }));
      }
    },

    onSuccess: () => {
      setIsAddingCol(false);
      setColType(null);
      setColName(null);
    },
    onSettled: () => {
      void utils.table.get.invalidate({ tableId });
    },
  });

  return (
    <div className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
      <div className="flex h-10 min-w-24">
        <Popover open={isAddingCol} onOpenChange={setIsAddingCol}>
          <PopoverTrigger className="flex w-full cursor-pointer items-center justify-center">
            <Plus />
          </PopoverTrigger>

          <PopoverContent
            sideOffset={10}
            className="w-[min(var(--radix-popper-available-width),theme(maxWidth.sm))] p-4"
          >
            {!colType ? (
              <div className="flex flex-col gap-1">
                <p className="mb-1 text-sm text-neutral-500">Standard fields</p>

                <PopoverListItem
                  onClick={() => setColType("text")}
                  text="Text"
                  icon={<TextInitial size={15} />}
                />
                <PopoverListItem
                  onClick={() => setColType("number")}
                  text="Number"
                  icon={<Tally5 size={15} />}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Input
                  className="w-full"
                  autoFocus
                  placeholder="Field name"
                  onChange={(e) => setColName(e.target.value)}
                />

                <Select
                  value={colType}
                  onValueChange={(value) =>
                    setColType(value as "text" | "number")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex w-full items-center justify-end gap-2">
                  <Button variant="ghost" className="cursor-pointer">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (colName)
                        addCol.mutate({
                          columnId: crypto.randomUUID(),
                          tableId,
                          name: colName,
                          type: colType,
                        });
                    }}
                    className="cursor-pointer bg-blue-600 hover:bg-blue-700"
                  >
                    Create field
                  </Button>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
