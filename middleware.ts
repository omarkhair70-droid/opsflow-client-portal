import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function hasSession(req: NextRequest) {
  return Boolean(req.cookies.get("sb-access-token")?.value);
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const protectedRoute = pathname.startsWith("/app/") || pathname.startsWith("/portal/");
  if (protectedRoute && !hasSession(request)) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/app/:path*", "/portal/:path*"] };
