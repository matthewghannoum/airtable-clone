import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import MenuBar from "@/app/_components/MenuBar";
import UserAccount from "@/app/_components/UserAccount";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { bases } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id) redirect("/");

  if (session) {
    const baseRows = await db
      .select()
      .from(bases)
      .where(eq(bases.ownerId, session.user.id));

    return (
      <div className="flex h-screen flex-col bg-neutral-100">
        <div className="flex min-h-14 w-full items-center justify-between border-b-1 border-neutral-300 bg-white px-4 py-2 shadow-sm">
          <Image src="/images/logo.svg" alt="Logo" width={100} height={20} />

          <UserAccount
            name={session.user.name ?? "User"}
            email={session.user.email ?? "No email"}
          />
        </div>

        <div className="flex h-full items-start justify-items-start">
          <MenuBar />

          <div className="w-full px-12 py-8">
            <h1 className="mb-6 text-2xl font-semibold tracking-wide">Home</h1>

            {baseRows.length === 0 ? (
              <p>You have no bases. Create one to get started!</p>
            ) : (
              <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {baseRows.map((base, i) => (
                  <Link
                    key={i}
                    href={`/bases/${base.id}`}
                    className="flex items-center gap-4 rounded-md border-1 border-neutral-200 bg-white px-6 py-4 shadow-2xs"
                  >
                    <div className="flex min-h-12 min-w-12 items-center justify-center rounded-md bg-rose-900">
                      <p className="inline-block text-white">
                        {base.name.slice(0, 2)}
                      </p>
                    </div>

                    <div>
                      <p className="mb-0.5 text-xs font-medium">{base.name}</p>
                      <p className="text-xs">Opened just now</p>
                    </div>
                  </Link>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }
}
