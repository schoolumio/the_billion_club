"use client";
import { useState } from "react";
import { clsx } from "clsx";
import { BarChart } from "./BarChart";

/** DEMONSTRATION DATA ONLY — illustrates the reporting format, represents nothing real. */
const DEMO = {
  jobs: { label: "Jobs (demo)", fmt: (v: number) => v.toLocaleString("en-NG"), data: [["Lagos", 420], ["Kano", 310], ["FCT", 260], ["Rivers", 240], ["Kaduna", 210], ["Oyo", 180], ["Enugu", 150], ["Plateau", 120]] },
  suppliers: { label: "Suppliers (demo)", fmt: (v: number) => v.toLocaleString("en-NG"), data: [["Lagos", 64], ["Kano", 51], ["FCT", 38], ["Rivers", 35], ["Kaduna", 41], ["Oyo", 29], ["Enugu", 22], ["Plateau", 18]] },
  ventures: { label: "Ventures (demo)", fmt: (v: number) => v.toLocaleString("en-NG"), data: [["Lagos", 9], ["Kano", 7], ["FCT", 5], ["Rivers", 5], ["Kaduna", 6], ["Oyo", 4], ["Enugu", 3], ["Plateau", 3]] },
} as const;

export function ImpactDemo() {
  const [k, setK] = useState<keyof typeof DEMO>("jobs");
  const m = DEMO[k];
  return (
    <div className="rounded-3xl border border-navy-100 bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-medium text-navy-950">By state — demonstration data</p>
        <div className="flex rounded-full bg-navy-50 p-1" role="tablist">
          {(Object.keys(DEMO) as (keyof typeof DEMO)[]).map((key) => (
            <button key={key} role="tab" aria-selected={k === key} onClick={() => setK(key)} className={clsx("rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition", k === key ? "bg-navy-950 text-white" : "text-navy-600 hover:text-navy-900")}>
              {key}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <BarChart title={`${m.label} by state`} data={m.data.map(([l, v]) => ({ label: l, value: v, detail: `${l} · demonstration` }))} format="number" />
      </div>
    </div>
  );
}
