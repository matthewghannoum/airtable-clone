import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Column } from "../../types";
import { Button } from "@/components/ui/button";
import { Dices, EyeOff, Tally5, TextInitial } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { api } from "@/trpc/react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";

export default function AddRandomRowsTool({ tableId }: { tableId: string }) {
  const utils = api.useUtils();

  const [numRows, setNumRows] = useState<number | undefined>();

  const { mutate, isPending } = api.table.addRandomRows.useMutation({
    onSuccess: () => {
      void utils.table.get.invalidate({ tableId });
    },
  });

  return (
    <Popover>
      <PopoverTrigger className="ml-2 cursor-pointer">
        <Button variant="ghost">
          <div className="flex items-center justify-center gap-2">
            <Dices size={20} />
            <p>Random Rows</p>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="flex w-full min-w-xs flex-col items-start justify-start gap-2"
      >
        <Input
          type="number"
          min={1}
          max={100000}
          placeholder="Number of random rows to add"
          onChange={(e) => setNumRows(Number(e.target.value))}
        />

        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => {
              if (numRows) mutate({ tableId, numRows });
            }}
          >
            Add Rows
          </Button>
          {isPending && <Spinner className="size-5" />}
        </div>
      </PopoverContent>
    </Popover>
  );
}
