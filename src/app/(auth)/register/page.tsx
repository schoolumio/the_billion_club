import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Register interest", description: "Register your interest in The Billionaire Circle. Free, no payment." };

export default function Register() {
  return (
    <>
      <h1 className="text-3xl font-medium text-navy-950">Register your interest</h1>
      <p className="mt-2 text-navy-600">Free. No payment. Receive verified updates as we progress through approvals.</p>
      <div className="mt-8"><RegisterForm /></div>
    </>
  );
}
