import { Button } from "@/components/ui/button";
import { EyeOff, ListFilter, Menu } from "lucide-react";
import type { Column } from "../../types";
import SortTool from "./SortTool";
import HideTool from "./HideTool";

export default function TableFnRow({
  tableId,
  viewId,
  columns,
  toggleViewsBar,
}: {
  tableId: string;
  viewId: string;
  columns: Column[];
  toggleViewsBar: () => void;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-1 border-t border-b border-neutral-300 p-1">
      <Menu
        className="ml-3 cursor-pointer"
        size={20}
        onClick={toggleViewsBar}
      />

      <div className="flex items-center justify-between gap-1">
        <HideTool tableId={tableId} columns={columns} viewId={viewId} />

        <Button variant="ghost">
          <div className="flex items-center justify-center gap-2">
            <ListFilter size={20} />
            <p>Filter</p>
          </div>
        </Button>

        <SortTool tableId={tableId} columns={columns} viewId={viewId} />
      </div>
    </div>
  );
}
