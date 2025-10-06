"use client";

import Link from "next/link";
import { useState } from "react";

export default function UserAccount({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm text-white"
      >
        {name.charAt(0)}
      </button>

      {isAccountMenuOpen && (
        <div className="absolute top-12 right-4 w-48 rounded-sm border-1 border-neutral-300 bg-white shadow-lg">
          <p className="px-4 pt-2 text-sm">{name}</p>
          <p className="px-4 pt-1 pb-2 text-xs text-neutral-500">{email}</p>

          <div className="border-t-1 border-neutral-300" />
          <Link href="/api/auth/signout">
            <p className="px-4 py-2 text-sm hover:bg-neutral-100">Sign out</p>
          </Link>
        </div>
      )}
    </>
  );
}
