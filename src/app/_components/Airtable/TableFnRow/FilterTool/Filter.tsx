import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Column } from "../../../types";
import { Input } from "@/components/ui/input";
import { useConditions } from "./ConditionsStore";

const stringOperators = [
  "contains",
  "not-contains",
  "equal-to",
  "is-empty",
  "is-not-empty",
];

const numberOperators = ["gt", "lt"];

export default function Filter({
  columns,
  groupId,
  conditionId,
}: {
  groupId: string;
  conditionId: string;
  columns: Column[];
}) {
  const filters = useConditions((state) => state.filters);

  const updateFilter = useConditions((state) => state.updateFilter);
  const removeFilter = useConditions((state) => state.removeFilter);

  const filter = filters[conditionId]!;
  const { columnId, columnType, operator, value: filterValue } = filter;

  const [updatedFilterValue, setUpdatedFilterValue] = useState<
    string | undefined
  >();

  useEffect(() => setUpdatedFilterValue(`${filterValue}`), []);

  return (
    <div className="flex w-full items-center justify-start gap-2">
      <Select
        value={columnId}
        onValueChange={(columnId) => {
          const columnType =
            columns.find((col) => col.id === columnId)?.type ?? "text";
          const operator = columnType === "text" ? stringOperators[0]! : "ge";
          const value = "";

          updateFilter(conditionId, { columnId, columnType, operator, value });
        }}
      >
        <SelectTrigger className="w-full min-w-48">
          <SelectValue placeholder="Column type" />
        </SelectTrigger>

        <SelectContent>
          {columns.map((column) => (
            <SelectItem key={column.id} value={column.id}>
              {column.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={operator}
        onValueChange={(operator) => {
          updateFilter(conditionId, { ...filter, operator });
        }}
      >
        <SelectTrigger className="w-full min-w-48">
          <SelectValue placeholder="Column type" />
        </SelectTrigger>

        <SelectContent>
          {(columnType === "number" ? numberOperators : stringOperators).map(
            (operator, index) => (
              <SelectItem key={index} value={operator}>
                {operator.split("-").join(" ")}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>

      <Input
        className="min-w-48"
        type={columnType === "text" ? "text" : "number"}
        value={updatedFilterValue}
        onChange={(e) => setUpdatedFilterValue(e.target.value)}
        onBlur={() => {
          if (updatedFilterValue)
            updateFilter(conditionId, { ...filter, value: updatedFilterValue });
        }}
      />

      <Button
        variant="ghost"
        className="items-centerj flex justify-center"
        onClick={() => removeFilter(groupId, conditionId)}
      >
        <Trash2 size={15} />
      </Button>
    </div>
  );
}
