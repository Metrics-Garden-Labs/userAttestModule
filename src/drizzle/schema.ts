import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  uniqueIndex,
  json,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    githubId: text("githubId").notNull(),
    username: text("username").notNull(), // GitHub login
    name: text("name"), // Full name (can be null)
    email: text("email").notNull(),
    image: text("image"),
    bio: text("bio"),
    company: text("company"),
    twitter: text("twitter"),
    url: text("url"), // GitHub profile URL
    orgs: json("orgs"), // Store organizations as JSON
    verified: boolean("verified").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").$onUpdateFn(() => new Date()),
  },
  (users) => {
    return {
      uniqueEmailIdx: uniqueIndex("unique_email_idx").on(users.email),
      uniqueGithubIdIdx: uniqueIndex("unique_github_id_idx").on(users.githubId),
      uniqueUsernameIdx: uniqueIndex("unique_username_idx").on(users.username),
    };
  }
);

export const userendorsements = pgTable("userendorsements", {
  id: serial("id").primaryKey(),
  recipientId: integer("userId")
    .notNull()
    .references(() => users.id),
  recipientname: text("username").notNull(),
  endorserId: integer("endorserId")
    .notNull()
    .references(() => users.id),
  endorsername: text("endorsername").notNull(),
  ecc: boolean("ecc").default(false),
  oprd: boolean("oprd").default(false),
  optooling: boolean("optooling").default(false),
  attestationuid: text("attestationuid").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Initialize the database
export const db = drizzle(sql);
