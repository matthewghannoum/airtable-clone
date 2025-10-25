import Airtable from "@/app/_components/Airtable";

export default async function Page(
  props: PageProps<"/bases/[baseId]/[tableId]">,
) {
  const { baseId, tableId } = await props.params;

  // Uncomment below to add a 5 second delay to test loading ui
  // await new Promise((resolve) => setTimeout(resolve, 5000));

  return (
    <div className="h-full w-full">
      <Airtable tableId={tableId} />
    </div>
  );
}
