/**
 * Seeds CLEARLY LABELLED DEMONSTRATION DATA. Every seeded business row carries
 * is_demo = true and every contribution has status 'simulated'. No real people,
 * payments, beneficiaries or audits are represented.
 */
import pg from "pg";
import bcrypt from "bcryptjs";
import { loadEnv } from "./env.ts";
import { REFRESH_STATS_SQL } from "../src/lib/referrals/sql.ts";
import { DEFAULT_CONFIG } from "../src/lib/referrals/config.ts";

loadEnv();
const ifEmpty = process.argv.includes("--if-empty");

if (ifEmpty) {
  // Deployment mode: only seed when explicitly enabled AND the database has no users.
  if (process.env.SEED_DEMO_DATA !== "true" || !process.env.DATABASE_URL) {
    console.log("→ demo seeding not enabled (set SEED_DEMO_DATA=true to load demonstration accounts)");
    process.exit(0);
  }
} else if (process.env.NODE_ENV === "production" && !process.argv.includes("--force")) {
  console.error("Refusing to seed demo data in production. Pass --force if you really mean it.");
  process.exit(1);
}

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

if (ifEmpty) {
  const { rows } = await db.query<{ n: string }>("SELECT count(*) n FROM users");
  if (Number(rows[0].n) > 0) {
    console.log(`✓ database already has ${rows[0].n} users — skipping demo seed`);
    await db.end();
    process.exit(0);
  }
}

// Deterministic PRNG so demo data is stable between runs.
let s = 20261123;
const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];

const STATES = ["Lagos", "FCT Abuja", "Kano", "Rivers", "Oyo", "Kaduna", "Enugu", "Anambra", "Delta", "Ogun", "Plateau", "Edo", "Cross River", "Borno", "Kwara"];
const FIRST = ["Adaeze", "Tunde", "Ngozi", "Ibrahim", "Funmilayo", "Chinedu", "Aisha", "Emeka", "Halima", "Segun", "Zainab", "Obinna", "Kemi", "Musa", "Ifeoma", "Yusuf", "Bisi", "Uche", "Hauwa", "Dayo"];
const LAST = ["Okafor", "Adeyemi", "Bello", "Eze", "Abubakar", "Ogunleye", "Nwosu", "Danjuma", "Okonkwo", "Balogun", "Ibekwe", "Lawal", "Umeh", "Garba", "Afolabi"];

console.log("→ clearing previous demonstration data");
await db.query(`TRUNCATE audit_logs, fraud_alerts, support_tickets, contributions, announcements, opportunities, ventures, compliance_items, email_outbox, referral_snapshots, campaigns, promo_materials, users RESTART IDENTITY CASCADE`);

const hash = (p: string) => bcrypt.hashSync(p, 11);
const staff = [
  { email: "member@demo.tbc", pw: "Demo#2026", name: "Amara Demo-Member", role: "member", ver: "verified", state: "Lagos" },
  { email: "admin@demo.tbc", pw: "Admin#2026", name: "Demo Administrator", role: "admin", ver: "verified", state: "FCT Abuja" },
  { email: "auditor@demo.tbc", pw: "Audit#2026", name: "Demo Auditor", role: "auditor", ver: "verified", state: "Lagos" },
  { email: "support@demo.tbc", pw: "Support#2026", name: "Demo Support Agent", role: "support", ver: "verified", state: "Kano" },
];

let n = 1;
const memberNo = () => `TBC-DEMO-${String(n++).padStart(6, "0")}`;
const ids: Record<string, string> = {};
for (const u of staff) {
  const r = await db.query(
    `INSERT INTO users(member_no,email,password_hash,full_name,phone,state,role,verification,is_demo,created_at)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,true, now() - interval '150 days') RETURNING id`,
    [memberNo(), u.email, hash(u.pw), u.name, "+234 800 000 0000", u.state, u.role, u.ver],
  );
  ids[u.email] = r.rows[0].id;
}

