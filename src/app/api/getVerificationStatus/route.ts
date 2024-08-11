import { getUserVerificationStatus } from "@/drizzle/db";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    const { githubName } = await request.json();
    console.log(
      `Received request to getverification status for user ${githubName}`
    );

    const verified = await getUserVerificationStatus(githubName);
    console.log("User Verification Status", verified);

    return NextResponse.json({ verified }, { status: 200 });
  } catch (error) {
    console.error("Error fetching verification status:", error);
    return NextResponse.json(
      { error: "Failed to fetch verification status" },
      { status: 500 }
    );
  }
};
