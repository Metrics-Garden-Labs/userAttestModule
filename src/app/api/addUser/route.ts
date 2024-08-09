import { NextRequest, NextResponse } from "next/server";
import { db, insertUser } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { users } from "@/drizzle/schema";
import { Users } from "@/lib/utils/types";

export const POST = async (request: Request) => {
  try {
    const { accessToken, email, name, image } = await request.json();
    console.log("Received user data:", { email, name, image });

    // Check if a user with the same GitHub ID already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.githubId, name))
      .limit(1)
      .then((result) => result[0]);

    if (existingUser) {
      console.log(
        "User with GitHub ID",
        name,
        "already exists in the database. Skipping insertion."
      );
      return NextResponse.json({ message: "User already exists" });
    }

    // Fetch user data from GitHub only if the user doesn't already exist in the database
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch GitHub user data");
    }

    const githubUser = await response.json();
    console.log("GitHub user data:", githubUser);

    // Sanitize and prepare the user data
    const newUser: Omit<Users, "id" | "createdAt"> = {
      githubId: githubUser.id.toString(),
      name: name || "",
      email: email || "",
      avatarUrl: image || "",
      bio: githubUser.bio || "",
      url: githubUser.html_url || "",
    };

    console.log("Sanitized user data:", newUser);

    // Insert user into database
    const insertedUser = await insertUser(newUser);

    return NextResponse.json(
      { message: "User inserted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error inserting user", error);
    return NextResponse.json(
      { error: "Failed to insert user", details: error.message },
      { status: 500 }
    );
  }
};
