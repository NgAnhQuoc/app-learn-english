"use server";

import { cookies } from "next/headers";

export async function authenticate(account: string, pass: string) {
  const envAccount = (process.env.ACCOUNT || "").trim();
  const envPassword = (process.env.PASSWORD || "").trim();
  
  if (account.trim() === envAccount && pass.trim() === envPassword) {
    const cookieStore = await cookies();
    cookieStore.set("co_minh_auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    return { success: true };
  }
  return { success: false, error: "Sai tài khoản hoặc mật khẩu!" };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("co_minh_auth");
}