console.log("→ creating synthetic demo members");
const demoPw = hash("Synthetic#2026");
const verMix = ["verified", "verified", "verified", "pending", "pending", "unverified", "rejected"];
for (let i = 0; i < 320; i++) {
  const name = `${pick(FIRST)} ${pick(LAST)}`;
  const days = Math.floor(rnd() * 140);
  await db.query(
    `INSERT INTO users(member_no,email,password_hash,full_name,state,role,verification,status,is_demo,created_at)
     VALUES($1,$2,$3,$4,$5,'member',$6,$7,true, now() - ($8 || ' days')::interval)`,
    [memberNo(), `synthetic.${i}@demo.tbc`, demoPw, name, pick(STATES), pick(verMix), rnd() < 0.03 ? "suspended" : "active", String(days)],
  );
}

console.log("→ simulating contribution ledger (status = simulated)");
// Featured demo member: near-daily contributions for 120 days.
await db.query(
  `INSERT INTO contributions(user_id, amount_kobo, contribution_date, channel, reference, status, is_demo)
   SELECT $1, 10000, d::date, (ARRAY['Bank transfer','Card','USSD','Wallet'])[1 + (extract(doy from d)::int % 4)],
          'SIM-' || to_char(d,'YYYYMMDD') || '-M', 'simulated', true
   FROM generate_series(current_date - 119, current_date, interval '1 day') d
   WHERE extract(doy from d)::int % 11 <> 0`,
  [ids["member@demo.tbc"]],
);
// Synthetic members: verified/pending members contribute on ~78% of days since joining, up to 90 days.
await db.query(`
  INSERT INTO contributions(user_id, amount_kobo, contribution_date, channel, reference, status, is_demo)
  SELECT u.id, 10000, d::date,
         (ARRAY['Bank transfer','Card','USSD','Wallet'])[1 + (abs(hashtext(u.id::text || d::text)) % 4)],
         'SIM-' || to_char(d,'YYYYMMDD') || '-' || substr(u.id::text,1,8),
         CASE WHEN abs(hashtext(u.id::text || d::text)) % 97 = 0 THEN 'failed'::contribution_status
              WHEN d < current_date - 3 THEN 'reconciled'::contribution_status
              ELSE 'simulated'::contribution_status END,
         true
  FROM users u
  CROSS JOIN LATERAL generate_series(greatest(u.created_at::date, current_date - 89), current_date, interval '1 day') d
  WHERE u.email LIKE 'synthetic.%' AND u.verification IN ('verified','pending') AND u.status = 'active'
    AND abs(hashtext(u.id::text || d::text || 'p')) % 100 < 78`);

console.log("→ announcements, opportunities, ventures");
const ann = [
  ["Pre-launch notice: no contributions are being collected", "The platform is in a pre-launch demonstration phase. No real money is being accepted. Any request for payment in our name is fraudulent — please report it via the Support Centre.", "Official"],
  ["Regulatory engagement update", "Our legal advisers are preparing formal opinions on licensing structure, fund custody and consumer protection. We will publish milestones on the Transparency page as they are reached.", "Governance"],
  ["Selection methodology consultation (draft)", "A draft beneficiary selection methodology will be published for public comment before any selection takes place. Independent observers will be invited.", "Transparency"],
  ["Identity verification will use NIN and BVN checks", "When launched, verification will be performed through licensed identity partners. We will never ask for your PIN, OTP or password.", "Security"],
];
for (const [i, a] of ann.entries()) {
  await db.query(`INSERT INTO announcements(title,body,category,published_at) VALUES($1,$2,$3, now() - ($4 || ' days')::interval)`, [a[0], a[1], a[2], String(i * 9 + 2)]);
}
const opps = [
  ["employment", "Operations Associate (illustrative)", "Demo Agro-Processing Venture", "Kaduna", "Illustrative listing showing how verified roles from ecosystem ventures will appear to members."],
  ["employment", "Logistics Coordinator (illustrative)", "Demo Cold-Chain Venture", "Lagos", "Members with logistics experience would be notified first when real roles open."],
  ["supplier", "Packaging supplier registration (illustrative)", "Ecosystem Supplier Network", "Nationwide", "Shows how local suppliers will register to provide goods and services to ecosystem businesses."],
  ["training", "Business readiness masterclass (illustrative)", "Investment & Business Development Arm", "Online", "Example of free capacity-building sessions planned for members."],
  ["business", "Franchise partner expression of interest (illustrative)", "Demo Retail Venture", "Oyo", "Example of how members may be invited to operate outlets of ecosystem businesses."],
];
for (const o of opps) {
  await db.query(`INSERT INTO opportunities(kind,title,organisation,location,summary,closes_at) VALUES($1,$2,$3,$4,$5, current_date + 30)`, o);
}
const ventures = [
  ["Demo Venture · Agro-processing", "Agriculture", "Kaduna", "Feasibility", 0, 0, 0],
  ["Demo Venture · Cold-chain logistics", "Logistics", "Lagos", "Structuring", 0, 0, 0],
  ["Demo Venture · Solar mini-grid", "Energy", "Plateau", "Pipeline", 0, 0, 0],
  ["Demo Venture · Light manufacturing", "Manufacturing", "Anambra", "Pipeline", 0, 0, 0],
];
for (const v of ventures) {
  await db.query(`INSERT INTO ventures(name,sector,state,stage,capital_kobo,jobs_created,suppliers_engaged) VALUES($1,$2,$3,$4,$5,$6,$7)`, v);
}

