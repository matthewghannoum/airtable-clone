import BaseTitle from "@/app/_components/BaseTitle";
import TableTabs from "@/app/_components/TableTabs";
import UserAccount from "@/app/_components/UserAccount";
import BackLogo from "@/app/_components/common/BackLogo";
import { createBaseFaviconDataUrl, getBaseTitle } from "@/lib/baseMetadata";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { airtables, bases } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import type LayoutProps from "next";
import { redirect } from "next/navigation";
export async function generateMetadata(
  props: LayoutProps<"/bases/[baseId]/[tableId]">
): Promise<Metadata> {
  const { baseId } = await props.params;

  const [base] = await db
    .select({ name: bases.name })
    .from(bases)
    .where(eq(bases.id, baseId))
    .limit(1);

  const baseTitle = getBaseTitle(base?.name);

  return {
    title: baseTitle,
    icons: {
      icon: createBaseFaviconDataUrl(baseTitle),
    },
  };
}

export default async function BaseLayout(
  props: LayoutProps<"/bases/[baseId]/[tableId]">,
) {
  const { children } = props;
  const { baseId, tableId } = await props.params;

  const session = await auth();

  if (!session?.user) redirect("/");

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
    <div className="flex h-screen bg-neutral-100">
      <aside className="flex h-full w-16 flex-col items-center justify-between border-r-1 border-neutral-200 bg-white py-6 shadow-sm">
        <div className="flex flex-col items-center gap-4">
          <BackLogo />
        </div>

        <div className="relative flex items-center justify-center">
          <UserAccount
            name={session.user.name ?? "User"}
            email={session.user.email ?? "No email"}
            popupLocation="bottom-left"
          />
        </div>
      </aside>

      <div className="flex h-full flex-1 flex-col">
        <div className="flex h-12 w-full items-center border-b-1 border-neutral-200 bg-white px-4 text-sm font-medium shadow-sm">
          <BaseTitle baseId={baseId} title={baseTitle} />
        </div>

        <div className="flex h-full flex-1 flex-col overflow-hidden p-4">
          <div className="flex h-full w-full flex-col overflow-hidden rounded-md bg-white shadow">
            <TableTabs
              baseId={baseId}
              currentTableId={tableId}
              currentTables={tables}
            />

            <div className="flex-1 overflow-auto">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
