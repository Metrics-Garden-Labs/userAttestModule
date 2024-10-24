import { NextRequest, NextResponse } from "next/server";
import { db, insertUser } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { users } from "@/drizzle/schema";
import { Users } from "@/lib/utils/types";

export const POST = async (request: Request) => {
  try {
    const { accessToken, email, name, image } = await request.json();
    console.log("Received user data:", { email, name, image });

    // Fetch user data from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("token", accessToken);

    if (!userResponse.ok) {
      throw new Error("Failed to fetch GitHub user data");
    }

    const githubUser = await userResponse.json();
    console.log("GitHub user data:", githubUser);

    if (!githubUser.login) {
      throw new Error("GitHub user data does not include a login (username)");
    }

    // Check if a user with the same GitHub ID already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.githubId, githubUser.id.toString()))
      .limit(1)
      .then((result) => result[0]);

    if (existingUser) {
      console.log(
        "User with GitHub ID",
        githubUser.id,
        "already exists in the database."
      );

      // Prepare fields to update if they are missing or empty
      const updatedFields: Partial<Users> = {};

      if (!existingUser.email && email) {
        updatedFields.email = email;
      }

      if (!existingUser.name && name) {
        updatedFields.name = name;
      }

      if (!existingUser.bio && githubUser.bio) {
        updatedFields.bio = githubUser.bio;
      }

      if (!existingUser.company && githubUser.company) {
        updatedFields.company = githubUser.company;
      }

      if (!existingUser.twitter && githubUser.twitter_username) {
        updatedFields.twitter = githubUser.twitter_username;
      }

      if (!existingUser.image && image) {
        updatedFields.image = image;
      }

      // Only proceed with the update if there are fields to update
      if (Object.keys(updatedFields).length > 0) {
        await db
          .update(users)
          .set(updatedFields)
          .where(eq(users.githubId, githubUser.id.toString()))
          .execute();

        console.log("User updated with new data:", updatedFields);
        return NextResponse.json({ message: "User updated successfully" });
      }

      return NextResponse.json({
        message: "User already exists with complete data",
      });
    }

    // Fetch user's organizations from GitHub
    const orgsResponse = await fetch(
      `https://api.github.com/users/${githubUser.login}/orgs`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!orgsResponse.ok) {
      throw new Error("Failed to fetch GitHub user organizations");
    }

    const orgs = await orgsResponse.json();
    console.log("GitHub user organizations:", orgs);

    // Sanitize and prepare the user data
    const newUser: Omit<Users, "id" | "createdAt" | "updatedAt"> = {
      githubId: githubUser.id.toString(),
      username: githubUser.login,
      name: name || githubUser.name || "",
      email: email || githubUser.email || "",
      image: image || githubUser.avatar_url || "",
      bio: githubUser.bio || "",
      company: githubUser.company || "",
      twitter: githubUser.twitter_username || "",
      orgs: JSON.stringify(
        orgs.map((org: any) => ({
          id: org.id,
          login: org.login,
          avatar_url: org.avatar_url,
          description: org.description,
        }))
      ),
      url: githubUser.html_url || "",
      verified: false,
      verifieduid: "",
    };

    console.log("Sanitized user data:", newUser);
    console.log("Username type:", typeof newUser.username);
    console.log("Username value:", newUser.username);

    // Additional check to ensure username is not null or empty
    if (!newUser.username) {
      throw new Error("Username is null or empty");
    }

    // Insert user into database
    console.log("Attempting to insert user...");
    const insertedUser = await insertUser(newUser);
    console.log("Inserted user:", insertedUser);

    return NextResponse.json(
      { message: "User inserted successfully", user: insertedUser },
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
