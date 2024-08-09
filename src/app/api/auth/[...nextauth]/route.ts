import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { JWT } from "next-auth/jwt";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "https://www.googleapis.com/auth/gmail.readonly email profile https://www.googleapis.com/auth/userinfo.profile email",
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token as string;
        token.provider = account.provider as "google" | "github";
        if (account.provider === "google" && profile) {
          token.googleName = profile.name;
          token.googleEmail = profile.email;
          token.googleImage = profile.image;
        } else if (account.provider === "github" && profile) {
          token.githubName = profile.name;
          token.githubEmail = profile.email;
          token.githubImage = profile.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      const typedToken = token as JWT & {
        provider?: "google" | "github";
        googleName?: string;
        githubName?: string;
        googleEmail?: string;
        githubEmail?: string;
        googleImage?: string;
        githubImage?: string;
      };

      session.accessToken = typedToken.accessToken as string;
      session.provider = typedToken.provider;
      session.user = {
        ...session.user,
        googleName: typedToken.googleName,
        githubName: typedToken.githubName,
        googleEmail: typedToken.googleEmail,
        githubEmail: typedToken.githubEmail,
        googleImage: typedToken.googleImage,
        githubImage: typedToken.githubImage,
      };
      console.log("session", session);
      return session;
    },
  },
  debug: true,
});

export { handler as GET, handler as POST };
