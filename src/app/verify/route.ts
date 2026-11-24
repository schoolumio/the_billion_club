import { NextResponse, type NextRequest } from "next/server";
import { consumeEmailToken } from "@/lib/referrals/server";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const r = token.length > 10 ? await consumeEmailToken(token) : { ok: false, reason: "Missing verification token." };
  const dest = new URL(r.ok ? "/dashboard/referrals?verified=1" : `/login?verify_error=${encodeURIComponent(r.reason ?? "Verification failed")}`, req.url);
  const res = NextResponse.redirect(dest);
  if (r.ok) res.cookies.delete("tbc_demo_verify");
  return res;
}
