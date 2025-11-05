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
    <div className="flex h-10 w-full items-center justify-start bg-rose-50">
      {tables.map((table, index) => (
        <div
          key={table.id}
          onClick={() => router.push(`/bases/${baseId}/${table.id}`)}
          className={`flex h-full min-w-16 cursor-pointer items-center justify-center p-2 ${table.id === currentTableId ? `rounded-tr-sm border-r-1 border-neutral-300 bg-white ${index !== 0 ? "rounded-tl-sm border-l-1" : ""}` : "border-b-1"}`}
        >
          <h6 className="inline-block text-xs">{table.name}</h6>
        </div>
      ))}

      <div className="flex h-full w-full items-center justify-start border-b-1">
        <TablePopover
          baseId={baseId}
          tables={tables}
          setTableTabs={setTables}
        />
      </div>
    </div>
  );
}
