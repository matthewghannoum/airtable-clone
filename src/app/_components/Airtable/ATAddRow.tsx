import { TableCell, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import type { Column } from "../types";
import { api } from "@/trpc/react";

export default function ATAddRow({
  tableId,
  columns,
  refetch,
}: {
  tableId: string;
  columns: Column[];
  refetch: () => Promise<void>;
}) {
  const utils = api.useUtils();

  const createEmptyRow = api.table.createEmptyRow.useMutation({
    onMutate: async () => {
      // 1) stop outgoing refetches so we don't overwrite our optimistic change
      await utils.table.get.cancel({ tableId });

      // 2) snapshot previous cache
      const prev = utils.table.get.getData({ tableId });

      // 3) update cache optimistically
      if (prev) {
        const emptyRow = columns.reduce(
          (acc, col) => {
            acc[col.id] = null;
            return acc;
          },
          {} as Record<string, null>,
        );

        utils.table.get.setData({ tableId }, () => ({
          columns: prev.columns,
          rows: [...prev.rows, emptyRow],
          rowIds: [...prev.rowIds, "temp-id"],
        }));
      }

      // 4) pass snapshot to error handler for rollback
      return { prev };
    },
  });

  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => {
        createEmptyRow
          .mutateAsync({ tableId })
          .then(async () => {
            await refetch();
          })
          .catch((err) => {
            console.error(err);
          });
      }}
    >
      <TableCell>
        <Plus size={15} />
      </TableCell>
      {columns.map((_, index) => (
        <TableCell
          key={index}
          className={`p-2 ${index === columns.length - 1 ? "border-r border-neutral-300" : ""}`}
        >
          <p className="invisible">a</p>
        </TableCell>
      ))}
    </TableRow>
  );
}
