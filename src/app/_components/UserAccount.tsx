"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export default function UserAccount({
  name,
  email,
  popupLocation,
}: {
  name: string;
  email: string;
  popupLocation: "top-right" | "bottom-left";
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
        <div
          className={`absolute z-100 ${popupLocation === "top-right" ? "top-12 right-4" : "bottom-12 left-0"} w-48 rounded-sm border-1 border-neutral-300 bg-white shadow-lg`}
        >
          <p className="px-4 pt-2 text-sm">{name}</p>
          <p className="px-4 pt-1 pb-2 text-xs text-neutral-500">{email}</p>

          <div className="border-t-1 border-neutral-300" />
          <button
            type="button"
            onClick={() => {
              void signOut({ callbackUrl: "/api/auth/signin" });
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100"
          >
            Sign out
          </button>
        </div>
      )}
    </>
  );
}
