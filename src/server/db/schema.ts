import { relations, sql } from "drizzle-orm";
import { index, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `airtable-clone_${name}`);

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const bases = createTable("base", (d) => ({
  id: d.uuid().defaultRandom().notNull().primaryKey(),
  name: d.varchar({ length: 255 }).notNull(),
  ownerId: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => users.id),
}));

export const airtables = createTable("airtable", (d) => ({
  id: d.uuid().defaultRandom().notNull().primaryKey(),
  name: d.varchar({ length: 255 }).notNull(),
  baseId: d
    .uuid()
    .notNull()
    .references(() => bases.id),
}));

export const airtableColumns = createTable("at_column", (d) => ({
  id: d.uuid().defaultRandom().notNull().primaryKey(),
  name: d.varchar({ length: 255 }).notNull(),
  type: d.text({ enum: ["text", "number"] }).notNull(),
  airtableId: d
    .uuid()
    .notNull()
    .references(() => airtables.id),
}));

export const airtableViews = createTable("at_view", (d) => ({
  id: d.uuid().defaultRandom().notNull().primaryKey(),
  name: d.varchar({ length: 255 }).notNull(),
  airtableId: d
    .uuid()
    .notNull()
    .references(() => airtables.id),
}));

export const viewSorts = createTable("view_sorts", (d) => ({
  id: d.uuid().defaultRandom().notNull().primaryKey(),
  viewId: d
    .uuid()
    .notNull()
    .references(() => airtableViews.id),
  columnId: d
    .uuid()
    .notNull()
    .references(() => airtableColumns.id),
  sortOrder: d.text({ enum: ["asc", "desc"] }).notNull(),
  sortPriority: d.integer().notNull(),
}));

export const viewDisplaySettings = createTable("view_displays", (d) => ({
  id: d.uuid().defaultRandom().notNull().primaryKey(),
  viewId: d
    .uuid()
    .notNull()
    .references(() => airtableViews.id),
  columnId: d
    .uuid()
    .notNull()
    .references(() => airtableColumns.id),
  displayOrderNum: d.integer().notNull(),
  isHidden: d.boolean().default(false).notNull(),
}));

export const airtableRows = createTable("at_row", (d) => ({
  id: d.uuid().defaultRandom().notNull().primaryKey(),
  values: d.jsonb().$type<Record<string, string | number | null>>().notNull(),
  createdTimestamp: d
    .timestamp({ mode: "date", withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  airtableId: d
    .uuid()
    .notNull()
    .references(() => airtables.id),
}));
