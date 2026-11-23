import { clsx } from "clsx";

/** Brand mark: a ring of twelve members surrounding three ascending bars — community creating growth. */
export function LogoMark({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const ring = tone === "dark" ? "#0b1834" : "#ffffff";
  const dots = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    return { x: 20 + Math.cos(a) * 15.5, y: 20 + Math.sin(a) * 15.5 };
  });
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={1.7} fill={ring} opacity={0.35 + (i % 3) * 0.25} />
      ))}
      <rect x="12.5" y="21" width="4" height="7" rx="1" fill="#c89a24" />
      <rect x="18" y="16.5" width="4" height="11.5" rx="1" fill="#d8ae3f" />
      <rect x="23.5" y="12" width="4" height="16" rx="1" fill="#e3c46a" />
    </svg>
  );
}

export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="h-9 w-9" tone={tone} />
      <span className="leading-none">
        <span className={clsx("block font-display text-[1.05rem] font-semibold tracking-tight", tone === "dark" ? "text-navy-900" : "text-white")}>
          The Billion Club
        </span>
        <span className={clsx("mt-1 block text-[0.62rem] font-medium uppercase tracking-[0.22em]", tone === "dark" ? "text-gold-700" : "text-gold-300")}>
          Community Wealth Initiative
        </span>
      </span>
    </span>
  );
}
