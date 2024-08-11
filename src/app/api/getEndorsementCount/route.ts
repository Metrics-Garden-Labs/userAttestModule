import { getUserDataWithEndorsements } from "../../../drizzle/db";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    const { githubName } = await request.json();
    console.log(`Received request to get user data for ${githubName}`);

    const userData = await getUserDataWithEndorsements(githubName);
    console.log("User Data", userData);

    return NextResponse.json({ userData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
};
