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
      <div className="min-h-screen bg-neutral-300">
        <div className="mx-auto max-w-7xl p-4">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Your Bases</h1>
            <Link
              href="/bases/new"
              className="rounded bg-white px-4 py-2 font-semibold shadow hover:bg-neutral-100"
            >
              New Base
            </Link>
          </div>
          {baseRows.length === 0 ? (
            <p>You have no bases. Create one to get started!</p>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {baseRows.map((base) => (
                <li key={base.id} className="rounded bg-white p-4 shadow">
                  <Link
                    href={`/bases/${base.id}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {base.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }
}
