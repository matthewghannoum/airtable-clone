import BaseTitle from "@/app/_components/BaseTitle";
import TablePopover from "@/app/_components/TableTabs/TablePopover";
import TableRow from "@/app/_components/TableTabs";
import { db } from "@/server/db";
import { airtables, bases } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { ArrowDownUp, EyeOff, ListFilter, Table } from "lucide-react";
import TableTabs from "@/app/_components/TableTabs";
import { Button } from "@/components/ui/button";

export default async function BaseLayout(
  props: LayoutProps<"/bases/[baseId]/[tableId]">,
) {
  const { children } = props;
  const { baseId, tableId } = await props.params;

  const [base] = await db
    .select({ name: bases.name })
    .from(bases)
    .where(eq(bases.id, baseId))
    .limit(1);

  if (!base) {
    return <div className="w-full">Base not found</div>;
  }

  const tables = await db
    .select({ id: airtables.id, name: airtables.name })
    .from(airtables)
    .where(eq(airtables.baseId, baseId));

  if (!tables) {
    return <div className="w-full">Table not found</div>;
  }

  return (
    <div className="h-full w-full p-4">
      <div className="h-full w-full rounded-md bg-white shadow">
        <div className="flex w-full items-center justify-start gap-2 border-b-1 border-neutral-300 px-4 py-2">
          <BaseTitle baseId={baseId} title={base.name} />
        </div>

        <TableTabs
          baseId={baseId}
          currentTableId={tableId}
          currentTables={tables}
        />

        <div className="flex items-center justify-end gap-1 border-t border-b border-neutral-300 p-1">
          <Button variant="ghost">
            <div className="flex items-center justify-center gap-2">
              <EyeOff size={20} />
              <p>Hide fields</p>
            </div>
          </Button>

          <Button variant="ghost">
            <div className="flex items-center justify-center gap-2">
              <ListFilter size={20} />
              <p>Filter</p>
            </div>
          </Button>

          <Button variant="ghost">
            <div className="flex items-center justify-center gap-2">
              <ArrowDownUp size={20} />
              <p>Sort</p>
            </div>
          </Button>
        </div>

        {children}
      </div>
    </div>
  );
}
