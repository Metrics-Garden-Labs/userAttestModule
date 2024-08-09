import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(), // Primary key
    githubId: text("githubId").notNull(), // GitHub user ID
    name: text("username").notNull(), // GitHub username
    email: text("email").notNull(), // User email
    avatarUrl: text("avatarUrl").notNull(), // URL to the GitHub profile picture
    bio: text("bio"), // GitHub profile bio
    url: text("url"), // URL to the GitHub profile
    createdAt: timestamp("createdAt").defaultNow().notNull(), // Creation timestamp
    updatedAt: timestamp("updatedAt").$onUpdateFn(() => new Date()),
  },
  (users) => {
    return {
      uniqueEmailIdx: uniqueIndex("unique_email_idx").on(users.email), // Unique index on email
      uniqueGithubIdIdx: uniqueIndex("unique_github_id_idx").on(users.githubId), // Unique index on GitHub ID
    };
  }
);
