import { Button } from "@/components/ui/button";
import {
  ArrowDownUp,
  CircleQuestionMark,
  ListFilter,
  MoveRight,
  Plus,
  Tally5,
  TextInitial,
  Trash2,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PopoverListItem from "../../../common/PopoverListItem";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Fragment,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
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
import type { Column } from "../../../types";
import { Input } from "@/components/ui/input";
import type { Condition, GroupOperator } from "./types";
import Filter from "./Filter";
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
  const conditionGroupMap = useConditions((state) => state.conditionGroupMap);
  const addCondition = useConditions((state) => state.addCondition);
  const createNewConditionGroup = useConditions(
    (state) => state.createNewConditionGroup,
  );

  useEffect(() => {
    addCondition("root", {
      conditionId: crypto.randomUUID(),
      columnId: "27a1f78c-5347-493e-83a2-90faae43e70e", // name
      columnType: "text",
      operator: "equal-to",
      value: "work",
    });

    const groupId = createNewConditionGroup("root", "or");

    addCondition(groupId, {
      conditionId: crypto.randomUUID(),
      columnId: "a543e30d-e5c2-4149-a191-e368896f1aa0", // num prs
      columnType: "number",
      operator: "gt",
      value: 2,
    });
    addCondition(groupId, {
      conditionId: crypto.randomUUID(),
      columnId: "81c0bf0c-1bfa-43c7-b5ed-67f20af3ed1b", // notes
      columnType: "text",
      operator: "equal-to",
      value: "case 2",
    });
  }, []);

  useEffect(
    () => console.log("condition map", conditionGroupMap),
    [conditionGroupMap],
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
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
