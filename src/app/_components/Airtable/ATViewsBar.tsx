import { api } from "@/trpc/react";
import PopoverListItem from "../common/PopoverListItem";
import { Ellipsis, Plus } from "lucide-react";

export default function ATViewsBar({ tableId }: { tableId: string }) {
  const utils = api.useUtils();

  const { data } = api.table.getViews.useQuery({ tableId });

  const createView = api.table.createNewView.useMutation({
    onMutate: async ({ viewId }) => {
      // 1) stop outgoing refetches so we don't overwrite our optimistic change
      await utils.table.getViews.cancel({ tableId });

      // 2) snapshot previous cache
      const prev = utils.table.getViews.getData({ tableId });

      if (prev) {
        utils.table.getViews.setData({ tableId }, () => [
          ...prev,
          { id: viewId, name: "Table view", airtableId: tableId },
        ]);
      }

      return { prev };
    },
  });

  return (
    <div className="flex h-full min-w-56 flex-col items-start justify-start gap-1 border-r border-neutral-300 px-1 py-2">
      <PopoverListItem
        text="Create new..."
        icon={<Plus />}
        onClick={() =>
          createView.mutate({ tableId, viewId: crypto.randomUUID() })
        }
      />

      {data?.map(({ name }, index) => (
        <div
          key={index}
          className="hover:bg-accent flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-4 py-2"
        >
          <p className="text-sm">{name}</p>
          <Ellipsis size={20} />
        </div>
      ))}
    </div>
  );
}
