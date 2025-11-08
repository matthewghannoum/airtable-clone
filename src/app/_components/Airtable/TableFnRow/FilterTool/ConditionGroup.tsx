import { useConditions } from "./ConditionsStore";
import Filter from "./Filter";
import type { Column } from "../../../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ListFilter, Plus, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function ConditionGroup({ columns }: { columns: Column[] }) {
  const conditionTree = useConditions((state) => state.conditionTree);
  const addCondition = useConditions((state) => state.addCondition);
  const createNewConditionGroup = useConditions(
    (state) => state.createNewConditionGroup,
  );

  function NestedCondition({
    groupId,
    depth,
  }: {
    groupId: string;
    depth: number;
  }) {
    const { conditions, groupOperator } = conditionTree[groupId]!;

    return (
      <div
        className={`flex flex-col items-start justify-center gap-2 ${
          groupId === "root"
            ? "bg-white"
            : "rounded-sm border-1 border-gray-300 bg-gray-100 p-4"
        }`}
      >
        {groupId !== "root" && (
          <div className="flex w-full items-center justify-between gap-2">
            <p className="text-sm font-medium">
              All of the following are true...
            </p>

            <div className="flex items-center justify-end gap-1">
              <Popover>
                <PopoverTrigger className="ml-2 cursor-pointer">
                  <Button variant="ghost">
                    <Plus size={15} />
                  </Button>
                </PopoverTrigger>

                <PopoverContent align="end" className="max-w-54">
                  <div className="flex flex-col items-start justify-center gap-2">
                    <Button
                      variant="ghost"
                      className="w-full text-left"
                      onClick={() => addCondition(groupId)}
                    >
                      <p className="w-full">Add condition</p>
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full text-left"
                      onClick={() => createNewConditionGroup(groupId)}
                      disabled={depth >= 3}
                    >
                      <p className="w-full">Add condition group</p>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="ghost"
                className="flex items-center justify-center"
              >
                <Trash2 size={15} />
              </Button>
            </div>
          </div>
        )}

        {conditions.map((conditionId, index) => (
          <div
            key={index}
            className="flex w-full items-start justify-start gap-2"
          >
            {index === 0 ? (
              <div className="flex h-9 items-center justify-start">
                <p className="w-24 pl-3 text-sm">Where</p>
              </div>
            ) : index === 1 ? (
              <Select value={groupOperator}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Group" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="and">and</SelectItem>

                  <SelectItem value="or">or</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="w-24 pl-3 text-sm">{groupOperator}</p>
            )}

            {conditionId.includes("group-id:") ? (
              <NestedCondition groupId={conditionId} depth={depth + 1} />
            ) : (
              <Filter conditionId={conditionId} columns={columns} />
            )}
          </div>
        ))}
      </div>
    );
  }

  return <NestedCondition groupId={"root"} depth={1} />;
}
