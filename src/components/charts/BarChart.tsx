"use client";
import { useMemo, useState } from "react";
import { formatNaira } from "@/lib/finance/model";

export interface BarDatum { label: string; value: number; detail?: string }

/** Serialisable so Server Components can pass it across the client boundary. */
export type BarFormat = "number" | "naira" | "nairaCompact";
const FORMATS: Record<BarFormat, (v: number) => string> = {
  number: (v) => v.toLocaleString("en-NG"),
  naira: (v) => formatNaira(v),
  nairaCompact: (v) => formatNaira(v, { compact: true }),
};

/**
 * Single-series column chart: thin marks, rounded data-ends anchored to the
 * baseline, recessive grid, per-mark hover tooltip with generous hit targets,
 * and an accessible table fallback.
 */
export function BarChart({
  data,
  height = 220,
  format: fmt = "number",
  title,
  color = "var(--color-series-1)",
  everyNthLabel = 1,
}: {
  data: BarDatum[];
  height?: number;
  format?: BarFormat;
  title: string;
  color?: string;
  everyNthLabel?: number;
}) {
  const format = FORMATS[fmt];
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const max = useMemo(() => niceMax(Math.max(1, ...data.map((d) => d.value))), [data]);
  const ticks = [0, max / 2, max];
  const W = 640;
  const H = height;
  const padL = 52, padB = 24, padT = 10;
  const innerW = W - padL - 8;
  const innerH = H - padB - padT;
  const step = innerW / Math.max(1, data.length);
  const barW = Math.max(2, Math.min(22, step - 2));

  return (
    <figure className="relative">
      <figcaption className="sr-only">{title}</figcaption>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={title} onMouseLeave={() => setHover(null)}>
          {ticks.map((t) => {
            const y = padT + innerH - (t / max) * innerH;
            return (
              <g key={t}>
                <line x1={padL} x2={W - 8} y1={y} y2={y} stroke="#0d1b2b" strokeOpacity={t === 0 ? 0.25 : 0.07} />
                <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#64799a" className="tabular">{format(t)}</text>
              </g>
            );
          })}
          {data.map((d, i) => {
            const h = (d.value / max) * innerH;
            const x = padL + i * step + (step - barW) / 2;
            const y = padT + innerH - h;
            const r = Math.min(4, barW / 2, h);
            return (
              <g key={i} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={-1}>
                <rect x={padL + i * step} y={padT} width={step} height={innerH} fill="transparent" />
                {h > 0 && (
                  <path
                    d={`M${x},${padT + innerH} V${y + r} Q${x},${y} ${x + r},${y} H${x + barW - r} Q${x + barW},${y} ${x + barW},${y + r} V${padT + innerH} Z`}
                    fill={color}
                    opacity={hover === null || hover === i ? 1 : 0.45}
                  />
                )}
                {i % everyNthLabel === 0 && (
                  <text x={padL + i * step + step / 2} y={H - 6} textAnchor="middle" fontSize="10.5" fill="#64799a">{d.label}</text>
                )}
              </g>
            );
          })}
        </svg>
        {hover !== null && data[hover] && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-navy-950 px-3 py-2 text-xs text-white shadow-xl"
            style={{ left: `${((padL + hover * step + step / 2) / W) * 100}%`, top: `${((padT + innerH - (data[hover].value / max) * innerH) / H) * 100}%` }}
          >
            <p className="font-semibold tabular">{format(data[hover].value)}</p>
            <p className="text-navy-300">{data[hover].detail ?? data[hover].label}</p>
          </div>
        )}
      </div>
      <button type="button" onClick={() => setShowTable((s) => !s)} className="mt-2 text-xs font-medium text-navy-500 underline-offset-2 hover:underline">
        {showTable ? "Hide" : "Show"} data table
      </button>
      {showTable && (
        <div className="mt-2 max-h-56 overflow-auto rounded-lg border border-navy-100">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-navy-50 text-navy-600"><tr><th className="px-3 py-2">Period</th><th className="px-3 py-2 text-right">Value</th></tr></thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i} className="border-t border-navy-50"><td className="px-3 py-1.5">{d.detail ?? d.label}</td><td className="px-3 py-1.5 text-right tabular">{format(d.value)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}

function niceMax(v: number) {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}
