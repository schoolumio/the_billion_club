import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/fraunces";
import "./globals.css";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: "The Billionaire Circle — Together, we build billionaires", template: "%s · The Billionaire Circle" },
  description:
    "10 million people. ₦100 a day. 30 life-changing winners every month — and businesses that create jobs for everyone else. Join the founding community free.",
  keywords: ["community wealth", "Nigeria", "economic empowerment", "business development", "transparency", "job creation"],
  openGraph: {
    type: "website",
    siteName: "The Billionaire Circle",
    title: "10 million people. One shared vision. A new generation of wealth.",
    description: "Join the founding community of Nigeria’s community wealth movement. Free to join.",
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
