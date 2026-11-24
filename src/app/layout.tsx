import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/fraunces";
import "./globals.css";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: "The Billionaire Circle — Community Wealth Initiative", template: "%s · The Billionaire Circle" },
  description:
    "10 million people. ₦100 a day. A transparently governed community wealth initiative that funds awards, builds businesses and creates jobs across Nigeria. Pre-launch.",
  keywords: ["community wealth", "Nigeria", "economic empowerment", "business development", "transparency", "job creation"],
  openGraph: {
    type: "website",
    siteName: "The Billionaire Circle",
    title: "10 million people. One shared vision. A new generation of wealth.",
    description: "A proposed, transparently governed community wealth creation initiative for Nigeria.",
    locale: "en_NG",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#0d1b2b", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG">
      <body className="min-h-dvh bg-white">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
