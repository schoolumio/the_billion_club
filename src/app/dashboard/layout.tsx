import type { Metadata } from "next";
import { AppShell, type NavItem } from "@/components/app/AppShell";
import { PreLaunchBar } from "@/components/site/PreLaunchBar";
import { requirePermission } from "@/lib/auth/session";
import { logoutAction } from "@/lib/auth/actions";
import { can } from "@/lib/auth/roles";

export const metadata: Metadata = { title: "Member dashboard", robots: { index: false } };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "LayoutDashboard" },
  { href: "/dashboard/contributions", label: "Contributions", icon: "ReceiptText" },
  { href: "/dashboard/opportunities", label: "Opportunities", icon: "Briefcase" },
  { href: "/dashboard/support", label: "Support centre", icon: "LifeBuoy" },
  { href: "/dashboard/profile", label: "Profile & verification", icon: "UserRoundCheck" },
];

export default async function Layout({ children }: { children: React.ReactNode }) {
  const s = await requirePermission("member:dashboard");
  return (
    <>
      <PreLaunchBar />
      <AppShell nav={NAV} area="Member space" user={{ name: s.name, email: s.email, role: s.role }} logout={logoutAction}
        switchLink={can(s.role, "admin:view") ? { href: "/admin", label: "Open administration →" } : undefined}>
        {children}
      </AppShell>
    </>
  );
}
