import { NextResponse } from "next/server";

export function setSessionCookies(
  response: NextResponse,
  accessToken?: string | null,
  refreshToken?: string | null,
) {
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
