"use client";

import { Input } from "@/components/ui/input";
import { SquarePen } from "lucide-react";
import { useState } from "react";

export default function BaseTitle({ title }: { title: string }) {
  const [titleUpdate, setTitleUpdate] = useState<string | null>(null);

  return (
    <>
      {titleUpdate === null ? (
        <>
          <h1 className="text-md font-semibold">{title}</h1>
          <SquarePen size={15} onClick={() => setTitleUpdate(title)} />
        </>
      ) : (
        <Input
          className="max-w-48"
          type="text"
          value={titleUpdate}
          onChange={(e) => setTitleUpdate(e.target.value)}
        />
      )}
    </>
  );
}
