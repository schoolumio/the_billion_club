import { Download, Megaphone, ThumbsDown, ThumbsUp } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { getConfig } from "@/lib/referrals/server";
import { referralUrl } from "@/lib/referrals/codes";
import { query, one } from "@/lib/db";
import { PageTitle, Panel } from "@/components/app/ui";
import { CopyBlock } from "@/components/waitlist/CopyBlock";

const KIND_LABEL: Record<string, string> = { whatsapp: "WhatsApp messages", social: "Social media captions", description: "Short descriptions", email: "Email invitations" };

export default async function Promote() {
  const s = await requirePermission("member:dashboard");
  const [{ config }, me, materials, campaigns] = await Promise.all([
    getConfig(),
    one<{ referral_code: string; full_name: string }>(`SELECT referral_code, full_name FROM users WHERE id = $1`, [s.sub]),
    query<{ id: string; kind: string; title: string; body: string; campaign_slug: string | null }>(`SELECT id, kind, title, body, campaign_slug FROM promo_materials WHERE published ORDER BY kind, updated_at DESC`),
    query<{ slug: string; name: string; description: string | null }>(`SELECT slug, name, description FROM campaigns WHERE active ORDER BY created_at DESC`),
  ]);
  if (!me) return null;
  const link = referralUrl(config.baseUrl, me.referral_code);
  const fill = (body: string, campaign: string | null) =>
    body.replaceAll("{link}", campaign ? referralUrl(config.baseUrl, me.referral_code, campaign) : link).replaceAll("{name}", me.full_name.split(" ")[0]).replaceAll("{code}", me.referral_code);
  const groups = Object.entries(KIND_LABEL).map(([k, label]) => ({ k, label, items: materials.filter((m) => m.kind === k) })).filter((g) => g.items.length);

  return (
    <>
      <PageTitle title="Promotion kit" lead="Approved messages and materials. Your personal link is already inserted." />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {groups.length === 0 && <Panel><p className="text-sm text-navy-500">No materials have been published yet.</p></Panel>}
          {groups.map((g) => (
            <Panel key={g.k} title={g.label}>
              <ul className="space-y-4">
                {g.items.map((m) => {
                  const text = fill(m.body, m.campaign_slug);
                  return (
                    <li key={m.id} className="rounded-2xl border border-navy-100 bg-mist p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-navy-950">{m.title}</p><CopyBlock text={text} channel={`kit_${g.k}`} /></div>
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-navy-700">{text}</p>
                      {m.campaign_slug && <p className="mt-2 text-xs text-gold-700">Campaign: {m.campaign_slug}</p>}
                    </li>
                  );
                })}
              </ul>
            </Panel>
          ))}
        </div>
        <div className="space-y-6">
          <Panel title="Images & print">
            <div className="grid gap-2">
              <a href="/api/referral-card" download className="inline-flex items-center gap-2 rounded-xl bg-[#0d1b2b] px-4 py-3 text-sm font-semibold text-white"><Download className="h-4 w-4" aria-hidden />Branded referral image (1080×1350)</a>
              <a href="/api/referral-card?format=flyer" download className="inline-flex items-center gap-2 rounded-xl border border-navy-200 px-4 py-3 text-sm font-semibold text-navy-900"><Download className="h-4 w-4" aria-hidden />A4 poster with QR code</a>
            </div>
            <p className="mt-3 text-xs text-navy-500">Both include your QR code, referral link and the required disclaimer.</p>
          </Panel>
          <Panel title={<span className="flex items-center gap-2"><Megaphone className="h-4 w-4 text-gold-600" aria-hidden /> Campaign links</span>}>
            {campaigns.length === 0 ? <p className="text-sm text-navy-500">No active campaigns.</p> : (
              <ul className="space-y-3">
                {campaigns.map((c) => {
                  const u = referralUrl(config.baseUrl, me.referral_code, c.slug);
                  return (
                    <li key={c.slug} className="rounded-xl bg-mist p-3">
                      <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-navy-950">{c.name}</p><CopyBlock text={u} channel={`campaign_${c.slug}`} label="Copy link" /></div>
                      {c.description && <p className="mt-1 text-xs text-navy-600">{c.description}</p>}
                      <p className="mt-1 break-all font-mono text-[0.7rem] text-navy-500">{u}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
          <Panel title="Sharing responsibly">
            <p className="flex items-center gap-2 text-sm font-semibold text-good"><ThumbsUp className="h-4 w-4" aria-hidden /> Do say</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-navy-700"><li>It&apos;s free to join the waitlist</li><li>TBC is a community movement to build wealth and create jobs</li><li>It hasn&apos;t launched yet and is seeking approval</li></ul>
            <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-critical"><ThumbsDown className="h-4 w-4" aria-hidden /> Never say</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-navy-700"><li>&ldquo;You will become a billionaire&rdquo; or &ldquo;guaranteed income&rdquo;</li><li>That it is an investment or pays returns</li><li>That anyone should pay money to join</li><li>How much you earn from referrals</li></ul>
            <p className="mt-4 text-xs text-navy-500">Misleading promotion can lead to referrals being disqualified and accounts suspended (see the referral policy).</p>
          </Panel>
        </div>
      </div>
    </>
  );
}
