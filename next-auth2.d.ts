import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      googleName?: string;
      githubName?: string;
      googleEmail?: string;
      githubEmail?: string;
      googleImage?: string;
      githubImage?: string;
      googleAccessToken?: string;
      githubAccessToken?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    googleAccessToken?: string;
    githubAccessToken?: string;
    googleName?: string;
    githubName?: string;
    googleEmail?: string;
    githubEmail?: string;
    googleImage?: string;
    githubImage?: string;
  }
}
