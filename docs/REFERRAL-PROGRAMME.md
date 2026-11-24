# TBC Waitlist & Referral Programme

> Status: **built, rewards inactive.** Nothing in this programme is approved by any regulator. This document is a specification and operating manual, not legal advice.

## 1. Refined specification

| Element | Specification |
|---|---|
| Goal | 10,000,000 **verified** waitlist members before launch |
| Cost to join | Free. Not an investment. No guaranteed return. No automatic enrolment in any paid programme. |
| Referral identity | Each member: unique code (`TBC` + 6 unambiguous characters), link `<domain>/join?ref=CODE`, QR code, branded card (1080×1350), A4 QR flyer, editable invitation message, WhatsApp / Facebook / X / Telegram / email / native share |
| Structure | **Single level.** Only directly referred members ever count. No downline, no override commissions, no requirement to recruit. |
| What counts | A referral is counted when the referred person is 18+, unique, verified (email; phone optional by config) and not flagged/rejected |
| Rewards (confirmed rule) | Daily allocation = daily contribution pool × **1%** (configurable). Member's share = eligible direct referrals ÷ total eligible users × allocation |
| Activation | Rewards engine `inactive` by default. Live runs require: state `active` + funding confirmed + legal approval reference |

## 2. Financial and mathematical findings

1. **The formula reduces to ₦1 per contributing referral per day.** With the denominator = members who contributed that day and ₦100 per contribution: share = r/N × (N × ₦100 × 1%) = **r × ₦1**. That is easy to explain to members and always funded by actual inflow.
2. **The 1% must come from somewhere in the 60/40 model.** **Decided by the founders (November 2026):** the emergency reserve goes from 6% to 5%; winners keep 60%. (The alternative considered was scaling the other 99% proportionally, which would have given winners 59.4%.) Implemented as `ADOPTED_ALLOCATION.referral = 1`, `reserve = 5`.
3. **Organic members create an undistributed remainder.** Everyone who joined without a referrer sits in the denominator but credits nobody, so (organic share) × allocation is never claimed. Rounding to the kobo and any per-member cap add a little more. The engine reports this as `unallocated_kobo`; by default it **returns to the reserve** (configurable: carry forward).
4. **The numerator and denominator must match.** Mixing "all verified referrals" with "members who paid today" could push shares above 100%. The settings screen therefore pairs them automatically:
   - **Members who paid that day** (default) → the member's verified referrals **who paid that day**
   - **All verified members** → all of the member's verified referrals
5. **Before launch there is no pool.** Waitlist sign-ups create no money. Dashboards show today's actual allocation (₦0) and an estimate of ₦0, and explain the ₦1-per-referral illustration.
6. **Earnings concentrate at the top and never stop.** A member with 1,000,000 contributing referrals would receive about ₦1,000,000 a day, indefinitely. That's mathematically consistent, but it raises concentration and "income from recruitment" concerns. An optional per-member cap exists (off by default) for the founders and counsel to decide on.
7. **Pool definition.** Default: **net received**, meaning reconciled contributions after failed payments and refunds, real money only (`status = 'reconciled' AND NOT is_demo`). Alternative: gross received. Projections, registrations or anticipated revenue are never used.

## 3. Legal & regulatory issues requiring Nigerian professional review

| Issue | Why it matters | Who |
|---|---|---|
| **Pyramid / Ponzi characteristics** | Rewards paid for recruiting people, funded from those people's payments, are a hallmark regulators look for. Single-level, actual-inflow-only, no reward for sign-up alone and no requirement to recruit all help, but a written opinion is essential before activation | SEC (Investments and Securities Act 2025), FCCPC, EFCC; external counsel |
| Regulated promotion / lottery | The referral reward could be treated as a sales promotion or as part of a lottery scheme requiring approval | FCCPC; state gaming regulators / NLRC (FCT) |
| Investment characterisation | Any suggestion of returns from recruitment could bring in securities law | SEC |
| Tax | Rewards are likely taxable income, so withholding and reporting obligations apply | Nigeria Revenue Service / state IRS |
| Payments & KYC | Payouts need a CBN-licensed provider, BVN/NIN KYC and tier limits | CBN; licensed PSP |
| AML/CFT | Many small payouts → structuring and mule risks; transaction monitoring | NFIU, SCUML |
| Data protection | Referral tracking, device/IP signals (hashed), cookies, showing the inviter's name, leaderboard display, consent records; DPIA update | NDPC (NDPA 2023) |
| Advertising & consumer protection | Members are promoting TBC, and TBC may be liable for misleading claims they make. Approved materials only; a wording guard blocks income and return claims | ARCON, FCCPC |
| Age & vulnerable users | 18+ only; avoid pressure tactics | FCCPC |
| Staff and insiders | Exclude staff and their households from rewards | Governance policy |

Tracked in `/compliance` (map + checklist) and the admin compliance register.

## 4. User journeys

**Invitee:** opens `/join?ref=CODE` → the code is pre-filled with "Invited by Adaeze O." → signs up (about a minute) → lands on *Invite & referrals* → verifies email → the referral moves pending → verified, and their own link is ready.

**Referrer:** *Invite & referrals* → copy link / share / QR / card → watches pending → verified counts, rank and level → can appeal a rejected referral once.

**Admin:** *Waitlist & growth* (KPIs) → *Referral review* (flags, appeals, lookup and audit trail) → *Referral settings* (versioned config) → *Referral rewards* (simulate / calculate → approve → fund → void; CSV; reconciliation) → *Campaigns & promo* (publish materials without a developer).

