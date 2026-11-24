export const NAV = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/ecosystem", label: "Ecosystem" },
  { href: "/financial-model", label: "Financial model" },
  { href: "/transparency", label: "Transparency" },
  { href: "/faq", label: "FAQ" },
] as const;

/** Shown under "More" on desktop and listed in full in the mobile menu. */
export const NAV_MORE = [
  { href: "/business-development", label: "Business arm" },
  { href: "/impact", label: "Impact" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/about", label: "About us" },
  { href: "/compliance", label: "Regulatory readiness" },
] as const;

export const FOOTER = {
  Initiative: [
    { href: "/how-it-works", label: "How it works" },
    { href: "/ecosystem", label: "Community wealth ecosystem" },
    { href: "/business-development", label: "Investment & business arm" },
    { href: "/impact", label: "Community impact" },
  ],
  Trust: [
    { href: "/transparency", label: "Transparency & accountability" },
    { href: "/financial-model", label: "Financial model & scenarios" },
    { href: "/compliance", label: "Legal & regulatory readiness" },
    { href: "/faq", label: "Frequently asked questions" },
    { href: "/referral-policy", label: "Referral programme policy" },
    { href: "/privacy", label: "Privacy notice" },
    { href: "/terms", label: "Waitlist terms" },
  ],
  Organisation: [
    { href: "/about", label: "About us" },
    { href: "/brand", label: "Brand & presentation kit" },
    { href: "/join", label: "Join the waitlist" },
    { href: "/leaderboard", label: "Community leaderboard" },
    { href: "/login", label: "Member sign in" },
  ],
};
