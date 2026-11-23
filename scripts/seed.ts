/**
 * Seeds CLEARLY LABELLED DEMONSTRATION DATA. Every seeded business row carries
 * is_demo = true and every contribution has status 'simulated'. No real people,
 * payments, beneficiaries or audits are represented.
 */
import pg from "pg";
import bcrypt from "bcryptjs";
import { loadEnv } from "./env.ts";

loadEnv();
if (process.env.NODE_ENV === "production" && !process.argv.includes("--force")) {
  console.error("Refusing to seed demo data in production. Pass --force if you really mean it.");
  process.exit(1);
}

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

// Deterministic PRNG so demo data is stable between runs.
let s = 20261123;
const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];

const STATES = ["Lagos", "FCT Abuja", "Kano", "Rivers", "Oyo", "Kaduna", "Enugu", "Anambra", "Delta", "Ogun", "Plateau", "Edo", "Cross River", "Borno", "Kwara"];
const FIRST = ["Adaeze", "Tunde", "Ngozi", "Ibrahim", "Funmilayo", "Chinedu", "Aisha", "Emeka", "Halima", "Segun", "Zainab", "Obinna", "Kemi", "Musa", "Ifeoma", "Yusuf", "Bisi", "Uche", "Hauwa", "Dayo"];
const LAST = ["Okafor", "Adeyemi", "Bello", "Eze", "Abubakar", "Ogunleye", "Nwosu", "Danjuma", "Okonkwo", "Balogun", "Ibekwe", "Lawal", "Umeh", "Garba", "Afolabi"];

console.log("→ clearing previous demonstration data");
await db.query(`TRUNCATE audit_logs, fraud_alerts, support_tickets, contributions, announcements, opportunities, ventures, compliance_items, users RESTART IDENTITY CASCADE`);

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
];
for (const c of comp) {
  await db.query(`INSERT INTO compliance_items(area,requirement,authority,status,owner) VALUES($1,$2,$3,$4,'Unassigned (demo)')`, c);
}

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
