"use client";
import { useState } from "react";
import { clsx } from "clsx";
import { Users, Wallet, Landmark, Award, Compass, Factory, Briefcase, Sprout, type LucideIcon } from "lucide-react";

interface Node {
  id: string;
  short: string;
  title: string;
  Icon: LucideIcon;
  body: string;
  money: string;
  benefits: string[];
}

export const ECOSYSTEM: Node[] = [
  { id: "members", short: "Members", title: "Community members", Icon: Users, body: "Ordinary Nigerians join one community with a small, affordable daily contribution. Membership is the foundation of everything else.", money: "Member contribution — not an investment, no promised return.", benefits: ["Eligibility for the approved selection process", "First access to ecosystem jobs and supplier contracts", "Transparent reporting on every naira"] },
  { id: "contrib", short: "Contributions", title: "Accounted contributions", Icon: Wallet, body: "Every contribution is recorded in a reconciled ledger, collected through licensed payment partners and held in segregated accounts.", money: "Held by an independent custodian — never mixed with operating funds.", benefits: ["Real-time personal statement", "Monthly reconciliation", "Independent audit trail"] },
  { id: "funds", short: "Ring-fenced funds", title: "Ring-fenced funds", Icon: Landmark, body: "A published allocation policy divides inflow into separate funds: awards, business capital, community development, reserves and operating costs.", money: "Each fund has its own purpose, rules and reporting line.", benefits: ["No hidden pots", "Reserves protect obligations", "Allocation published before launch"] },
  { id: "benef", short: "Beneficiaries", title: "Approved beneficiaries", Icon: Award, body: "Eligible members take part in a selection process published in advance, independently observed and verifiable after every draw.", money: "Award — legally the beneficiary's, under approved rules.", benefits: ["Published methodology", "Independent observers", "Verified, KYC-checked payment"] },
  { id: "bizdev", short: "Business arm", title: "Investment & business development", Icon: Compass, body: "Beneficiaries may opt into professional support: feasibility, structuring, governance, financial management and mentorship.", money: "Business investment — separate, regulated, governed by written agreements.", benefits: ["Feasibility before capital", "Beneficiary keeps their rights", "Transparent fee and equity terms"] },
  { id: "enterprise", short: "Enterprises", title: "New and expanded enterprises", Icon: Factory, body: "Viable businesses are established or expanded with professional governance and performance monitoring.", money: "Co-investment from the business development fund where appropriate.", benefits: ["Durable assets, not one-off spending", "Quarterly performance reporting", "Impact measurement"] },
  { id: "jobs", short: "Jobs & suppliers", title: "Jobs and local suppliers", Icon: Briefcase, body: "Ecosystem businesses hire, buy and contract locally. Qualified members get first notice of roles, supplier slots and service contracts.", money: "Wages and contracts — earned income flowing back to members.", benefits: ["Member-first job notices", "Supplier registration", "Skills pathways"] },
  { id: "community", short: "Community", title: "Community development", Icon: Sprout, body: "A dedicated community fund invests in skills, local infrastructure and supply-chain readiness in the places members live.", money: "Community fund — grants, not loans and not returns.", benefits: ["Skills and vocational training", "Local infrastructure", "Stronger, more prosperous members"] },
];

