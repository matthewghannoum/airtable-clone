import { Button } from "@/components/ui/button";
import { ListFilter, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect } from "react";
import type { Column } from "../../../types";
import { useConditions } from "./ConditionsStore";
import ConditionGroup from "./ConditionGroup";

export default function FilterTool({
  tableId,
  viewId,
  columns,
}: {
  tableId: string;
  viewId: string;
  columns: Column[];
}) {
  const setColumns = useConditions((state) => state.setColumns);
  const addCondition = useConditions((state) => state.addCondition);
  const createNewConditionGroup = useConditions(
    (state) => state.createNewConditionGroup,
  );

  useEffect(() => setColumns(columns), [columns]);

  return (
    <Popover>
      <PopoverTrigger className="ml-2 cursor-pointer">
        <Button variant="ghost">
          <div className="flex items-center justify-center gap-2">
            <ListFilter size={20} />
            <p>Filter</p>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-full min-w-md">
        <div className="flex flex-col items-start justify-start gap-2">
          <div className="flex w-full items-center justify-start gap-2">
            <p className="text-sm font-medium">In this view, show records</p>
          </div>

          <hr className="w-full" />

          <div className="flex w-full flex-col items-start justify-start gap-3">
            <ConditionGroup columns={columns} />

            <div>
              <Button
                variant="ghost"
                className="text-sm font-normal text-gray-500"
                onClick={() => addCondition("root")}
              >
                <div className="flex items-center justify-center gap-2">
                  <Plus size={5} />
                  <p>Add condition</p>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="text-sm font-normal text-gray-500"
                onClick={() => createNewConditionGroup("root")}
              >
                <div className="flex items-center justify-center gap-2">
                  <Plus size={5} />
                  <p>Add condition group</p>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
