import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { users, userendorsements } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export const POST = async (request: NextRequest) => {
  try {
    const { endorserName, recipientName, endorsements, attestationUID } =
      await request.json();

    // Get user IDs
    const endorser = await db
      .select()
      .from(users)
      .where(eq(users.username, endorserName))
      .limit(1);
    const recipient = await db
      .select()
      .from(users)
      .where(eq(users.username, recipientName))
      .limit(1);

    if (!endorser[0] || !recipient[0]) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const newEndorsement = {
      userId: recipient[0].id,
      recipientname: recipientName,
      endorserId: endorser[0].id,
      endorsername: endorserName,
      ecc: endorsements.ethereumCore,
      oprd: endorsements.opStackResearch,
      optooling: endorsements.opStackTooling,
      attestationuid: attestationUID,
    };

    const result = await db
      .insert(userendorsements)
      .values(newEndorsement)
      .returning();

    return NextResponse.json(
      {
        message: "Recommendation added successfully",
        endorsement: result[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding recommendation:", error);
    return NextResponse.json(
      {
        message: "Error adding recommendation",
        error: String(error),
      },
      { status: 500 }
    );
  }
};
