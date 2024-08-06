// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import GitHubProvider from "next-auth/providers/github";

// export const {
//   handlers: { GET, POST },
//   auth,
//   signIn,
//   signOut,
// } = NextAuth({
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID ?? "",
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
//       authorization: {
//         params: {
//           prompt: "consent",
//           access_type: "offline",
//           response_type: "code",
//         },
//       },
//     }),
//     GitHubProvider({
//       clientId: process.env.GITHUB_CLIENT_ID ?? "",
//       clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
//       authorization: {
//         params: {
//           prompt: "consent",
//           access_type: "offline",
//           response_type: "code",
//         },
//       },
//     }),
//   ],
// });

// src/auth.ts

// src/auth.ts
"use client";

import {
  getSession,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "next-auth/react";
import { Session } from "next-auth";

export async function signIn(provider: string, options?: any) {
  return nextAuthSignIn(provider, options);
}

export async function signOut(options?: any) {
  return nextAuthSignOut(options);
}

export async function getAuthSession() {
  return getSession();
}
