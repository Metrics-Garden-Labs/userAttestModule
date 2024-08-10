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
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    githubId: text("githubId").notNull(),
    username: text("username").notNull(), // GitHub login
    name: text("name"), // Full name (can be null)
    email: text("email").notNull(),
    avatarUrl: text("avatarUrl"),
    bio: text("bio"),
    company: text("company"),
    twitter: text("twitter"),
    url: text("url"), // GitHub profile URL
    orgs: json("orgs"), // Store organizations as JSON
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

// Initialize Drizzle with the Vercel Postgres SQL instance
export const db = drizzle(sql);

// Helper function to insert a user
export const insertUser = async (
  userData: Omit<typeof users.$inferInsert, "id" | "createdAt" | "updatedAt">
) => {
  return db.insert(users).values(userData).returning();
};
