import { redirect } from "next/navigation";

/** Registration now happens on the waitlist page; keep old links working (and keep any referral code). */
export default async function Register({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  redirect(ref ? `/join?ref=${encodeURIComponent(ref)}` : "/join");
}
