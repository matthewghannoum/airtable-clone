import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/server/db/schema";
import { env } from "@/env";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
const providers = [
  ...(env.NODE_ENV === "development"
    ? [
        Credentials({
          name: "Credentials",
          credentials: {
            username: { label: "Username", type: "text" },
            password: { label: "Password", type: "password" },
          },
          authorize: async (credentials) => {
            if (!credentials?.username || !credentials?.password) {
              return null;
            }

            const expectedUsername = env.AUTH_DEV_USERNAME ?? "codex";
            const expectedPassword = env.AUTH_DEV_PASSWORD ?? "codex";

            if (
              credentials.username !== expectedUsername ||
              credentials.password !== expectedPassword
            ) {
              return null;
            }

            const email = `${expectedUsername}@example.com`;

            const existingUser = await db.query.users.findFirst({
              where: eq(users.email, email),
            });

            const userRecord =
              existingUser ??
              (await db
                .insert(users)
                .values({
                  email,
                  name: "Local Developer",
                })
                .returning()
                .then((rows) => rows[0]!));

            return {
              id: userRecord.id,
              email: userRecord.email,
              name: userRecord.name,
            };
          },
        }),
      ]
    : []),
  ...(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET ? [Google] : []),
] satisfies NextAuthConfig["providers"];

export const authConfig = {
  providers,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  callbacks: {
    session: ({ session, token, user }) => {
      if (!session.user) return session;

      const id = user?.id ?? token?.sub ?? session.user.id ?? "";

      return {
        ...session,
        user: {
          ...session.user,
          id,
        },
      };
    },
  },
  secret:
    env.AUTH_SECRET ?? (env.NODE_ENV === "development" ? "dev-auth-secret" : undefined),
} satisfies NextAuthConfig;
