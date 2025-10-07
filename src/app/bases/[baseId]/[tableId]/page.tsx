import Airtable from "@/app/_components/Airtable";

export default async function Page(
  props: PageProps<"/bases/[baseId]/[tableId]">,
) {
  const { baseId, tableId } = await props.params;

  return (
    <div className="w-full">
      <Airtable tableId={tableId} />
    </div>
  );
}
