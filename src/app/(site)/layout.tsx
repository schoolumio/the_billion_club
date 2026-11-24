import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PrivacyNotice } from "@/components/site/PrivacyNotice";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <PrivacyNotice />
    </>
  );
}
