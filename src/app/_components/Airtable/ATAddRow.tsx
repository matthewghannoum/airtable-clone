import { TableCell, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import type { Column } from "../types";
import { api } from "@/trpc/react";
import { limit } from ".";

export default function ATAddRow({
  tableId,
  viewId,
  columns,
  // refetch,
  virtualRowStart,
}: {
  tableId: string;
  viewId: string;
  columns: Column[];
  // refetch: () => Promise<void>;
  virtualRowStart: number;
}) {
  const utils = api.useUtils();

  const createEmptyRow = api.table.createEmptyRow.useMutation({
    onMutate: async ({ rowId }) => {
      // 1) stop outgoing refetches so we don't overwrite our optimistic change
      await utils.table.get.cancel({ tableId, viewId, limit });

      // 2) snapshot previous cache
      const prev = utils.table.get.getInfiniteData({ tableId, viewId, limit });

      // 3) update cache optimistically
      if (prev) {
        utils.table.get.setInfiniteData({ tableId, viewId, limit }, (old) => {
          if (!old) return { pages: [], pageParams: [] };

          const emptyRow = columns.reduce(
            (acc, col) => {
              acc[col.id] = null;
              return acc;
            },
            {} as Record<string, null>,
          );

          const lastPage = old?.pages[old?.pages.length - 1];

          if (!lastPage) return { pages: [], pageParams: [] };

          lastPage.rows = [...lastPage.rows, emptyRow];
          lastPage.rowIds = [...lastPage.rowIds, rowId];

          return {
            ...old,
            pages:
              old?.pages.map((page, index) =>
                index < old?.pages.length - 1 ? page : lastPage,
              ) ?? [],
          };
        });
      }

      // 4) pass snapshot to error handler for rollback
      return { prev };
    },
    onError: (err, newTodo, context) => {
      if (context?.prev) {
        utils.table.get.setInfiniteData(
          { tableId, viewId, limit },
          context.prev,
        );
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      void utils.table.get.invalidate({ tableId, viewId });
    },
  });

  return (
    <TableRow
      className="flex w-full cursor-pointer border-b-1 border-neutral-300"
      onClick={() => {
        createEmptyRow.mutate({ tableId, rowId: crypto.randomUUID() });
        // createEmptyRow
        //   .mutateAsync({ tableId, rowId: crypto.randomUUID() })
        //   .then(async () => {
        //     await refetch();
        //   })
        //   .catch((err) => {
        //     console.error(err);
        //   });
      }}
      style={{
        position: "absolute",
        transform: `translateY(${virtualRowStart}px)`, // this should always be a `style` as it changes on scroll
      }}
    >
      <TableCell className="h-9 flex-1">
        <div className="flex h-full items-center">
          <Plus size={15} />
        </div>
      </TableCell>
      {columns.map((_, index) => (
        <TableCell
          key={index}
          className={`h-9 flex-1 p-2 ${index === columns.length - 1 ? "border-r border-neutral-300" : ""}`}
        >
          <p className="invisible">a</p>
        </TableCell>
      ))}
    </TableRow>
  );
}
