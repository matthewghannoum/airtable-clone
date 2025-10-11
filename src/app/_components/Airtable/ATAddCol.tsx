import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TableRow } from "@/components/ui/table";
import { Plus, Tally5, TextInitial } from "lucide-react";

function ColOption({
  text,
  icon: Icon,
}: {
  text: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex w-full items-center justify-start gap-2 p-1 hover:rounded-sm hover:bg-neutral-100">
      {Icon}
      <p className="text-sm">{text}</p>
    </div>
  );
}

export default function ATAddCol() {
  return (
    <TableRow>
      <div className="flex h-10 min-w-24 items-center justify-center">
        <Popover>
          <PopoverTrigger>
            <Plus />
          </PopoverTrigger>
          <PopoverContent sideOffset={10}>
            <div className="flex flex-col gap-1">
              <p className="mb-1 text-sm text-neutral-500">Standard fields</p>

              <ColOption text="Text" icon={<TextInitial size={15} />} />
              <ColOption text="Number" icon={<Tally5 size={15} />} />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </TableRow>
  );
}
