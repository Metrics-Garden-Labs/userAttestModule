import "@/drizzle/envConfig";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import * as schema from "./schema";
import { users } from "./schema";

import { Users } from "@/lib/utils/types";

export const db = drizzle(sql, { schema });

export const getUsers = async () => {
  return db.query.users.findMany();
};

export const insertUser = async (
  user: Omit<Users, "id" | "createdAt">
): Promise<void> => {
  try {
    await db
      .insert(users)
      .values({
        githubId: user.githubId,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        url: user.url,
      })
      .onConflictDoNothing(); // Avoid duplicates based on your unique constraints
  } catch (error) {
    console.error("Error inserting user:", error);
    throw new Error("Failed to insert user");
  }
};
