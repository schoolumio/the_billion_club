import type { Metadata } from "next";
import { AppShell, type NavItem } from "@/components/app/AppShell";
import { requirePermission } from "@/lib/auth/session";
import { logoutAction } from "@/lib/auth/actions";
import { can, type Permission } from "@/lib/auth/roles";
import { attentionCounts } from "@/lib/db/queries";

export const metadata: Metadata = { title: "Administration", robots: { index: false } };

type AdminNav = NavItem & { perm: Permission; count?: keyof Awaited<ReturnType<typeof attentionCounts>> };

const NAV: AdminNav[] = [
  { href: "/admin", label: "Overview", icon: "LayoutDashboard", perm: "admin:view", section: "Dashboard" },
  { href: "/admin/waitlist", label: "Waitlist & growth", icon: "Sprout", perm: "admin:waitlist", section: "Growth" },
  { href: "/admin/referrals", label: "Referral review", icon: "UserSearch", perm: "admin:referrals", section: "Growth", count: "review" },
  { href: "/admin/campaigns", label: "Campaigns & messages", icon: "Megaphone", perm: "admin:campaigns", section: "Growth" },
  { href: "/admin/members", label: "Members", icon: "Users", perm: "admin:members", section: "People" },
  { href: "/admin/support", label: "Support desk", icon: "Headset", perm: "admin:support", section: "People", count: "tickets" },
  { href: "/admin/finance", label: "Payments & accounts", icon: "Landmark", perm: "admin:finance", section: "Money" },
  { href: "/admin/rewards", label: "Referral rewards", icon: "Coins", perm: "admin:rewards", section: "Money" },
  { href: "/admin/programmes", label: "Winners & businesses", icon: "Factory", perm: "admin:finance", section: "Money" },
  { href: "/admin/risk", label: "Fraud & compliance", icon: "ShieldAlert", perm: "admin:risk", section: "Safety", count: "alerts" },
  { href: "/admin/audit", label: "Activity log", icon: "ScrollText", perm: "admin:audit", section: "Safety" },
  { href: "/admin/referral-settings", label: "Referral settings", icon: "Settings2", perm: "admin:referral-config", section: "Settings" },
];

export default async function Layout({ children }: { children: React.ReactNode }) {
  const s = await requirePermission("admin:view");
  const counts = await attentionCounts().catch(() => null);
  const nav = NAV.filter((n) => can(s.role, n.perm)).map((n) => ({ href: n.href, label: n.label, icon: n.icon, section: n.section, badge: n.count && counts ? counts[n.count] : undefined }));
  return (
    <AppShell nav={nav} area="Administration" user={{ name: s.name, email: s.email, role: s.role }} logout={logoutAction} switchLink={{ href: "/dashboard", label: "Switch to member view →" }}>
      {children}
    </AppShell>
  );
}