console.log("→ compliance register");
const comp: [string, string, string, string][] = [
  ["Gaming & lotteries", "Formal legal opinion on whether the award mechanism is a lottery, promotion or other regulated activity", "External counsel", "in_progress"],
  ["Gaming & lotteries", "Determine federal vs state jurisdiction following recent Supreme Court guidance; licence(s) per operating state", "State gaming regulators / NLRC (FCT)", "not_started"],
  ["Investments", "Confirm whether any pooled business capital constitutes a collective investment scheme", "Securities and Exchange Commission (SEC)", "not_started"],
  ["Payments", "Select CBN-licensed payment and collection partners; confirm wallet/stored-value requirements", "Central Bank of Nigeria (CBN)", "not_started"],
  ["Custody", "Appoint independent trustee/custodian; segregated escrow accounts per fund", "SEC-registered trustee / commercial bank", "not_started"],
  ["Consumer protection", "Terms, refund rights and promotional claims review", "FCCPC", "not_started"],
  ["Data protection", "Register as data controller; DPIA; appoint DPO", "Nigeria Data Protection Commission (NDPC)", "in_progress"],
  ["AML/CFT", "AML/CFT programme, SCUML registration if designated, STR procedures", "SCUML / NFIU", "not_started"],
  ["Tax", "Formal tax opinion on awards, fees, VAT and fund income", "NRS (formerly FIRS) / State IRS", "not_started"],
  ["Advertising", "Pre-exposure vetting of campaign materials", "ARCON", "not_started"],
  ["Corporate", "Incorporate operating company and foundation; adopt governance charter", "Corporate Affairs Commission (CAC)", "in_progress"],
  ["Telecoms", "USSD / SMS short-code provisioning via licensed aggregators", "NCC", "not_started"],
  ["Referral programme", "Opinion: are referral rewards funded by referees' contributions a pyramid/Ponzi feature, regulated promotion or lottery prize?", "External counsel · SEC · FCCPC · gaming regulators", "not_started"],
  ["Referral programme", "Tax treatment of referral rewards (withholding, PIT) and payout KYC thresholds", "NRS / State IRS · CBN-licensed PSP", "not_started"],
  ["Referral programme", "Consent, cookie and leaderboard-display review; DPIA update for referral tracking", "NDPC", "in_progress"],
  ["Referral programme", "Approval of member-facing promotional materials and referrer conduct rules", "ARCON · FCCPC", "not_started"],
];
for (const c of comp) {
  await db.query(`INSERT INTO compliance_items(area,requirement,authority,status,owner) VALUES($1,$2,$3,$4,'Unassigned (demo)')`, c);
}

console.log("→ sample referral programme data (is_demo)");
await db.query(`UPDATE users SET email_normalized = lower(email) WHERE email_normalized IS NULL`);
await db.query(`UPDATE users SET email_verified_at = created_at + interval '10 minutes' WHERE verification IN ('verified','pending') OR role <> 'member'`);
await db.query(`INSERT INTO referral_config_versions(config, change_note) VALUES ($1, 'Initial configuration — proposed 1% of daily contribution pool; rewards inactive pending legal approval')`,
  [JSON.stringify({ ...DEFAULT_CONFIG, baseUrl: process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_CONFIG.baseUrl })]);

