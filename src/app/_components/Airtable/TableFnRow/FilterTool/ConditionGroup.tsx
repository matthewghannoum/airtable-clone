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

export default function ConditionGroup({ columns }: { columns: Column[] }) {
  const conditionGroupMap = useConditions((state) => state.conditionGroupMap);

  function NestedCondition({
    groupId,
    depth,
  }: {
    groupId: string;
    depth: number;
  }) {
    const { conditions, groupOperator } = conditionGroupMap[groupId]!;

    return (
      <div
        className={`flex flex-col items-start justify-center gap-2 ${
          groupId === "root"
            ? "bg-white"
            : "rounded-sm border-1 border-gray-300 bg-gray-100 p-4"
        }`}
      >
        {conditions.map((condition, index) => (
          <div key={index} className="flex items-center justify-start gap-2">
            {index === 0 ? (
              <p className="min-w-24">Where</p>
            ) : (
              <Select value={groupOperator}>
                <SelectTrigger className="w-full min-w-24">
                  <SelectValue placeholder="Group" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="and">and</SelectItem>

                  <SelectItem value="or">or</SelectItem>
                </SelectContent>
              </Select>
            )}

            {typeof condition === "string" ? (
              <NestedCondition groupId={condition} depth={depth + 1} />
            ) : (
              <Filter condition={condition} columns={columns} />
            )}
          </div>
        ))}
      </div>
    );
  }

  return <NestedCondition groupId={"root"} depth={1} />;
}
