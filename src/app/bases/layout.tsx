import Link from "next/link";
import { House, Share2, Star, Share, Plus, Store } from "lucide-react";

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

function MenuBar() {
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

        <button className="mt-3 rounded-md bg-blue-500 py-2">
          <div className="flex w-full items-center justify-center gap-2">
            <Plus color="white" size={20} />
            <p className="text-sm text-white">Create</p>
          </div>
        </button>
      </div>
    </div>
  );
}

export default async function BasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col bg-neutral-100">
      <div className="min-h-14 w-full border-b-1 border-neutral-300 bg-white shadow-sm"></div>

      <div className="flex h-full items-start justify-items-start">
        <MenuBar />

        <div className="w-full px-12 py-8">
          <h1 className="mb-6 text-2xl font-semibold tracking-wide">Home</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
