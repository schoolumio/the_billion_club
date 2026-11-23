import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession, type SessionClaims } from "./jwt";
import { can, type Permission } from "./roles";

export async function getSession(): Promise<SessionClaims | null> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

export async function startSession(c: SessionClaims) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await signSession(c), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Server-side guard: use at the top of every protected page and action. */
export async function requirePermission(perm: Permission): Promise<SessionClaims> {
  const s = await getSession();
  if (!s) redirect("/login");
  if (!can(s.role, perm)) redirect("/dashboard?denied=1");
  return s;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
