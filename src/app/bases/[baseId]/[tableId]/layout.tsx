import BaseTitle from "@/app/_components/BaseTitle";
import TableTabs from "@/app/_components/TableTabs";
import UserAccount from "@/app/_components/UserAccount";
import BackLogo from "@/app/_components/common/BackLogo";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { airtables, bases } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import type LayoutProps from "next";
import { redirect } from "next/navigation";
import { Buffer } from "buffer";

function createFaviconDataUrl(title: string) {
  const trimmedTitle = title.trim() || "Base";
  const initials = (() => {
    const characters = Array.from(trimmedTitle).filter((char) => char.trim());
    const firstTwo = characters.slice(0, 2).join("");
    return (firstTwo || "BA").toUpperCase();
  })();

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" ry="12" fill="oklch(41% 0.159 10.272)" />
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="'Inter', 'Segoe UI', sans-serif" font-size="36" fill="#fff">${initials}</text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export async function generateMetadata(
  props: LayoutProps<"/bases/[baseId]/[tableId]">,
): Promise<Metadata> {
  const { baseId } = await props.params;

  const [base] = await db
    .select({ name: bases.name })
    .from(bases)
    .where(eq(bases.id, baseId))
    .limit(1);

  const baseName = base?.name ?? "Base";

  return {
    title: baseName,
    icons: {
      icon: createFaviconDataUrl(baseName),
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
          <BaseTitle baseId={baseId} title={base.name} />
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
