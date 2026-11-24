import type { Metadata } from "next";
import { AppShell, type NavItem } from "@/components/app/AppShell";
import { requirePermission } from "@/lib/auth/session";
import { logoutAction } from "@/lib/auth/actions";
import { can } from "@/lib/auth/roles";

export const metadata: Metadata = { title: "Member dashboard", robots: { index: false } };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: "LayoutDashboard", short: "Home", section: "Founding community" },
  { href: "/dashboard/referrals", label: "Invite & referrals", icon: "Gift", short: "Invite", section: "Founding community" },
  { href: "/dashboard/promote", label: "Promotion kit", icon: "Megaphone", short: "Share", section: "Founding community" },
  { href: "/dashboard/opportunities", label: "Opportunities", icon: "Briefcase", short: "Jobs", section: "Opportunities & money" },
  { href: "/dashboard/contributions", label: "Payment history", icon: "ReceiptText", section: "Opportunities & money" },
  { href: "/dashboard/support", label: "Help & support", icon: "LifeBuoy", section: "Account" },
  { href: "/dashboard/profile", label: "Profile & verification", icon: "UserRoundCheck", section: "Account" },
];

export default async function Layout({ children }: { children: React.ReactNode }) {
  const s = await requirePermission("member:dashboard");
  return (
    <>
      <AppShell nav={NAV} area="Member area" action={{ href: "/dashboard/referrals", label: "Invite" }} user={{ name: s.name, email: s.email, role: s.role }} logout={logoutAction}
        switchLink={can(s.role, "admin:view") ? { href: "/admin", label: "Open administration →" } : undefined}>
        {children}
      </AppShell>
    </>
  );
}
