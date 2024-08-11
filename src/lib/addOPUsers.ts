import { drizzle } from "drizzle-orm/vercel-postgres";
import { db } from "../drizzle/db";
import { users } from "../drizzle/schema";
import { sql } from "@vercel/postgres";
import { eq, desc, count } from "drizzle-orm";

import "dotenv/config";

// List of users to add
const userList: any = [];

async function insertUsers() {
  const POSTGRES_URL = process.env.POSTGRES_URL;

  if (!POSTGRES_URL) {
    console.error("POSTGRES_URL not found in environment variables");
    return;
  }

  process.env.POSTGRES_URL = POSTGRES_URL;

  const db = drizzle(sql);

  try {
    for (const user of userList) {
      // Select only the `username` field
      const existingUser = await db
        .select({ username: users.username })
        .from(users)
        .where(eq(users.username, user.login))
        .execute();

      if (existingUser.length > 0) {
        console.log(
          `User with username ${user.login} already exists. Skipping insertion.`
        );
        continue;
      }

      // If the username does not exist, insert the new user
      await db.insert(users).values({
        githubId: user.id.toString(), // Using the GitHub ID as a string
        username: user.login,
        name: null, // Use the provided name or set to null if not available
        email: "", // Unique placeholder email
        image: user.avatar_url,
        url: user.url,
        orgs: null, // Assuming no orgs data provided in this example
        verified: false, // Defaulting to false as we don't have verification info
        verifieduid: null,
        createdAt: new Date(),
      });
    }
    console.log("Users inserted successfully");
  } catch (error) {
    console.error("Error inserting users:", error);
  }
}

// Execute the function
insertUsers();
