import { Button } from "@/components/ui/button";
import { ListFilter, Menu } from "lucide-react";
import type { Column } from "../../types";
import SortTool from "./SortTool";
import HideTool from "./HideTool";
import AddRandomRowsTool from "./AddRandomRowsTool";
import SearchTool from "./SearchTool";

export default function TableFnRow({
  tableId,
  viewId,
  columns,
  toggleViewsBar,
  searchTerm,
  onSearchTermChange,
  searchColumnId,
  onSearchColumnChange,
  onSearch,
  onClearSearch,
  isSearching,
  hasActiveSearch,
  searchFeedback,
}: {
  tableId: string;
  viewId: string;
  columns: Column[];
  toggleViewsBar: () => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  searchColumnId: string | null;
  onSearchColumnChange: (value: string) => void;
  onSearch: () => void;
  onClearSearch: () => void;
  isSearching: boolean;
  hasActiveSearch: boolean;
  searchFeedback: "not-found" | "error" | null;
}) {
  return (
    <div className="flex w-full flex-wrap items-start justify-between gap-2 border-b border-neutral-300 p-1">
      <div className="flex min-w-0 flex-1 flex-wrap items-start gap-2">
        <Menu
          className="ml-3 cursor-pointer"
          size={20}
          onClick={toggleViewsBar}
        />

        <div className="min-w-[240px] flex-1">
          <SearchTool
            columns={columns}
            searchTerm={searchTerm}
            onSearchTermChange={onSearchTermChange}
            selectedColumnId={searchColumnId}
            onSelectColumn={onSearchColumnChange}
            onSearch={onSearch}
            onClear={onClearSearch}
            isSearching={isSearching}
            hasActiveSearch={hasActiveSearch}
            feedback={searchFeedback}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-1">
        <AddRandomRowsTool tableId={tableId} />

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
