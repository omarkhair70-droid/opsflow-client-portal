import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function setSessionCookies(response: NextResponse, accessToken?: string | null, refreshToken?: string | null) {
  if (accessToken) {
    response.cookies.set("sb-access-token", accessToken, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: true,
    });
  }

  if (refreshToken) {
    response.cookies.set("sb-refresh-token", refreshToken, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: true,
    });
  }
}

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
