import { db } from "@/server/db";
import { airtables, bases } from "@/server/db/schema";
import { eq } from "drizzle-orm";

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
        <div className="w-full border-b-1 border-neutral-300 px-4 py-2">
          <h1 className="text-md font-semibold">{base.name}</h1>
        </div>

        <div className="flex w-full justify-start bg-rose-100">
          {tables.map((table, index) => (
            <div
              key={table.id}
              className={`p-2 ${table.id === tableId ? `border-tr-1 rounded-tr-sm border-neutral-300 bg-white ${index !== 0 ? "rounded-lr-sm border-l-1" : ""}` : ""}`}
            >
              <h6 className="inline-block text-xs">{table.name}</h6>
            </div>
          ))}
        </div>

        {children}
      </div>
    </div>
  );
}
