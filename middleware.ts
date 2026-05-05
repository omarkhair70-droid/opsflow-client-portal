import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const internalOnlyRoutes = ["/internal"];
const clientOnlyRoutes = ["/portal"];

export function middleware(request: NextRequest) {
  const role = request.cookies.get("opsflow-role")?.value;
  const pathname = request.nextUrl.pathname;

  if (internalOnlyRoutes.some((r) => pathname.startsWith(r)) && !["internal_admin", "internal_member"].includes(role ?? "")) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  if (clientOnlyRoutes.some((r) => pathname.startsWith(r)) && !["client_admin", "client_member"].includes(role ?? "")) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/internal/:path*", "/portal/:path*"],
};
