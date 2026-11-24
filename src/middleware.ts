import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/jwt";
import { can } from "@/lib/auth/roles";
import { normalizeCode } from "@/lib/referrals/codes";

const YEAR = 60 * 60 * 24 * 365;

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Waitlist: remember the most recent referral link for 30 days (functional cookie,
  // disclosed in the privacy notice) and give the browser a random device id used
  // only — hashed — for duplicate/self-referral detection.
  if (pathname === "/join") {
    const res = NextResponse.next();
    const code = normalizeCode(searchParams.get("ref"));
    const secure = process.env.NODE_ENV === "production";
    if (code) {
      res.cookies.set("tbc_ref", code, { maxAge: 60 * 60 * 24 * 30, sameSite: "lax", path: "/", httpOnly: true, secure });
      const c = searchParams.get("c");
      if (c && /^[a-z0-9-]{2,40}$/.test(c)) res.cookies.set("tbc_c", c, { maxAge: 60 * 60 * 24 * 30, sameSite: "lax", path: "/", httpOnly: true, secure });
    }
    if (!req.cookies.get("tbc_did")) res.cookies.set("tbc_did", crypto.randomUUID(), { maxAge: YEAR, sameSite: "lax", path: "/", httpOnly: true, secure });
    return res;
  }

  // Edge gate for private areas. Pages re-check permissions server-side (defence in depth).
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith("/admin") && !can(session.role, "admin:view")) {
    return NextResponse.redirect(new URL("/dashboard?denied=1", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/join", "/dashboard/:path*", "/admin/:path*"] };
