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
  userData: Omit<typeof users.$inferInsert, "id" | "createdAt" | "updatedAt">
) => {
  console.log("Inserting user data:", userData);
  const result = await db.insert(users).values(userData).returning();
  console.log("Insert result:", result);
  return result[0];
};
