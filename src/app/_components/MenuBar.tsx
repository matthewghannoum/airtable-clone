"use client";

import Link from "next/link";
import { House, Share2, Star, Share, Plus, Store } from "lucide-react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

function MenuItem({
  name,
  href,
  isSelected,
  children,
  type,
}: {
  name: string;
  href: string;
  isSelected?: boolean;
  children?: React.ReactNode;
  type?: "item" | "link";
}) {
  if (!type || type === "item") {
    return (
      <div
        className={`w-full rounded-sm ${isSelected ? "bg-slate-100" : ""} px-4 py-2`}
      >
        <Link
          href={href}
          className="flex items-center justify-start gap-3 text-sm"
        >
          {children}
          <p>{name}</p>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-start gap-2">
      {children}

      <Link href={href} className="text-sm">
        {name}
      </Link>
    </div>
  );
}

export default function MenuBar() {
  const router = useRouter();

  const createBase = api.bases.create.useMutation({
    onSuccess: ({ baseId, tableId }) => {
      router.push(`/bases/${baseId}/${tableId}`);
    },
  });

  return (
    <div className="flex h-full min-w-xs flex-col justify-between gap-2 border-r-1 border-neutral-300 bg-white px-2 pt-2 pb-6 shadow-lg">
      <div>
        <MenuItem name="Home" href="/bases" isSelected>
          <House />
        </MenuItem>

        <MenuItem name="Starred" href="/bases/starred">
          <Star />
        </MenuItem>

        <MenuItem name="Share" href="/bases/share">
          <Share2 />
        </MenuItem>
      </div>

      <div className="flex flex-col justify-end gap-2 px-4">
        <hr className="mx-auto mb-3 w-full border-t-1 border-neutral-300" />

        <MenuItem name="Marketpalce" href="/bases/marketplace" type="link">
          <Store size={15} />
        </MenuItem>

        <MenuItem name="Import" href="/bases/import" type="link">
          <Share size={15} />
        </MenuItem>

        <button
          className="mt-3 rounded-md bg-blue-500 py-2"
          onClick={() => createBase.mutate()}
        >
          <div className="flex w-full cursor-pointer items-center justify-center gap-2">
            <Plus color="white" size={20} />
            <p className="text-sm text-white">Create</p>
          </div>
        </button>
      </div>
    </div>
  );
}
