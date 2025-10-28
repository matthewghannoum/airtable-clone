import { db } from "@/server/db";
import { airtables, airtableViews } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function Page(props: PageProps<"/bases/[baseId]">) {
  const { baseId } = await props.params;

  const [atView] = await db
    .select({ airtableId: airtables.id, defaultViewId: airtableViews.id })
    .from(airtables)
    .innerJoin(airtableViews, eq(airtableViews.airtableId, airtables.id))
    .where(eq(airtables.baseId, baseId));

  if (!atView) {
    redirect("/bases");
  }

  const { airtableId, defaultViewId } = atView;

  redirect(`/bases/${baseId}/${airtableId}/${defaultViewId}`);
}
