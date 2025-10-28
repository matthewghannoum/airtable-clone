import { api } from "@/trpc/react";
import PopoverListItem from "../common/PopoverListItem";
import { Ellipsis, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useRouter, usePathname } from "next/navigation";

export default function ATViewsBar({
  tableId,
  viewId,
}: {
  tableId: string;
  viewId: string;
}) {
  const utils = api.useUtils();

  const router = useRouter();
  const pathname = usePathname();

  function redirectToView(viewId: string) {
    const parts = pathname.split("/");
    parts[parts.length - 1] = viewId; // replace last segment
    const newPath = parts.join("/");
    router.replace(newPath); // replace() prevents adding a new history entry
  }

  const [editView, setEditView] = useState<
    { id: string; name: string; airtableId: string } | undefined
  >();

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

  const updateViewName = api.table.updateViewName.useMutation({
    onMutate: async () => {
      // 1) stop outgoing refetches so we don't overwrite our optimistic change
      await utils.table.getViews.cancel({ tableId });

      // 2) snapshot previous cache
      const prev = utils.table.getViews.getData({ tableId });

      if (prev) {
        utils.table.getViews.setData({ tableId }, () =>
          prev.map((view) => {
            if (editView && editView.id === view.id) return editView;
            return view;
          }),
        );
        setEditView(undefined);
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

      {data?.map(({ name, id, airtableId }, index) => (
        <div
          key={index}
          className={`hover:bg-accent ${id === viewId ? "bg-accent" : ""} flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-4 py-2`}
          onClick={() => redirectToView(id)}
        >
          {!editView || editView.id != id ? (
            <p className="text-sm">{name}</p>
          ) : (
            <Input
              className="w-full"
              value={editView.name}
              onChange={(e) =>
                setEditView({ ...editView, name: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateViewName.mutate({ viewId: id, name: editView.name });
                }
              }}
            />
          )}

          <Popover>
            <PopoverTrigger>
              <Ellipsis size={20} />
            </PopoverTrigger>

            <PopoverContent
              align="start"
              sideOffset={5}
              className="w-[min(var(--radix-popper-available-width),theme(maxWidth.xs))] p-4"
            >
              <PopoverListItem
                text="Rename view"
                icon={<Pencil />}
                onClick={() => setEditView({ id, name, airtableId })}
              />
              <PopoverListItem text="Delete view" icon={<Trash2 />} />
            </PopoverContent>
          </Popover>
        </div>
      ))}
    </div>
  );
}