export function EcosystemDiagram({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const [active, setActive] = useState(0);
  const node = ECOSYSTEM[active];
  const dark = tone === "dark";
  const R = 40; // radius in % of container

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
      <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <radialGradient id="eco-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d4af37" stopOpacity={dark ? 0.28 : 0.18} />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
            </radialGradient>
            <marker id="eco-arrow" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="3" markerHeight="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill="#d4af37" />
            </marker>
          </defs>
          <circle cx="50" cy="50" r="30" fill="url(#eco-glow)" />
          <circle cx="50" cy="50" r={R} fill="none" stroke={dark ? "#ffffff" : "#0d1b2b"} strokeOpacity="0.12" strokeWidth="0.3" />
          <circle cx="50" cy="50" r={R} fill="none" stroke="#d4af37" strokeWidth="0.45" strokeDasharray="1.2 3.2" className="animate-spin-slow" style={{ transformBox: "view-box", transformOrigin: "50% 50%" }} />
          {ECOSYSTEM.map((_, i) => {
            const a1 = ((i + 0.32) / ECOSYSTEM.length) * Math.PI * 2 - Math.PI / 2;
            const a2 = ((i + 0.68) / ECOSYSTEM.length) * Math.PI * 2 - Math.PI / 2;
            return (
              <path
                key={i}
                d={`M ${50 + R * Math.cos(a1)} ${50 + R * Math.sin(a1)} A ${R} ${R} 0 0 1 ${50 + R * Math.cos(a2)} ${50 + R * Math.sin(a2)}`}
                fill="none"
                stroke="#d4af37"
                strokeWidth="0.6"
                markerEnd="url(#eco-arrow)"
                opacity={i === active ? 1 : 0.5}
              />
            );
          })}
        </svg>

        <div className="absolute left-1/2 top-1/2 flex w-[38%] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center">
          <span className={clsx("text-[0.6rem] font-semibold uppercase tracking-[0.2em] sm:text-[0.65rem]", dark ? "text-gold-300" : "text-gold-700")}>The flywheel</span>
          <span className={clsx("mt-1 font-display text-base leading-tight sm:text-2xl", dark ? "text-white" : "text-navy-950")}>Shared prosperity</span>
          <span className={clsx("mt-1 hidden text-xs sm:block", dark ? "text-navy-300" : "text-navy-500")}>Wealth creation that creates more wealth creation</span>
        </div>

        {ECOSYSTEM.map((n, i) => {
          const a = (i / ECOSYSTEM.length) * Math.PI * 2 - Math.PI / 2;
          const left = 50 + R * Math.cos(a);
          const top = 50 + R * Math.sin(a);
          const on = i === active;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              aria-pressed={on}
              aria-label={n.title}
              className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <span
                className={clsx(
                  "relative flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 sm:h-16 sm:w-16",
                  on
                    ? "scale-110 border-gold-300 bg-gold-500 text-navy-950 shadow-[0_0_0_6px_rgba(200,154,36,0.18)]"
                    : dark
                      ? "border-white/15 bg-navy-900 text-gold-300 group-hover:border-gold-300/60"
                      : "border-navy-100 bg-white text-navy-800 shadow-sm group-hover:border-gold-400",
                )}
              >
                {on && <span className="absolute inset-0 animate-pulse-ring rounded-full border border-gold-300" aria-hidden />}
                <n.Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
              </span>
              <span className={clsx("mt-1.5 hidden whitespace-nowrap text-[0.7rem] font-semibold sm:block", dark ? (on ? "text-white" : "text-navy-300") : on ? "text-navy-950" : "text-navy-500")}>
                {n.short}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className={clsx("rounded-3xl border p-6 sm:p-8", dark ? "border-white/10 bg-white/[0.04] backdrop-blur" : "border-navy-100 bg-white shadow-xl shadow-navy-900/5")}
        aria-live="polite"
      >
        <p className={clsx("text-xs font-semibold uppercase tracking-[0.2em]", dark ? "text-gold-300" : "text-gold-700")}>
          Step {active + 1} of {ECOSYSTEM.length}
        </p>
        <h3 className={clsx("mt-3 text-2xl font-medium sm:text-3xl", dark ? "text-white" : "text-navy-950")}>{node.title}</h3>
        <p className={clsx("mt-4 leading-relaxed", dark ? "text-navy-200" : "text-navy-600")}>{node.body}</p>
        <p className={clsx("mt-5 rounded-xl px-4 py-3 text-sm", dark ? "bg-gold-500/10 text-gold-200" : "bg-gold-50 text-gold-800")}>{node.money}</p>
        <ul className="mt-5 space-y-2">
          {node.benefits.map((b) => (
            <li key={b} className={clsx("flex gap-3 text-sm", dark ? "text-navy-100" : "text-navy-700")}>
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" aria-hidden />
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-7 flex items-center gap-2">
          <button type="button" onClick={() => setActive((active - 1 + ECOSYSTEM.length) % ECOSYSTEM.length)} className={clsx("rounded-full border px-4 py-2 text-xs font-semibold", dark ? "border-white/20 text-white hover:bg-white/10" : "border-navy-200 text-navy-800 hover:bg-navy-50")}>
            Previous
          </button>
          <button type="button" onClick={() => setActive((active + 1) % ECOSYSTEM.length)} className="rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-navy-950 hover:bg-gold-400">
            Next step
          </button>
        </div>
      </div>
    </div>
  );
}
