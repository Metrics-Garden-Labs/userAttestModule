import { getEndorsementsRecievedByUsername } from "../../../drizzle/db";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    const { githubName } = await request.json();
    console.log(`Received request to get endorsements for user ${githubName}`);

    const endorsements = await getEndorsementsRecievedByUsername(githubName);
    console.log("User Endorsements", endorsements);

    return NextResponse.json({ endorsements }, { status: 200 });
  } catch (error) {
    console.error("Error fetching endorsements:", error);
    return NextResponse.json(
      { error: "Failed to fetch endorsements" },
      { status: 500 }
    );
  }
};
