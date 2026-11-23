import { SignJWT, jwtVerify } from "jose";
import type { Role } from "./roles";

export const SESSION_COOKIE = "tbc_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

export interface SessionClaims {
  sub: string;
  email: string;
  name: string;
  role: Role;
}

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set to at least 32 characters");
  return new TextEncoder().encode(s);
}

export async function signSession(c: SessionClaims): Promise<string> {
  return new SignJWT({ email: c.email, name: c.name, role: c.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(c.sub)
    .setIssuedAt()
    .setIssuer("the-billion-club")
    .setAudience("tbc-web")
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { issuer: "the-billion-club", audience: "tbc-web" });
    return { sub: String(payload.sub), email: String(payload.email), name: String(payload.name), role: payload.role as Role };
  } catch {
    return null;
  }
}
