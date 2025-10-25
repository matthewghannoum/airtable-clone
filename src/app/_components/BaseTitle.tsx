"use client";

import { Input } from "@/components/ui/input";
import { createBaseFaviconDataUrl, getBaseTitle } from "@/lib/baseMetadata";
import { api } from "@/trpc/react";
import { SquarePen } from "lucide-react";
import { useEffect, useState } from "react";

export default function BaseTitle({
  title,
  baseId,
}: {
  title: string;
  baseId: string;
}) {
  const [currentTitle, setCurrentTitle] = useState(() => getBaseTitle(title));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setCurrentTitle(getBaseTitle(title));
  }, [title]);

  const updateName = api.bases.updateName.useMutation({
    onMutate: ({ name }) => {
      setCurrentTitle(name);
      setIsEditing(false);
    },
  });

  useEffect(() => {
    if (isEditing) {
      return;
    }

    const safeTitle = getBaseTitle(currentTitle);
    const faviconHref = createBaseFaviconDataUrl(safeTitle);

    if (typeof document !== "undefined") {
      document.title = safeTitle;

      const existingLink = document.head.querySelector(
        "link[rel*='icon']"
      ) as HTMLLinkElement | null;

      const iconLink = existingLink ?? document.createElement("link");
      iconLink.rel = "icon";
      iconLink.type = "image/svg+xml";
      iconLink.href = faviconHref;

      if (!iconLink.parentElement) {
        document.head.appendChild(iconLink);
      }
    }
  }, [currentTitle, isEditing]);

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
