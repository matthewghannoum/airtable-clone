import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableRow } from "@/components/ui/table";
import { Plus, Tally5, TextInitial } from "lucide-react";
import { useState } from "react";

function ColOption({
  text,
  icon: Icon,
  onClick,
}: {
  text: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className="flex w-full cursor-pointer items-center justify-start gap-2"
    >
      {Icon}
      <p className="text-sm">{text}</p>
    </Button>
  );
}

export default function ATAddCol() {
  const [isAddingCol, setIsAddingCol] = useState(false);
  const [colType, setColType] = useState<"text" | "number" | null>(null);

  return (
    <TableRow>
      <div className="flex h-10 min-w-24">
        <Popover open={isAddingCol} onOpenChange={setIsAddingCol}>
          <PopoverTrigger className="flex w-full cursor-pointer items-center justify-center">
            <Plus />
          </PopoverTrigger>

          <PopoverContent
            sideOffset={10}
            className="w-[min(var(--radix-popper-available-width),theme(maxWidth.sm))] p-4"
          >
            {!colType ? (
              <div className="flex flex-col gap-1">
                <p className="mb-1 text-sm text-neutral-500">Standard fields</p>

                <ColOption
                  onClick={() => setColType("text")}
                  text="Text"
                  icon={<TextInitial size={15} />}
                />
                <ColOption
                  onClick={() => setColType("number")}
                  text="Number"
                  icon={<Tally5 size={15} />}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Input className="w-full" autoFocus placeholder="Field name" />

                <Select
                  value={colType}
                  onValueChange={(value) =>
                    setColType(value as "text" | "number")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex w-full items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={() => {
                      setColType(null);
                      setIsAddingCol(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button className="cursor-pointer bg-blue-600 hover:bg-blue-700">
                    Create field
                  </Button>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </TableRow>
  );
}