// Sample referral graph: a power-law of referrers among synthetic members, plus the featured demo member.
const members = (await db.query(`SELECT id, created_at, email_verified_at, status FROM users WHERE email LIKE 'synthetic.%' ORDER BY member_no`)).rows;
const featured = ids["member@demo.tbc"];
const referrers = [featured, ...members.slice(0, 18).map((m) => m.id)];
const weights = referrers.map((_, i) => (i === 0 ? 6 : 12 / (i + 1)));
const wsum = weights.reduce((a, b) => a + b, 0);
const pickReferrer = () => { let r = rnd() * wsum; for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r <= 0) return referrers[i]; } return referrers[0]; };
const FLAGS = [["SAME_DEVICE_AS_REFERRER", "NAME_MATCHES_REFERRER"], ["IP_VELOCITY", "SAME_NETWORK_AS_REFERRER"], ["DISPOSABLE_EMAIL", "DEVICE_REUSED"]];
let made = 0;
for (const m of members.slice(18)) {
  if (rnd() < 0.22) continue; // organic
  const referrer = pickReferrer();
  if (referrer === m.id) continue;
  const roll = rnd();
  const status = !m.email_verified_at ? "pending" : roll < 0.84 ? "verified" : roll < 0.93 ? "under_review" : "rejected";
  const flags = status === "verified" || status === "pending" ? [] : FLAGS[Math.floor(rnd() * FLAGS.length)];
  const code = (await db.query(`SELECT referral_code FROM users WHERE id = $1`, [referrer])).rows[0].referral_code;
  await db.query(`UPDATE users SET referred_by = $1 WHERE id = $2`, [referrer, m.id]);
  const r = await db.query(
    `INSERT INTO referrals(referrer_id, referred_id, code_used, source, status, risk_score, risk_flags, decision_reason, verified_at, is_demo, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,$10) RETURNING id`,
    [referrer, m.id, code, rnd() < 0.8 ? "link" : "manual_code", status, flags.length ? 45 + Math.floor(rnd() * 40) : Math.floor(rnd() * 15), flags,
     status === "rejected" ? "Sample: duplicate identity — same person as an existing member" : null,
     status === "verified" ? m.email_verified_at : null, m.created_at]);
  await db.query(`INSERT INTO referral_events(referral_id, to_status, reason, created_at) VALUES ($1,'pending','Registered (sample)',$2)`, [r.rows[0].id, m.created_at]);
  if (status !== "pending") await db.query(`INSERT INTO referral_events(referral_id, from_status, to_status, reason, created_at) VALUES ($1,'pending',$2,$3,$4)`, [r.rows[0].id, status, status === "verified" ? "Email verified (sample)" : `Flagged: ${flags.join(", ")} (sample)`, m.email_verified_at ?? m.created_at]);
  if (status === "under_review") await db.query(`INSERT INTO fraud_alerts(user_id, rule, severity, description) VALUES ($1,'REFERRAL_RISK','medium',$2)`, [m.id, `Sample: referral flagged — ${flags.join(", ")}`]);
  made++;
}
const rejectedFeatured = (await db.query(`SELECT id FROM referrals WHERE referrer_id = $1 AND status = 'rejected' LIMIT 1`, [featured])).rows[0];
if (rejectedFeatured) await db.query(`INSERT INTO referral_appeals(referral_id, user_id, reason) VALUES ($1,$2,'Sample appeal: this is my cousin; we share a phone at home but they are a separate person.')`, [rejectedFeatured.id, featured]);
for (const r of referrers) {
  for (let d = 0; d < 30; d++) {
    const clicks = Math.floor(rnd() * (r === featured ? 9 : 5));
    if (clicks) await db.query(`INSERT INTO referral_daily_activity(referrer_id, day, channel, kind, count) VALUES ($1, current_date - $2::int, $3, 'click', $4) ON CONFLICT DO NOTHING`, [r, d, pick(["link", "link", "lagos-launch", "campus-ambassadors"]), clicks]);
  }
  for (const ch of ["whatsapp", "copy", "facebook", "x", "telegram", "email", "card_download"]) {
    const n = Math.floor(rnd() * (ch === "whatsapp" ? 14 : 4));
    if (n) await db.query(`INSERT INTO referral_daily_activity(referrer_id, day, channel, kind, count) VALUES ($1, current_date - $2::int, $3, 'share', $4) ON CONFLICT DO NOTHING`, [r, Math.floor(rnd() * 20), ch, n]);
  }
}
await db.query(`UPDATE users SET leaderboard_opt_in = true WHERE id = ANY($1::uuid[])`, [referrers.filter((_, i) => i % 3 !== 1)]);
await db.query(`INSERT INTO campaigns(slug, name, description) VALUES
  ('lagos-launch','Lagos founding community (sample)','Sample campaign for community events in Lagos.'),
  ('campus-ambassadors','Campus ambassadors (sample)','Sample campaign for university communities.')`);
