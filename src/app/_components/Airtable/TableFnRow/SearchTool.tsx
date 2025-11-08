import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { Column } from "../../types";
import { Search, X } from "lucide-react";
import { useMemo } from "react";

type SearchToolProps = {
  columns: Column[];
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedColumnId: string | null;
  onSelectColumn: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  isSearching: boolean;
  hasActiveSearch: boolean;
  feedback: "not-found" | "error" | null;
};

export default function SearchTool({
  columns,
  searchTerm,
  onSearchTermChange,
  selectedColumnId,
  onSelectColumn,
  onSearch,
  onClear,
  isSearching,
  hasActiveSearch,
  feedback,
}: SearchToolProps) {
  const disableSearch = useMemo(() => {
    return !selectedColumnId || searchTerm.trim().length === 0 || isSearching;
  }, [selectedColumnId, searchTerm, isSearching]);

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={selectedColumnId ?? undefined}
          onValueChange={onSelectColumn}
          disabled={columns.length === 0}
        >
          <SelectTrigger className="h-8 w-40">
            <SelectValue placeholder="Column" />
          </SelectTrigger>
          <SelectContent>
            {columns.map((column) => (
              <SelectItem key={column.id} value={column.id}>
                {column.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSearch();
            }
          }}
          placeholder="Search value"
          className="h-8 flex-1 min-w-[160px]"
        />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onSearch}
          disabled={disableSearch}
        >
          {isSearching ? (
            <Spinner className="size-4" />
          ) : (
            <Search className="size-4" />
          )}
          <span className="hidden sm:inline">Search</span>
        </Button>

        {hasActiveSearch && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={isSearching}
          >
            <X className="size-4" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        )}
      </div>

      {feedback === "not-found" && (
        <p className="text-xs text-destructive">No matching cells found.</p>
      )}
      {feedback === "error" && (
        <p className="text-xs text-destructive">
          Unable to search right now. Please try again.
        </p>
      )}
    </div>
  );
}
