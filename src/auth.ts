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
