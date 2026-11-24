import { clsx } from "clsx";

/** Brand colours taken from the supplied logo artwork. */
export const BRAND = { navy: "#0d1b2b", gold: "#d4af37", highlight: "#f5d06a" } as const;

/**
 * The TBC roundel: a gold ring with an inner hairline, a highlight dot at
 * twelve o'clock and the TBC monogram. Drawn on a navy disc so it reads the
 * same on dark and light backgrounds.
 */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <circle cx="50" cy="50" r="47" fill={BRAND.navy} />
      <circle cx="50" cy="50" r="45" fill="none" stroke={BRAND.gold} strokeWidth="3.2" />
      <circle cx="50" cy="50" r="38.5" fill="none" stroke={BRAND.gold} strokeOpacity="0.45" strokeWidth="0.9" />
      <circle cx="50" cy="7.5" r="4.2" fill={BRAND.highlight} />
      <text
        x="50"
        y="51"
        textAnchor="middle"
        dominantBaseline="central"
        fill={BRAND.gold}
        fontFamily="'Fraunces Variable', Georgia, 'DejaVu Serif', serif"
        fontWeight="800"
        fontSize="30"
        letterSpacing="-0.5"
      >
        TBC
      </text>
    </svg>
  );
}

/**
 * Full lockup. `tone="light"` = gold wordmark for navy backgrounds (as supplied);
 * `tone="dark"` = navy wordmark for white backgrounds (gold text on white fails contrast).
 */
export function Logo({ tone = "dark", className, tagline = true, stacked = false, compactOnMobile = false }: { tone?: "dark" | "light"; className?: string; tagline?: boolean; stacked?: boolean; compactOnMobile?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-3", className)}>
      <LogoMark className="h-10 w-10 shrink-0 sm:h-11 sm:w-11" />
      <span className="leading-none">
        <span
          className={clsx("block font-display font-bold uppercase tracking-[0.04em]", stacked ? "whitespace-nowrap text-[0.86rem] leading-[1.15] !tracking-[0.02em]" : "text-[0.95rem] sm:text-[1.05rem]", tone === "dark" ? "text-navy-900" : "text-[#d4af37]")}
          style={{ fontVariationSettings: '"SOFT" 0, "WONK" 0' }}
        >
          {stacked ? <>The Billionaire<br />Circle</> : compactOnMobile ? <><span className="whitespace-nowrap">The Billionaire</span><br className="sm:hidden" /><span className="hidden sm:inline"> </span>Circle</> : "The Billionaire Circle"}
        </span>
        {tagline && (
          <span className={clsx(compactOnMobile ? "hidden sm:block" : "block", "mt-1.5 border-t pt-1.5 text-[0.58rem] font-medium uppercase tracking-[0.16em]", tone === "dark" ? "border-gold-300 text-navy-500" : "border-[#e7d192]/70 text-white/85")}>
            Together, we build billionaires.
          </span>
        )}
      </span>
    </span>
  );
}
