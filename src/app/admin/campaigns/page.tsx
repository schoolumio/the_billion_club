import { requirePermission } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { saveCampaignAction, savePromoAction, toggleCampaignAction, togglePromoAction } from "@/lib/referrals/admin-actions";
import { PageTitle, Panel, Pill, fmtDate } from "@/components/app/ui";
import { ActionForm } from "@/components/app/AdminForms";

const f = "mt-1.5 block w-full rounded-xl border border-navy-200 bg-white px-3 py-2.5 text-sm";

export default async function Campaigns() {
  await requirePermission("admin:campaigns");
  const [campaigns, materials] = await Promise.all([
    query<{ slug: string; name: string; description: string | null; active: boolean; created_at: Date; signups: string; clicks: string }>(`
      SELECT c.slug, c.name, c.description, c.active, c.created_at,
             (SELECT count(*) FROM referrals r WHERE r.campaign_slug = c.slug) signups,
             (SELECT COALESCE(sum(count),0) FROM referral_daily_activity a WHERE a.channel = c.slug AND a.kind = 'click') clicks
      FROM campaigns c ORDER BY c.created_at DESC`),
    query<{ id: string; kind: string; title: string; body: string; campaign_slug: string | null; published: boolean; updated_at: Date }>(`SELECT id, kind, title, body, campaign_slug, published, updated_at FROM promo_materials ORDER BY updated_at DESC`),
  ]);

  return (
    <>
      <PageTitle eyebrow="Growth" title="Campaigns & messages" lead="Write and publish ready-made messages and campaign links. They appear instantly in every member’s Promotion kit." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Campaigns">
          <ul className="divide-y divide-navy-50">
            {campaigns.map((c) => (
              <li key={c.slug} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
                <div><p className="font-medium text-navy-950">{c.name} <span className="font-mono text-xs text-navy-500">{c.slug}</span></p><p className="text-xs text-navy-500">{Number(c.clicks).toLocaleString("en-NG")} visits · {Number(c.signups).toLocaleString("en-NG")} sign-ups · since {fmtDate(c.created_at)}</p></div>
                <form action={toggleCampaignAction} className="flex items-center gap-2"><input type="hidden" name="slug" value={c.slug} /><Pill value={c.active ? "active" : "closed"} /><button className="text-xs font-semibold text-navy-700 hover:underline">{c.active ? "Pause" : "Activate"}</button></form>
              </li>
            ))}
            {campaigns.length === 0 && <li className="py-6 text-center text-sm text-navy-500">No campaigns yet.</li>}
          </ul>
          <div className="mt-6 border-t border-navy-100 pt-5">
            <p className="text-sm font-semibold text-navy-950">New campaign</p>
            <ActionForm action={saveCampaignAction} submit="Create campaign" reset>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm text-navy-800">Name<input name="name" required className={f} /></label>
                <label className="block text-sm text-navy-800">Slug (used in links)<input name="slug" required pattern="[a-z0-9-]{2,40}" placeholder="lagos-launch" className={f} /></label>
              </div>
              <label className="mt-3 block text-sm text-navy-800">Description<input name="description" className={f} /></label>
            </ActionForm>
          </div>
        </Panel>

        <Panel title="New message" description="WhatsApp messages, captions, descriptions or emails for members to share.">
          <ActionForm action={savePromoAction} submit="Save material" reset>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm text-navy-800">Type<select name="kind" className={f}><option value="whatsapp">WhatsApp message</option><option value="social">Social media caption</option><option value="description">Short description</option><option value="email">Email invitation</option></select></label>
              <label className="block text-sm text-navy-800">Campaign (optional)<select name="campaign" className={f}><option value="">None</option>{campaigns.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
            </div>
            <label className="mt-3 block text-sm text-navy-800">Title<input name="title" required className={f} /></label>
            <label className="mt-3 block text-sm text-navy-800">Text<textarea name="body" required rows={5} className={f} placeholder="Use {link} for the member's link, {name} for their first name, {code} for their code." /></label>
            <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" name="published" className="h-4 w-4 accent-[#0d1b2b]" />Publish to members now</label>
            <p className="mt-2 text-xs text-navy-500">Text implying income, returns, investment or guarantees is blocked automatically. Approved disclaimers like “not an investment” are allowed.</p>
          </ActionForm>
        </Panel>
      </div>

      <Panel className="mt-6" title={`All messages (${materials.length})`}>
        <ul className="grid gap-4 lg:grid-cols-2">
          {materials.map((m) => (
            <li key={m.id} className="rounded-2xl border border-navy-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-navy-950">{m.title}</p>
                <form action={togglePromoAction} className="flex items-center gap-2"><input type="hidden" name="id" value={m.id} /><Pill value={m.published ? "active" : "unverified"} /><button className="text-xs font-semibold text-navy-700 hover:underline">{m.published ? "Unpublish" : "Publish"}</button></form>
              </div>
              <p className="mt-1 text-xs uppercase tracking-wider text-gold-700">{m.kind}{m.campaign_slug ? ` · ${m.campaign_slug}` : ""} · updated {fmtDate(m.updated_at)}</p>
              <p className="mt-2 whitespace-pre-line text-sm text-navy-700">{m.body}</p>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
