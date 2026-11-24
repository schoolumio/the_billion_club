export const NAV = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/ecosystem", label: "How it connects" },
  { href: "/financial-model", label: "The numbers" },
  { href: "/transparency", label: "Transparency" },
  { href: "/faq", label: "FAQ" },
] as const;

/** Shown under "More" on desktop and listed in full in the mobile menu. */
export const NAV_MORE = [
  { href: "/business-development", label: "Business support" },
  { href: "/impact", label: "Impact" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/about", label: "About us" },
  { href: "/compliance", label: "Legal & licensing" },
] as const;

export const FOOTER = {
  Initiative: [
    { href: "/how-it-works", label: "How it works" },
    { href: "/ecosystem", label: "How it all connects" },
    { href: "/business-development", label: "Business support for winners" },
    { href: "/impact", label: "Our impact" },
  ],
  Trust: [
    { href: "/transparency", label: "Transparency" },
    { href: "/financial-model", label: "Where the money goes" },
    { href: "/compliance", label: "Legal & licensing" },
    { href: "/faq", label: "Questions & answers" },
    { href: "/referral-policy", label: "Referral programme policy" },
    { href: "/privacy", label: "Privacy notice" },
    { href: "/terms", label: "Waitlist terms" },
  ],
  Organisation: [
    { href: "/about", label: "About us" },
    { href: "/brand", label: "Brand kit" },
    { href: "/join", label: "Join the waitlist" },
    { href: "/leaderboard", label: "Community leaderboard" },
    { href: "/login", label: "Member sign in" },
  ],
};
