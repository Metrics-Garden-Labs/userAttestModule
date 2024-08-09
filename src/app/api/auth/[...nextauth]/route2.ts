import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "https://www.googleapis.com/auth/gmail.readonly email profile https://www.googleapis.com/auth/userinfo.profile",
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
        if (account.provider === "google") {
          token.googleAccessToken = account.access_token;
          if (profile) {
            token.googleName = profile.name;
            token.googleEmail = profile.email;
            token.googleImage = profile.image;
          }
        } else if (account.provider === "github") {
          token.githubAccessToken = account.access_token;
          if (profile) {
            token.githubName = profile.name;
            token.githubEmail = profile.email;
            token.githubImage = profile.image;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          googleName: token.googleName,
          githubName: token.githubName,
          googleEmail: token.googleEmail,
          githubEmail: token.githubEmail,
          googleImage: token.googleImage,
          githubImage: token.githubImage,
          googleAccessToken: token.googleAccessToken,
          githubAccessToken: token.githubAccessToken,
        },
      };
    },
  },
};

export default NextAuth(authOptions);
