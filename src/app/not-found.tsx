import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";
export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center bg-navy-950 px-4 text-center text-white">
      <LogoMark className="h-20 w-20" />
      <h1 className="mt-6 text-4xl font-medium">Page not found</h1>
      <p className="mt-3 text-navy-300">The page you are looking for does not exist or has moved.</p>
      <Link href="/" className="mt-8 rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950">Return home</Link>
    </main>
  );
}
