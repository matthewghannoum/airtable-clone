import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Column } from "../../types";
import { Button } from "@/components/ui/button";
import { EyeOff, Tally5, TextInitial } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { api } from "@/trpc/react";
import { limit } from "..";

export default function HideTool({
  tableId,
  viewId,
  columns,
}: {
  tableId: string;
  viewId: string;
  columns: Column[];
}) {
  const utils = api.useUtils();

  const updateIsHiddenColumn = api.table.updateIsHiddenColumn.useMutation({
    onMutate: async ({ viewId, columnId, isHidden }) => {
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
                columns: page.columns.map((column) => {
                  if (column.id === columnId) return { ...column, isHidden };
                  return column;
                }),
              })) ?? [],
          };
        });
      }

      // 4) pass snapshot to error handler for rollback
      return { prev };
    },
    onSuccess: () => {
      void utils.table.get.invalidate({ tableId });
    },
  });

  return (
    <Popover>
      <PopoverTrigger className="ml-2 cursor-pointer">
        <Button variant="ghost">
          <div className="flex items-center justify-center gap-2">
            <EyeOff size={20} />
            <p>Hide fields</p>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="flex w-full min-w-xs flex-col items-start justify-start gap-2"
      >
        {columns.map((column, index) => (
          <div key={index} className="flex items-center justify-start gap-2">
            <Switch
              defaultChecked={!column.isHidden}
              onCheckedChange={(isChecked) =>
                updateIsHiddenColumn.mutate({
                  viewId,
                  columnId: column.id,
                  isHidden: !isChecked,
                })
              }
            />
            {column.type === "text" ? (
              <TextInitial size={15} />
            ) : (
              <Tally5 size={15} />
            )}
            <p className="text-sm">{column.name}</p>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}
