import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { hash, attestationUID } = await request.json();

    const githubName = request.cookies.get("githubName")?.value;

    if (!githubName) {
      return NextResponse.json(
        { error: "GitHub username not found in cookies" },
        { status: 400 }
      );
    }

    // Update user in database
    const result = await db
      .update(users)
      .set({ verified: true, verifieduid: attestationUID })
      .where(eq(users.username, githubName))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Verified status added successfully",
      user: result[0],
    });
  } catch (error) {
    console.error("Error adding verified status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
