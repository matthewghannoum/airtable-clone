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
  const conditionGroupMap = useConditions((state) => state.conditionTree);
  const filters = useConditions((state) => state.filters);

  const setColumns = useConditions((state) => state.setColumns);
  const addCondition = useConditions((state) => state.addCondition);
  const createNewConditionGroup = useConditions(
    (state) => state.createNewConditionGroup,
  );

  useEffect(() => setColumns(columns), [columns]);

  useEffect(() => {
    addCondition("root", {
      columnId: "27a1f78c-5347-493e-83a2-90faae43e70e", // name
      columnType: "text",
      operator: "equal-to",
      value: "work",
    });

    const groupId = createNewConditionGroup("root", "or");

    addCondition(groupId, {
      columnId: "a543e30d-e5c2-4149-a191-e368896f1aa0", // num prs
      columnType: "number",
      operator: "gt",
      value: 2,
    });
    addCondition(groupId, {
      columnId: "81c0bf0c-1bfa-43c7-b5ed-67f20af3ed1b", // notes
      columnType: "text",
      operator: "equal-to",
      value: "case 2",
    });
  }, []);

  useEffect(
    () => console.log("condition map", conditionGroupMap, filters),
    [conditionGroupMap, filters],
  );

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
