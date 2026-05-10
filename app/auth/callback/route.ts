import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { setSessionCookies } from "@/lib/auth-cookies";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const accessToken = url.searchParams.get("access_token");
  const refreshToken = url.searchParams.get("refresh_token");

  const response = NextResponse.redirect(`${url.origin}/auth/route`);

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    setSessionCookies(response, data.session?.access_token, data.session?.refresh_token);
    return response;
  }

  setSessionCookies(response, accessToken, refreshToken);
  return response;
}
