"use client";

import { useRouter } from "next/navigation";

export default function TableRow({
  baseId,
  currentTableId,
  tables,
}: {
  baseId: string;
  currentTableId: string;
  tables: { id: string; name: string }[];
}) {
  const router = useRouter();

  return (
    <>
      {tables.map((table, index) => (
        <div
          key={table.id}
          onClick={() => router.push(`/bases/${baseId}/${table.id}`)}
          className={`cursor-pointer p-2 ${table.id === currentTableId ? `border-tr-1 rounded-tr-sm border-neutral-300 bg-white ${index !== 0 ? "rounded-lr-sm border-l-1" : ""}` : ""}`}
        >
          <h6 className="inline-block text-xs">{table.name}</h6>
        </div>
      ))}
    </>
  );
}
