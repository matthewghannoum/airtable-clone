import { db } from "@/server/db";
import { airtables, airtableViews } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function Page(
  props: PageProps<"/bases/[baseId]/[tableId]">,
) {
  const { baseId, tableId } = await props.params;

  const [atView] = await db
    .select({ defaultViewId: airtableViews.id })
    .from(airtableViews)
    .where(eq(airtableViews.airtableId, tableId));

  if (!atView) {
    redirect("/bases");
  }

  const { defaultViewId } = atView;

  redirect(`/bases/${baseId}/${tableId}/${defaultViewId}`);
}
