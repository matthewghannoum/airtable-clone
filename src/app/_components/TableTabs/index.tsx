"use client";

import { useRouter } from "next/navigation";
import TablePopover from "./TablePopover";
import { useState } from "react";

export default function TableTabs({
  baseId,
  currentTableId,
  currentTables,
}: {
  baseId: string;
  currentTableId: string;
  currentTables: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [tables, setTables] = useState(currentTables);

  return (
    <div className="flex w-full items-center justify-start bg-rose-50">
      {tables.map((table, index) => (
        <div
          key={table.id}
          onClick={() => router.push(`/bases/${baseId}/${table.id}`)}
          className={`cursor-pointer p-2 ${table.id === currentTableId ? `border-tr-1 rounded-tr-sm border-neutral-300 bg-white ${index !== 0 ? "rounded-lr-sm border-l-1" : ""}` : ""}`}
        >
          <h6 className="inline-block text-xs">{table.name}</h6>
        </div>
      ))}

      <TablePopover baseId={baseId} tables={tables} setTableTabs={setTables} />
    </div>
  );
}
