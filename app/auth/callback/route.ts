import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const accessToken = searchParams.get("access_token");
  const refreshToken = searchParams.get("refresh_token");
  const response = NextResponse.redirect(`${origin}/auth/route`);

  if (accessToken) response.cookies.set("sb-access-token", accessToken, { httpOnly: true, path: "/", sameSite: "lax", secure: true });
  if (refreshToken) response.cookies.set("sb-refresh-token", refreshToken, { httpOnly: true, path: "/", sameSite: "lax", secure: true });

  return response;
}
