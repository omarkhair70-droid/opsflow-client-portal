import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("access_token");
  const role = searchParams.get("role");

  const response = NextResponse.redirect(`${origin}/auth/route`);
  if (token) {
    response.cookies.set("sb-access-token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });
  }

  if (role) {
    response.cookies.set("opsflow-role", role, { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  }

  return response;
}
