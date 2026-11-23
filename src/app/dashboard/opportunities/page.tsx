import Link from "next/link";
import { clsx } from "clsx";
import { MapPin } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { opportunities, ventures } from "@/lib/db/queries";
import { DemoTag, PageTitle, Panel, fmtDate } from "@/components/app/ui";

const KINDS = [["", "All"], ["employment", "Employment"], ["supplier", "Suppliers"], ["training", "Training"], ["business", "Business"]] as const;

export default async function Opportunities({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  await requirePermission("member:dashboard");
  const kind = (await searchParams).kind;
  const valid = KINDS.some(([k]) => k === kind) ? kind : undefined;
  const [opps, vens] = await Promise.all([opportunities(valid || undefined), ventures()]);
  return (
    <>
      <PageTitle title="Opportunities" lead="Jobs, supplier contracts, training and business opportunities from the ecosystem. Members are notified first." />
      <div className="mb-6 flex flex-wrap gap-2">
        {KINDS.map(([k, l]) => (
          <Link key={k} href={k ? `?kind=${k}` : "?"} className={clsx("rounded-full px-4 py-2 text-sm font-medium", (valid ?? "") === k ? "bg-navy-950 text-white" : "bg-white text-navy-700 ring-1 ring-navy-100 hover:bg-navy-50")}>{l}</Link>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {opps.map((o) => (
          <article key={o.id} className="rounded-2xl border border-navy-100 bg-white p-6">
            <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold uppercase tracking-wider text-gold-700">{o.kind}</span>{o.is_demo && <DemoTag />}</div>
            <h2 className="mt-2 font-sans text-lg font-semibold tracking-normal text-navy-950">{o.title}</h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-navy-500"><MapPin className="h-3.5 w-3.5" aria-hidden />{o.organisation} · {o.location}</p>
            <p className="mt-3 text-sm leading-relaxed text-navy-600">{o.summary}</p>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-xs text-navy-500">Closes {fmtDate(o.closes_at)}</span>
              <button disabled className="cursor-not-allowed rounded-full bg-navy-100 px-4 py-2 text-xs font-semibold text-navy-500" title="Applications open after launch">Applications open after launch</button>
            </div>
          </article>
        ))}
        {opps.length === 0 && <p className="text-sm text-navy-500">No opportunities in this category yet.</p>}
      </div>
      <Panel className="mt-8" title={<span className="flex items-center gap-2">Business development pipeline <DemoTag /></span>}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {vens.map((v) => (
            <div key={v.id} className="rounded-xl bg-mist p-4"><p className="text-sm font-medium text-navy-950">{v.name}</p><p className="mt-1 text-xs text-navy-500">{v.sector} · {v.state}</p><p className="mt-3 text-xs font-semibold text-gold-700">Stage: {v.stage}</p></div>
          ))}
        </div>
      </Panel>
    </>
  );
}
