import Airtable from "@/app/_components/Airtable";

export default async function Page(
  props: PageProps<"/bases/[baseId]/[tableId]/[viewId]">,
) {
  const { tableId, viewId } = await props.params;

  // Uncomment below to add a 5 second delay to test loading ui
  // await new Promise((resolve) => setTimeout(resolve, 5000));

  return <Airtable tableId={tableId} viewId={viewId} />;
}
