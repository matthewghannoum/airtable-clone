import { Button } from "@/components/ui/button";
import {
  ArrowDownUp,
  CircleQuestionMark,
  MoveRight,
  Plus,
  Tally5,
  TextInitial,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PopoverListItem from "../../common/PopoverListItem";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Fragment } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/trpc/react";
import type { Column } from "../../types";

function SortOrderItem({ type }: { type: "text" | "number" }) {
  const lowChar = type === "text" ? "A" : "1";
  const highChar = type === "text" ? "Z" : "9";

  return (
    <>
      <SelectItem value="asc">
        <div className="flex items-center justify-start gap-2">
          <p>{lowChar}</p>
          <MoveRight size={15} />
          <p>{highChar}</p>
        </div>
      </SelectItem>

      <SelectItem value="desc">
        <div className="flex items-center justify-start gap-2">
          <p>{highChar}</p>
          <MoveRight size={15} />
          <p>{lowChar}</p>
        </div>
      </SelectItem>
    </>
  );
}

export default function SortTool({
  tableId,
  viewId,
  columns,
}: {
  tableId: string;
  viewId: string;
  columns: Column[];
}) {
  const utils = api.useUtils();

  const { data: sorts } = api.table.getSorts.useQuery({ viewId });

  const addSort = api.table.addSort.useMutation({
    onMutate: async ({ settingId, viewId, columnId, columnType }) => {
      // 1) stop outgoing refetches so we don't overwrite our optimistic change
      await utils.table.getSorts.cancel({ viewId });

      // 2) snapshot previous cache
      const prev = utils.table.getSorts.getData({ viewId });

      // 3) update cache optimistically
      if (prev) {
        utils.table.getSorts.setData({ viewId }, () => [
          ...prev,
          {
            id: settingId,
            viewId,
            columnId,
            columnType,
            sortOrder: "asc",
            sortPriority: 2,
          },
        ]);
      }

      // 4) pass snapshot to error handler for rollback
      return { prev };
    },
    onSuccess: () => {
      void utils.table.get.invalidate({ tableId });
    },
  });

  const removeSort = api.table.removeSort.useMutation({
    onMutate: async ({ settingId, viewId }) => {
      // 1) stop outgoing refetches so we don't overwrite our optimistic change
      await utils.table.getSorts.cancel({ viewId });

      // 2) snapshot previous cache
      const prev = utils.table.getSorts.getData({ viewId });

      // 3) update cache optimistically
      if (prev) {
        utils.table.getSorts.setData({ viewId }, () =>
          prev.filter((sort) => sort.id !== settingId),
        );
      }

      // 4) pass snapshot to error handler for rollback
      return { prev };
    },
    onSuccess: () => {
      void utils.table.get.invalidate({ tableId });
    },
  });

  const updateSortOrder = api.table.updateSortOrder.useMutation({
    onMutate: async (input) => {
      // 1) stop outgoing refetches so we don't overwrite our optimistic change
      await utils.table.getSorts.cancel({ viewId });

      // 2) snapshot previous cache
      const prev = utils.table.getSorts.getData({ viewId });

      // 3) update cache optimistically
      if (prev) {
        utils.table.getSorts.setData({ viewId }, () =>
          prev.map((sortSetting) => {
            if (sortSetting.id === input.settingId)
              return { ...sortSetting, sortOrder: input.sortOrder };
            return sortSetting;
          }),
        );
      }

      // 4) pass snapshot to error handler for rollback
      return { prev };
    },
    onSuccess: () => {
      void utils.table.get.invalidate({ tableId });
    },
  });

  const updateSortColumn = api.table.updateSortColumn.useMutation({
    onMutate: async (input) => {
      // 1) stop outgoing refetches so we don't overwrite our optimistic change
      await utils.table.getSorts.cancel({ viewId });

      // 2) snapshot previous cache
      const prev = utils.table.getSorts.getData({ viewId });

      // 3) update cache optimistically
      if (prev) {
        utils.table.getSorts.setData({ viewId }, () =>
          prev.map((sortSetting) => {
            if (sortSetting.id === input.settingId)
              return { ...sortSetting, columnId: input.columnId };
            return sortSetting;
          }),
        );
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
            <ArrowDownUp size={20} />
            <p>Sort</p>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-full min-w-md">
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
            {sorts && sorts.length !== 0 ? (
              <div className="flex flex-col items-start justify-start gap-2">
                {sorts.map((sortSetting, index) => (
                  <div
                    key={index}
                    className="flex w-full items-center justify-start gap-3"
                  >
                    <Select
                      value={sortSetting.columnId}
                      onValueChange={(value) =>
                        updateSortColumn.mutate({
                          settingId: sortSetting.id,
                          columnId: value,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Column type" />
                      </SelectTrigger>

                      <SelectContent>
                        {columns.map((columnOption) => (
                          <SelectItem
                            key={columnOption.id}
                            value={columnOption.id}
                          >
                            {columnOption.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={sortSetting.sortOrder}
                      onValueChange={(value) =>
                        updateSortOrder.mutate({
                          settingId: sortSetting.id,
                          sortOrder: value as "asc" | "desc",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sort order" />
                      </SelectTrigger>

                      <SelectContent>
                        <SortOrderItem type={sortSetting.columnType} />
                      </SelectContent>
                    </Select>

                    <X
                      size={25}
                      className="ml-2 cursor-pointer"
                      onClick={() =>
                        removeSort.mutate({
                          settingId: sortSetting.id,
                          viewId: sortSetting.viewId,
                        })
                      }
                    />
                  </div>
                ))}

                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button
                      variant="ghost"
                      className="p-0 hover:bg-transparent"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <Plus size={10} />
                        <p>Add another sort</p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    {columns.map(({ id: columnId, name, type }, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() =>
                          addSort.mutate({
                            settingId: crypto.randomUUID(),
                            viewId,
                            columnId,
                            columnType: type,
                          })
                        }
                      >
                        {name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                {columns.map(({ id: columnId, name, type }, index) => (
                  <Fragment key={index}>
                    <PopoverListItem
                      key={index}
                      text={name}
                      icon={
                        type === "text" ? (
                          <TextInitial size={15} />
                        ) : (
                          <Tally5 size={15} />
                        )
                      }
                      onClick={() =>
                        addSort.mutate({
                          settingId: crypto.randomUUID(),
                          viewId,
                          columnId,
                          columnType: type,
                        })
                      }
                    />
                  </Fragment>
                ))}
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
