"use server";

// src/actions/index.ts

import { signIn, signOut } from "@/auth";

export async function doSocialLogin(formData: FormData) {
  const action = formData.get("action") as string;
  if (typeof window !== "undefined") {
    await signIn(action, { callbackUrl: "/home" });
  }
}

export async function doLogout() {
  if (typeof window !== "undefined") {
    await signOut({ callbackUrl: "/" });
  }
}
