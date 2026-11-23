import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PreLaunchBar } from "@/components/site/PreLaunchBar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PreLaunchBar />
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
