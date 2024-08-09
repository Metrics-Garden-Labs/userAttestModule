import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const username = searchParams.get("username");

    if (!token || !username) {
      console.log("Missing token or username");
      return NextResponse.json(
        { error: "Missing token or username" },
        { status: 400 }
      );
    }

    const [userReposResponse, eventsResponse] = await Promise.all([
      fetch("https://api.github.com/user/repos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      fetch(`https://api.github.com/users/${username}/events/public`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ]);

    if (!userReposResponse.ok) {
      const errorText = await userReposResponse.text();
      console.error("Failed to fetch user repositories:", errorText);
      throw new Error("Failed to fetch user repositories");
    }

    if (!eventsResponse.ok) {
      const errorText = await eventsResponse.text();
      console.error("Failed to fetch user events:", errorText);
      throw new Error("Failed to fetch user events");
    }

    const userRepos = await userReposResponse.json();
    const events = await eventsResponse.json();

    // Extract repositories from events
    const contributedRepos = events
      .filter((event: any) => event.type === "PushEvent")
      .map((event: any) => event.repo)
      .filter(
        (repo: any, index: number, self: any) =>
          self.findIndex((r: any) => r.id === repo.id) === index
      );

    const data = {
      userRepos,
      contributedRepos,
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
};
