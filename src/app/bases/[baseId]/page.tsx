import { db } from "@/server/db";
import { airtables } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function Page(props: PageProps<"/bases/[baseId]">) {
  const { baseId } = await props.params;

  const [airtableRow] = await db
    .select({ id: airtables.id })
    .from(airtables)
    .where(eq(airtables.baseId, baseId));

  if (!airtableRow) {
    redirect("/bases");
  }

  redirect(`/bases/${baseId}/${airtableRow.id}`);
}
