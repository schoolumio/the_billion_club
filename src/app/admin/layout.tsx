import type { Metadata } from "next";
import { AppShell, type NavItem } from "@/components/app/AppShell";
import { requirePermission } from "@/lib/auth/session";
import { logoutAction } from "@/lib/auth/actions";
import { can, type Permission } from "@/lib/auth/roles";

export const metadata: Metadata = { title: "Administration", robots: { index: false } };

const NAV: (NavItem & { perm: Permission })[] = [
  { href: "/admin", label: "Overview", icon: "LayoutDashboard", perm: "admin:view" },
  { href: "/admin/waitlist", label: "Waitlist & growth", icon: "Sprout", perm: "admin:waitlist" },
  { href: "/admin/referrals", label: "Referral review", icon: "UserSearch", perm: "admin:referrals" },
  { href: "/admin/rewards", label: "Referral rewards", icon: "Coins", perm: "admin:rewards" },
  { href: "/admin/campaigns", label: "Campaigns & promo", icon: "Megaphone", perm: "admin:campaigns" },
  { href: "/admin/referral-settings", label: "Referral settings", icon: "Settings2", perm: "admin:referral-config" },
  { href: "/admin/members", label: "Members", icon: "Users", perm: "admin:members" },
  { href: "/admin/finance", label: "Finance & reconciliation", icon: "Landmark", perm: "admin:finance" },
  { href: "/admin/programmes", label: "Beneficiaries & ventures", icon: "Factory", perm: "admin:finance" },
  { href: "/admin/risk", label: "Compliance & fraud", icon: "ShieldAlert", perm: "admin:risk" },
  { href: "/admin/audit", label: "Audit log", icon: "ScrollText", perm: "admin:audit" },
  { href: "/admin/support", label: "Support desk", icon: "Headset", perm: "admin:support" },
];

export default async function Layout({ children }: { children: React.ReactNode }) {
  const s = await requirePermission("admin:view");
  return (
    <>
      <AppShell nav={NAV.filter((n) => can(s.role, n.perm)).map((n) => ({ href: n.href, label: n.label, icon: n.icon }))} area="Administration" user={{ name: s.name, email: s.email, role: s.role }} logout={logoutAction} switchLink={{ href: "/dashboard", label: "Member view →" }}>
        {children}
      </AppShell>
    </>
  );
}
