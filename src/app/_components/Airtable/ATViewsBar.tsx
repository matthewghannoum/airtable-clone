import { api } from "@/trpc/react";
import PopoverListItem from "../common/PopoverListItem";
import { Plus } from "lucide-react";

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
    <div className="flex h-full min-w-56 flex-col items-start justify-start gap-1 px-1 py-2">
      <PopoverListItem
        text="Create new..."
        icon={<Plus />}
        onClick={() =>
          createView.mutate({ tableId, viewId: crypto.randomUUID() })
        }
      />

      {data?.map(({ name }, index) => (
        <PopoverListItem key={index} text={name} />
      ))}
    </div>
  );
}
