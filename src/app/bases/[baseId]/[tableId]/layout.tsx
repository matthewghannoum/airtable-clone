import BaseTitle from "@/app/_components/BaseTitle";
import { db } from "@/server/db";
import { airtables, bases } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import TableTabs from "@/app/_components/TableTabs";

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

        {children}
      </div>
    </div>
  );
}
