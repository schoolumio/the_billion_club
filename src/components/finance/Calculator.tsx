"use client";
import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";
import { CONCEPT_INPUTS, RECOMMENDED_MAX_AWARD_SHARE, formatCount, formatNaira, formatOdds, runModel, type ModelInputs } from "@/lib/finance/model";

interface Field {
  key: keyof ModelInputs;
  label: string;
  min: number;
  max: number;
  step: number;
  fmt: (v: number) => string;
  scale?: number;
}

const FIELDS: Field[] = [
  { key: "members", label: "Members", min: 100_000, max: 30_000_000, step: 100_000, fmt: (v) => formatCount(v) },
  { key: "dailyContribution", label: "Daily contribution", min: 50, max: 500, step: 10, fmt: (v) => formatNaira(v) },
  { key: "participationRate", label: "Average daily participation", min: 0.3, max: 1, step: 0.01, fmt: (v) => `${Math.round(v * 100)}%` },
  { key: "awardAmount", label: "Award size", min: 10_000_000, max: 1_000_000_000, step: 10_000_000, fmt: (v) => formatNaira(v, { compact: true }) },
  { key: "awardCount", label: "Awards per month", min: 1, max: 60, step: 1, fmt: (v) => String(v) },
];

export function Calculator() {
  const [inputs, setInputs] = useState<ModelInputs>(CONCEPT_INPUTS);
  const [pool, setPool] = useState(RECOMMENDED_MAX_AWARD_SHARE);
  const r = useMemo(() => runModel(inputs), [inputs]);
  const share = r.awardShareOfGross;
  const ok = share <= pool;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div className="rounded-3xl border border-navy-100 bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <p className="font-medium text-navy-950">Assumptions</p>
          <button type="button" onClick={() => { setInputs(CONCEPT_INPUTS); setPool(RECOMMENDED_MAX_AWARD_SHARE); }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-500 hover:text-navy-900">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset to concept
          </button>
        </div>
        <div className="mt-6 space-y-6">
          {FIELDS.map((f) => (
            <label key={f.key} className="block">
              <span className="flex items-baseline justify-between gap-4 text-sm">
                <span className="text-navy-700">{f.label}</span>
                <span className="font-semibold text-navy-950 tabular">{f.fmt(inputs[f.key])}</span>
              </span>
              <input
                type="range"
                min={f.min}
                max={f.max}
                step={f.step}
                value={inputs[f.key]}
                onChange={(e) => setInputs((s) => ({ ...s, [f.key]: Number(e.target.value) }))}
                className="mt-3 w-full accent-[#c89a24]"
              />
            </label>
          ))}
          <label className="block border-t border-navy-100 pt-6">
            <span className="flex items-baseline justify-between gap-4 text-sm">
              <span className="text-navy-700">Maximum award pool (share of inflow)</span>
              <span className="font-semibold text-navy-950 tabular">{Math.round(pool * 100)}%</span>
            </span>
            <input type="range" min={0.2} max={1} step={0.01} value={pool} onChange={(e) => setPool(Number(e.target.value))} className="mt-3 w-full accent-[#0b1834]" />
            <span className="mt-2 block text-xs text-navy-500">We recommend no more than {Math.round(RECOMMENDED_MAX_AWARD_SHARE * 100)}% so the ecosystem, reserves and statutory obligations are funded.</span>
          </label>
        </div>
      </div>

      <div className="rounded-3xl bg-navy-950 p-6 text-white sm:p-8" aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Projection — not a forecast of results</p>
        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10">
          {[
            ["Gross monthly inflow", formatNaira(r.grossMonthly, { compact: true, decimals: 2 })],
            ["Award cost per month", formatNaira(r.awardCost, { compact: true, decimals: 2 })],
            ["Awards as share of inflow", Number.isFinite(share) ? `${(share * 100).toFixed(1)}%` : "—"],
            ["Left for everything else", formatNaira(r.nonAwardFunds, { compact: true, decimals: 2 })],
            ["Monthly chance of selection", formatOdds(r.monthlySelectionOdds)],
            ["Contribution per member / month", formatNaira(r.perMemberMonthly)],
          ].map(([k, v]) => (
            <div key={k} className="bg-navy-950 p-4">
              <dt className="text-[0.7rem] uppercase tracking-wider text-navy-300">{k}</dt>
              <dd className="mt-1.5 font-display text-xl tabular sm:text-2xl">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6">
          <div className="flex justify-between text-xs text-navy-300"><span>Award share of inflow</span><span>limit {Math.round(pool * 100)}%</span></div>
          <div className="relative mt-2 h-3 rounded-full bg-white/10">
            <div className={clsx("h-3 rounded-full transition-all", ok ? "bg-gold-400" : "bg-red-400")} style={{ width: `${Math.min(100, share * 100)}%` }} />
            <div className="absolute -top-1 h-5 w-0.5 bg-white" style={{ left: `${pool * 100}%` }} aria-hidden />
          </div>
        </div>

        <div className={clsx("mt-6 flex gap-3 rounded-2xl p-4 text-sm", ok ? "bg-emerald-400/10 text-emerald-100" : "bg-red-400/10 text-red-100")}>
          {ok ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden /> : <AlertTriangle className="h-5 w-5 shrink-0 text-red-300" aria-hidden />}
          <div>
            <p className="font-semibold">{ok ? "Within the award-pool limit" : "Exceeds the award-pool limit"}</p>
            {!ok && (
              <ul className="mt-2 space-y-1 text-red-100/90">
                <li>· At this award size, the pool funds <strong className="tabular">{r.fundableAwards(pool)}</strong> awards a month.</li>
                <li>· For {inputs.awardCount} awards, each could be <strong className="tabular">{formatNaira(r.fundableAwardSize(pool), { compact: true })}</strong>.</li>
                <li>· Or the community needs <strong className="tabular">{formatCount(r.membersRequired(pool))}</strong> members at these assumptions.</li>
              </ul>
            )}
            {ok && <p className="mt-1 text-emerald-100/80">The remaining {formatNaira(r.nonAwardFunds, { compact: true })} funds business development, community investment, reserves, statutory obligations and operations.</p>}
          </div>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-navy-400">Illustrative arithmetic only. Taxes, levies and processing costs are placeholders pending professional opinions. Nothing here is an offer, a promise of an award or an investment return.</p>
      </div>
    </div>
  );
}
