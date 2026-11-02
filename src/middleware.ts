import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
export async function middleware(req: NextRequest) {
  try {
    await jwtVerify(req.cookies.get("token")?.value!, new TextEncoder().encode(process.env.JWT_SECRET!));
    return NextResponse.next();
  } catch {
    return req.nextUrl.pathname.startsWith("/api")
      ? NextResponse.json({ error: "unauthorized" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", req.url));
  }
}
export const config = {
  matcher: ["/((?!login|forgot|reset|api/auth|api/health|_next|favicon.ico|sw.js|manifest.webmanifest|icon-|offline.html).*)"],
};