await db.query(`INSERT INTO promo_materials(kind, title, body, campaign_slug, published) VALUES
  ('whatsapp','Personal invitation','Hi! I''ve joined The Billionaire Circle founding community — a movement to build wealth together and create jobs across Nigeria. It''s free to join and it''s not an investment. Join with my link: {link}', NULL, true),
  ('whatsapp','Short invitation','Join me in The Billionaire Circle founding community. Free to join. {link}', NULL, true),
  ('social','Movement caption','10 million people. One shared vision. I''m part of The Billionaire Circle founding community, building a movement for shared prosperity and jobs in Nigeria. Free to join, not an investment. #TBC #TogetherWeBuild {link}', NULL, true),
  ('description','One-line description','The Billionaire Circle is a pre-launch community movement to build wealth together, fund businesses and create jobs across Nigeria. Join the free waitlist: {link}', NULL, true),
  ('email','Email invitation','Hello,\n\nI''ve joined the founding community of The Billionaire Circle (TBC), a movement to build shared wealth and create jobs across Nigeria. It hasn''t launched yet, joining the waitlist is free, and it is not an investment.\n\nYou can read about it and join here: {link}\n\nBest wishes,\n{name}', NULL, true),
  ('social','Lagos launch caption (sample campaign)','Lagos, let''s build the circle together. Join The Billionaire Circle founding community, free: {link}', 'lagos-launch', true)`);
for (const sql of REFRESH_STATS_SQL) await db.query(sql);
console.log(`  ${made} sample referrals`);

console.log("→ demo fraud alerts and tickets");
const syn = (await db.query(`SELECT id FROM users WHERE email LIKE 'synthetic.%' ORDER BY member_no LIMIT 12`)).rows.map((r) => r.id);
const alerts: [string, string, string][] = [
  ["DUPLICATE_DEVICE", "high", "Demo: 4 accounts registered from the same device fingerprint within 1 hour."],
  ["VELOCITY", "medium", "Demo: 9 failed contribution attempts within 10 minutes."],
  ["NAME_MISMATCH", "medium", "Demo: account name does not match identity record during verification."],
  ["IMPERSONATION_REPORT", "critical", "Demo: member reported a social-media page requesting payments in the platform's name."],
  ["GEO_ANOMALY", "low", "Demo: login from an unusual location for this account."],
];
for (const [i, a] of alerts.entries()) {
  await db.query(`INSERT INTO fraud_alerts(user_id,rule,severity,description,created_at) VALUES($1,$2,$3,$4, now() - ($5 || ' hours')::interval)`, [syn[i], a[0], a[1], a[2], String(i * 7 + 1)]);
}
await db.query(`INSERT INTO support_tickets(user_id,subject,category,body,status,priority) VALUES
  ($1,'How will identity verification work?','Verification','I would like to know which documents will be required.','resolved','low'),
  ($2,'Suspicious WhatsApp message','Fraud report','Someone asked me to send ₦3,000 to join. Is this you?','in_progress','high'),
  ($3,'Update phone number','Account','Please help me change my registered phone number.','open','low')`, [ids["member@demo.tbc"], syn[0], syn[1]]);

await db.query(`INSERT INTO audit_logs(actor_email, action, entity, metadata) VALUES ('system','SEED_DEMO_DATA','database', $1)`, [JSON.stringify({ note: "Demonstration data loaded" })]);

const c = await db.query(`SELECT (SELECT count(*) FROM users) users, (SELECT count(*) FROM contributions) contributions`);
console.log(`✓ seeded ${c.rows[0].users} demo users and ${c.rows[0].contributions} simulated ledger rows`);
await db.end();
