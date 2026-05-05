import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const accessToken = url.searchParams.get("access_token");
  const refreshToken = url.searchParams.get("refresh_token");

  const response = NextResponse.redirect(`${url.origin}/auth/route`);

  if (code) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
    return response;
  }

  if (accessToken) response.cookies.set("sb-access-token", accessToken, { httpOnly: true, path: "/", sameSite: "lax", secure: true });
  if (refreshToken) response.cookies.set("sb-refresh-token", refreshToken, { httpOnly: true, path: "/", sameSite: "lax", secure: true });
  return response;
}
