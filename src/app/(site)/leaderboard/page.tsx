import type { Metadata } from "next";
import Link from "next/link";
import { clsx } from "clsx";
import { Crown, Medal } from "lucide-react";
import { PageHero, StatusBadge, LinkButton } from "@/components/ui/primitives";
import { getConfig, leaderboard, type BoardKind } from "@/lib/referrals/server";
import { levelFor } from "@/lib/referrals/config";
import { maskName } from "@/lib/referrals/codes";

export const metadata: Metadata = { title: "Community leaderboard", description: "Top TBC founding community ambassadors, ranked by verified referrals." };
export const dynamic = "force-dynamic";

const BOARDS: { k: BoardKind; label: string }[] = [{ k: "all", label: "All time" }, { k: "month", label: "This month" }, { k: "week", label: "This week" }];
const SIZES = [10, 100, 1000];

export default async function Leaderboard({ searchParams }: { searchParams: Promise<{ b?: string; n?: string }> }) {
  const sp = await searchParams;
  const kind = (BOARDS.find((b) => b.k === sp.b)?.k ?? "all") as BoardKind;
  const size = SIZES.includes(Number(sp.n)) ? Number(sp.n) : 10;
  let data: Awaited<ReturnType<typeof leaderboard>> | null = null;
  let levels = (await getConfig().catch(() => null))?.config.levels ?? [];
  try { data = await leaderboard(kind, size); } catch { data = null; }
  if (!levels.length) levels = [];
  const anyDemo = data?.rows.some((r) => r.is_demo);

  return (
    <>
      <PageHero eyebrow="Leaderboard" title={<>Meet the people <span className="gold-text">building the circle.</span></>} lead="Ranked by the number of real, confirmed people each member has invited. Names only appear if members choose to show them.">
        <LinkButton href="/join" arrow>Join and start inviting</LinkButton>
      </PageHero>
      <section className="bg-white py-16 sm:py-20">
        <div className="container-x max-w-4xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-full bg-mist p-1">
              {BOARDS.map((b) => <Link key={b.k} href={`?b=${b.k}&n=${size}`} className={clsx("rounded-full px-4 py-2 text-sm font-semibold", kind === b.k ? "bg-[#0d1b2b] text-white" : "text-navy-600")}>{b.label}</Link>)}
            </div>
            <div className="flex rounded-full bg-mist p-1">
              {SIZES.map((n) => <Link key={n} href={`?b=${kind}&n=${n}`} className={clsx("rounded-full px-3 py-2 text-xs font-semibold", size === n ? "bg-[#d4af37] text-[#0d1b2b]" : "text-navy-600")}>Top {n.toLocaleString()}</Link>)}
            </div>
          </div>
          {anyDemo && <StatusBadge kind="demo" label="Sample data — demo version" className="mt-6" />}
          <ol className="mt-6 divide-y divide-navy-100 overflow-hidden rounded-3xl border border-navy-100">
            {(data?.rows ?? []).map((r, i) => {
              const name = r.leaderboard_opt_in ? (r.leaderboard_alias || maskName(r.full_name)) : `Anonymous member · ${r.referral_code.slice(0, 5)}•••`;
              const lvl = levelFor(Number(r.n), levels).current;
              return (
                <li key={r.user_id} className={clsx("flex items-center gap-4 px-5 py-4", i < 3 && "bg-gold-50/40")}>
                  <span className={clsx("flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm tabular", i === 0 ? "bg-[#d4af37] text-[#0d1b2b]" : i < 3 ? "bg-[#0d1b2b] text-[#d4af37]" : "bg-mist text-navy-600")}>
                    {i === 0 ? <Crown className="h-4 w-4" aria-label="1st" /> : i < 3 ? <Medal className="h-4 w-4" aria-label={`${i + 1}th`} /> : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-navy-950">{name}</p>
                    <p className="text-xs text-navy-500">{lvl?.name ?? "Member"}{r.leaderboard_opt_in && r.state ? ` · ${r.state}` : ""}</p>
                  </div>
                  <div className="text-right"><p className="font-display text-xl tabular text-navy-950">{Number(r.n).toLocaleString("en-NG")}</p><p className="text-[0.7rem] text-navy-500">verified</p></div>
                </li>
              );
            })}
            {(!data || data.rows.length === 0) && <li className="px-5 py-12 text-center text-navy-500">{data ? "No one is on the board yet — be the first." : "The leaderboard is unavailable right now."}</li>}
          </ol>
          <p className="mt-4 text-xs text-navy-500">Updated {data?.updatedAt ? new Date(data.updatedAt).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}. Only confirmed referrals count. Rankings are for recognition — they don’t entitle anyone to money.</p>
        </div>
      </section>
    </>
  );
}
