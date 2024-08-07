import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    const token = await getToken({ req: request });

    if (!token || !token.accessToken || !token.name) {
      console.log("Not authenticated:", token);
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { accessToken, name: username } = token;
    console.log("Access Token:", accessToken);
    console.log("Username:", username);

    const [userReposResponse, eventsResponse] = await Promise.all([
      fetch("https://api.github.com/user/repos", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
      fetch(`https://api.github.com/users/${username}/events/public`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
