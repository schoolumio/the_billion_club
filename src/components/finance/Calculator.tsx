"use client";
import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { AlertTriangle, CheckCircle2, Info, RotateCcw } from "lucide-react";
import { ADOPTED, ADOPTED_ALLOCATION, formatCount, formatNaira, formatOdds, runModel, tieredAwards, type ModelInputs } from "@/lib/finance/model";

/** Essential costs that must be funded before anything else (estimates). */
const ESSENTIAL = ADOPTED_ALLOCATION.regulatory + ADOPTED_ALLOCATION.processing + ADOPTED_ALLOCATION.operations + ADOPTED_ALLOCATION.assurance; // 17%
const DEFAULTS = { ...ADOPTED.inputs };
const DEFAULT_SHARE = ADOPTED_ALLOCATION.awards / 100;

interface Field { key: keyof ModelInputs; label: string; min: number; max: number; step: number; fmt: (v: number) => string; help?: string }

const FIELDS: Field[] = [
  { key: "members", label: "People who have joined", min: 500_000, max: 30_000_000, step: 500_000, fmt: (v) => formatCount(v), help: "Anyone can join" },
  { key: "participationRate", label: "How many try for a place each day", min: 0.2, max: 1, step: 0.01, fmt: (v) => `${Math.round(v * 100)}%` },
  { key: "dailyCap", label: "Places available each day", min: 1_000_000, max: 20_000_000, step: 500_000, fmt: (v) => formatCount(v), help: "Our plan: 10 million" },
  { key: "dailyContribution", label: "Price of a place", min: 50, max: 500, step: 10, fmt: (v) => formatNaira(v) },
];

export function Calculator() {
  const [inputs, setInputs] = useState<ModelInputs>(DEFAULTS);
  const [share, setShare] = useState(DEFAULT_SHARE);
  const r = useMemo(() => runModel(inputs), [inputs]);
  const pool = r.grossMonthly * share;
  const awards = tieredAwards(pool);
  const team = r.grossMonthly - pool;
  const teamPct = Math.round((1 - share) * 100);
  const level: "bad" | "warn" | "ok" = teamPct < ESSENTIAL + 6 ? "bad" : teamPct < 40 ? "warn" : "ok";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div className="rounded-3xl border border-navy-100 bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <p className="font-medium text-navy-950">Your numbers</p>
          <button type="button" onClick={() => { setInputs(DEFAULTS); setShare(DEFAULT_SHARE); }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-500 hover:text-navy-900">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset to our plan
          </button>
        </div>
        <div className="mt-6 space-y-6">
          {FIELDS.map((f) => (
            <label key={f.key} className="block">
              <span className="flex items-baseline justify-between gap-4 text-sm">
                <span className="text-navy-700">{f.label}</span>
                <span className="font-semibold text-navy-950 tabular">{f.fmt(inputs[f.key])}</span>
              </span>
              <input type="range" min={f.min} max={f.max} step={f.step} value={inputs[f.key]} onChange={(e) => setInputs((s) => ({ ...s, [f.key]: Number(e.target.value) }))} className="mt-3 w-full accent-[#d4af37]" />
              {f.help && <span className="mt-1 block text-xs text-navy-400">{f.help}</span>}
            </label>
          ))}
          <label className="block border-t border-navy-100 pt-6">
            <span className="flex items-baseline justify-between gap-4 text-sm">
              <span className="text-navy-700">Share of the money that goes to winners</span>
              <span className="font-semibold text-navy-950 tabular">{Math.round(share * 100)}% / {teamPct}%</span>
            </span>
            <input type="range" min={0.3} max={0.95} step={0.01} value={share} onChange={(e) => setShare(Number(e.target.value))} className="mt-3 w-full accent-[#0d1b2b]" />
            <span className="mt-1 block text-xs text-navy-400">Our plan: 60% to winners, 40% for everything else</span>
          </label>
        </div>
      </div>

      <div className="rounded-3xl bg-navy-950 p-6 text-white sm:p-8" aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Estimate — not a promise</p>
        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10">
          {[
            ["Places taken per day", `${formatCount(r.placesPerDay)}${r.capReached ? " · full" : ""}`],
            ["Money collected per month", formatNaira(r.grossMonthly, { compact: true, decimals: 2 })],
            ["Prize money for winners", formatNaira(pool, { compact: true, decimals: 2 })],
            ["For jobs, costs & reserves", formatNaira(team, { compact: true, decimals: 2 })],
            ["Your monthly chance (daily player)", formatOdds(30 / Math.max(1, r.placesPerDay))],
            ["Your cost per month", formatNaira(r.perMemberMonthly)],
          ].map(([k, v]) => (
            <div key={k} className="bg-navy-950 p-4">
              <dt className="text-[0.7rem] uppercase tracking-wider text-navy-300">{k}</dt>
              <dd className="mt-1.5 font-display text-xl tabular sm:text-2xl">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 rounded-2xl border border-gold-400/30 bg-gold-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-300">This month&apos;s 30 winners get</p>
          {awards.tiered ? (
            <p className="mt-2 font-display text-xl tabular">3 × ₦1bn <span className="text-navy-300">+</span> 27 × {formatNaira(awards.enterprise.amount, { compact: true, decimals: 0 })}</p>
          ) : (
            <p className="mt-2 font-display text-xl tabular">30 × {formatNaira(awards.enterprise.amount, { compact: true, decimals: 0 })} <span className="text-sm text-navy-300">(under ₦5bn — shared equally)</span></p>
          )}
        </div>

        <div className={clsx("mt-4 flex gap-3 rounded-2xl p-4 text-sm", level === "ok" ? "bg-emerald-400/10 text-emerald-100" : level === "warn" ? "bg-amber-400/10 text-amber-100" : "bg-red-400/10 text-red-100")}>
          {level === "ok" ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden /> : level === "warn" ? <Info className="h-5 w-5 shrink-0 text-amber-300" aria-hidden /> : <AlertTriangle className="h-5 w-5 shrink-0 text-red-300" aria-hidden />}
          <p>
            {level === "ok" && <><strong>This works.</strong> The {teamPct}% left covers running costs (about {ESSENTIAL}%), savings for slow months, the business fund and community projects.</>}
            {level === "warn" && <><strong>Tight.</strong> Running costs are covered, but there&apos;s less for businesses, communities and savings.</>}
            {level === "bad" && <><strong>This doesn&apos;t work.</strong> Running costs alone take about {ESSENTIAL}%, leaving almost nothing for savings or the business fund.</>}
          </p>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-navy-400">Example sums only. Taxes and bank charges are estimates until confirmed by experts. Nothing here is an offer, a promise of an award or an investment.</p>
      </div>
    </div>
  );
}
