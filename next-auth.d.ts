import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    provider?: "google" | "github";
    user: {
      googleName?: string;
      githubName?: string;
      googleEmail?: string;
      githubEmail?: string;
      googleImage?: string;
      githubImage?: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    accessToken?: string;
    provider?: "google" | "github";
    googleName?: string;
    githubName?: string;
    googleEmail?: string;
    githubEmail?: string;
    googleImage?: string;
    githubImage?: string;
  }
}
