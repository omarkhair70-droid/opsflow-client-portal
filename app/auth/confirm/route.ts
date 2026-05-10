import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { setSessionCookies } from "@/lib/auth-cookies";

type SupportedVerifyOtpType = "email" | "signup";

function isSupportedVerifyOtpType(value: string | null): value is SupportedVerifyOtpType {
  return value === "email" || value === "signup";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  if (!tokenHash || !isSupportedVerifyOtpType(type)) {
    return NextResponse.redirect(`${url.origin}/login`);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error || !data.session) {
    return NextResponse.redirect(`${url.origin}/login`);
  }

  const response = NextResponse.redirect(`${url.origin}/auth/route`);
  setSessionCookies(response, data.session.access_token, data.session.refresh_token);
  return response;
}