## 5. Attribution policy (implemented in `src/lib/referrals/attribution.ts`)

1. The code in the form **when submitted** wins. The form is pre-filled from this visit's `?ref=`, then from the `tbc_ref` cookie (most recent link, 30 days).
2. The registrant can see, change or clear the code. With no code, the registration is **organic**.
3. Attribution is **immutable** once written (database triggers on `users.referred_by`, `users.referral_code` and `referrals`).
4. One attribution per member (`UNIQUE referred_id`); a referrer can never be the referred member (`CHECK`).
5. Codes belonging to inactive or staff accounts credit nobody.
6. Single level: there is no data path that credits a referrer's referrer.

## 6. Verification & fraud architecture

- **Identity duplicates are blocked at registration:** normalised email (Gmail dots and `+tags` folded) and E.164 phone are unique.
- **Bots are blocked:** a hidden honeypot field and a minimum form-fill time; registrations are rate-limited per network. A CAPTCHA (e.g. Cloudflare Turnstile) can be added at `joinAction`.
- **Risk scoring sends registrations to human review, never to automatic rejection.** Signals add up: same device as the referrer, same network (low weight, never enough alone), sign-up velocity per referrer and network, device reuse, disposable email, name matching the referrer. A score of 40 or more puts the referral `under_review` and raises a `REFERRAL_RISK` fraud alert.
- **Signals are stored only as salted one-way hashes** (no raw IPs or device IDs).
- **Audit trail:** `referral_events` (append-only) records every status change with reason and actor; `audit_logs` records all admin actions; configuration is versioned and immutable.
- **Appeals:** one per rejected referral; a person decides, and the decision and resolution are recorded.

## 7. Data model (migration `0002_referrals.sql`)

`users` (+ referral_code, referred_by, normalised identity, verification timestamps, leaderboard prefs, hashed signals) · `referrals` · `referral_events` · `referral_daily_activity` (aggregated clicks and shares) · `referral_stats` (materialised per-member aggregates + rank) · `referral_snapshots` (public counter) · `referral_config_versions` · `referral_reward_runs` · `referral_rewards` · `referral_appeals` · `verification_tokens` · `email_outbox` · `campaigns` · `promo_materials`.

## 8. Rewards engine

`calculateReferralRewards()` (`src/lib/referrals/calc.ts`) is pure, integer-kobo, BigInt-exact and floored, and validates that eligible referrals never exceed the denominator. `runReferralRewards()` pins the config version, hashes the canonical inputs (SHA-256) and stores the run plus one line per member.

Status ladder (members see the same four words):

| Line status | Meaning |
|---|---|
| `estimated` | Calculated; **not payable** |
| `approved` | Finance sign-off recorded |
| `funded` | Contributions received and set aside; requires the config gate again |
| `paid` | Set **only** by the payments module, which is disabled |
| `reversed` | Run voided or referral invalidated, with a recorded reason |

Simulation runs (`status = simulation`) may use sample data and can never be advanced. Reconciliation check on every run: `distributed + unallocated = allocation`.

## 9. Scalability (10M members)

- **Indexed lookups only on hot paths:** code → user (unique), referrals by `(referrer_id, status)`, `referred_id` unique.
- **Dashboards never walk the referral graph.** Leaderboards, ranks and counters read `referral_stats` and `referral_snapshots`, refreshed by `/api/cron/referrals` (Vercel Cron, daily on the free plan). Admins can also click **Recalculate now**. At millions of rows, switch the full refresh to incremental updates keyed on `referrals.created_at/verified_at` and run every few minutes on a worker.
- **Clicks and shares are aggregated per day** (one row per referrer/day/channel), not stored per event.
- **Exports stream** in 5,000-row keyset pages.
- **Before scaling out:** move the in-memory rate limiter to Redis; put registration behind a queue for surge events; add a read replica for analytics; partition `referrals` and `referral_rewards` by month; set up PITR backups, uptime/error alerting and alerts on audit-write failures.

## 10. Admin operating manual

| Task | Where | Notes |
|---|---|---|
| Pause / resume referrals | Referral settings → *Referrals enabled* | Existing attributions are kept |
| Change referral domain | Referral settings → *Referral link domain* | Updates every link, QR and card immediately |
| Change allocation % / basis / denominator / cap / cut-off / schedule | Referral settings | Reason required; creates a new immutable version |
| Achievement thresholds | Referral settings → Links & achievements | Must increase |
| Activate rewards | Referral settings | Blocked unless funding confirmed **and** legal approval reference entered |
| Review suspicious referrals | Referral review → queue | Reason required; the reason is shown to the referrer on rejection |
| Decide appeals | Referral review → appeals | Upholding approves the referral |
| Investigate a dispute | Referral review → search by code / email / member no. | Shows attribution source, risk flags and full event trail |
| Simulate rewards | Referral rewards → Simulation | Never payable |
| Daily live run | Automatic (cron) when active, or manual | Then Approve → Mark funded |
| Export | Waitlist & growth (referrals CSV), Referral rewards (per-run CSV) | Logged; formula-injection safe |
| Publish materials | Campaigns & promo | Must include `{link}`; financial-promise wording is blocked |
| Refresh numbers | Waitlist & growth → Recalculate now | Also runs daily |

## 11. Configuration & environment

`CRON_SECRET` (secures the scheduled job) · `RESEND_API_KEY` + `EMAIL_FROM` (email delivery; without them, verification links are shown in-app and logged to `email_outbox`, which is suitable for demos only) · `NEXT_PUBLIC_SITE_URL`.
