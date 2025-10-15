import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

import { db } from "@/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";

const devAuthConfig: NextAuthConfig = {
  // Pure JWT sessions (no DB rows)
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        // Dev-only dummy user. Replace with real lookup in prod.
        if (
          process.env.NODE_ENV === "development" &&
          creds?.username === "dev" &&
          creds?.password === "dev"
        ) {
          const demoEmail = "dev@example.com";
          const demoName = "Dev User";

          // 1️⃣ Try to find existing user
          const existing = await db
            .select()
            .from(users)
            .where(eq(users.email, demoEmail))
            .limit(1);

          // 2️⃣ If not found, insert and return it
          if (existing.length === 0) {
            const [inserted] = await db
              .insert(users)
              .values({
                id: crypto.randomUUID(),
                name: demoName,
                email: demoEmail,
              })
              .returning();

            if (!inserted) throw new Error("Failed to create demo user");

            return { id: inserted.id, name: demoName, email: demoEmail }; // returned user gets encoded into JWT
          }

          return {
            id: "d68fb6c3-39b4-4cb3-a18d-bc3ce32f8618",
            name: demoName,
            email: demoEmail,
          };
        }
        // Return null to fail sign-in (never throw; never return undefined)
        return null;
      },
    }),
  ],

  callbacks: {
    // Called on sign-in and whenever the JWT is checked/updated
    async jwt({ token, user }) {
      // On initial sign-in, copy fields from the returned user to the token
      if (user) {
        if (user.id) token.id = user.id;
        if (user.name) token.name = user.name;
        if (user.email) token.email = user.email;
      }
      return token; // ALWAYS return the token
    },

    // Controls what goes to the session (client/server via auth()/useSession())
    async session({ session, token }) {
      if (!token?.id) throw new Error("Missing token.id");

      // ensure the object exists
      session.user ??= {
        id: "",
        name: null,
        email: "",
        image: null,
        emailVerified: null,
      };

      // minimal, single cast to satisfy TS (no global type augments)
      (session.user as { id: string }).id = token.id as string;

      // keep your existing mirroring (no null into id)
      session.user.name = token.name ?? session.user.name ?? null;
      session.user.email = token.email ?? session.user.email ?? null;

      return session;
    },
  },
};

const prodAuthConfig = {
  providers: [
    Google,
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
} satisfies NextAuthConfig;

export const authConfig =
  process.env.NODE_ENV === "development" ? devAuthConfig : prodAuthConfig;
