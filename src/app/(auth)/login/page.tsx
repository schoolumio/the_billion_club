import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <>
      <h1 className="text-3xl font-medium text-navy-950">Welcome back</h1>
      <p className="mt-2 text-navy-600">Sign in to your member space.</p>
      <div className="mt-8"><LoginForm next={next} /></div>
      <div className="mt-10 rounded-2xl border border-dashed border-navy-200 p-5 text-xs text-navy-600">
        <p className="font-semibold text-navy-800">Demonstration accounts</p>
        <ul className="mt-2 space-y-1 font-mono">
          <li>member@demo.tbc · Demo#2026</li>
          <li>admin@demo.tbc · Admin#2026</li>
          <li>auditor@demo.tbc · Audit#2026</li>
          <li>support@demo.tbc · Support#2026</li>
        </ul>
        <p className="mt-2">Remove these accounts before any production deployment.</p>
      </div>
    </>
  );
}
