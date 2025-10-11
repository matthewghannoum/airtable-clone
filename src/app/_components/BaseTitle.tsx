"use client";

import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { SquarePen } from "lucide-react";
import { useState } from "react";

export default function BaseTitle({
  title,
  baseId,
}: {
  title: string;
  baseId: string;
}) {
  const [currentTitle, setCurrentTitle] = useState(title);
  const [isEditing, setIsEditing] = useState(false);

  const updateName = api.bases.updateName.useMutation({
    onMutate: ({ name }) => {
      setCurrentTitle(name);
      setIsEditing(false);
    },
  });

  return (
    <>
      {!isEditing ? (
        <>
          <h1 className="text-md font-semibold">{currentTitle}</h1>
          <SquarePen size={15} onClick={() => setIsEditing(true)} />
        </>
      ) : (
        <Input
          className="max-w-48"
          type="text"
          value={currentTitle}
          onChange={(e) => setCurrentTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateName.mutate({ baseId, name: currentTitle });
            }
          }}
          onBlur={() => updateName.mutate({ baseId, name: currentTitle })}
        />
      )}
    </>
  );
}
