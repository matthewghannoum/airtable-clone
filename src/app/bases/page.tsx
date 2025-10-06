import Link from "next/link";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { bases } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export default async function Home() {
  const session = await auth();

  if (session) {
    const baseRows = await db
      .select()
      .from(bases)
      .where(eq(bases.ownerId, session.user.id));

    return (
      <>
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
      </>
    );
  }
}
