# Strategy, Financial Critique & Brand (Phases 1–2)

> Not legal, tax or investment advice. A briefing document for founders and their professional advisers.

## 1. The adopted model (founder decisions)

| Element | Decision |
|---|---|
| Registration | **Unlimited** |
| Daily places | **10 million per day** at ₦100, first come first served, one per verified person; the day closes when full |
| Split | **60% to winners / 40% to the team**, of money actually collected |
| Awards | **30 winners a month: 3 × ₦1bn grand + 27 × ≈₦556m enterprise** (at full capacity) |
| Business fund | **Kept at 12%** — jobs are created whatever winners decide |
| Selection entries | Proposed: one entry per day a place is held (awaiting approval) |
| Launch | No collection until licences, custody and professional opinions are in place |

### Full-capacity month (10M places × ₦100 × 30 days = ₦30bn)

| Fund | Share | Monthly |
|---|---|---|
| **Winners** | **60%** | **₦18.0bn** |
| Business development fund | 12% | ₦3.6bn |
| Government levies & taxes *(estimate)* | 8% | ₦2.4bn |
| Emergency reserve | 5% | ₦1.5bn |
| Referral rewards (inactive until legally approved) | 1% | ₦0.3bn |
| Community development | 5% | ₦1.5bn |
| Staff, technology, support | 5% | ₦1.5bn |
| Bank & payment charges | 3% | ₦0.9bn |
| Audit & oversight | 1% | ₦0.3bn |
| **Team total** | **40%** | **₦12.0bn** |

### The golden rule: awards follow money already collected

| Places sold | Collected | Award structure |
|---|---|---|
| 100% | ₦30bn | 3 × ₦1bn + 27 × ₦556m |
| 80% | ₦24bn | 3 × ₦1bn + 27 × ₦422m |
| 60% | ₦18bn | 3 × ₦1bn + 27 × ₦289m |
| 1M members/day | ₦3bn | 30 × ₦60m (pool below ₦5bn → equal shares) |

Implemented and unit-tested in `src/lib/finance/model.ts` (`ADOPTED_ALLOCATION`, `tieredAwards`, `adoptedAwards`).

## 2. Why the alternatives were rejected

| Model | Winners | Verdict | Reason |
|---|---|---|---|
| A — 30 × ₦1bn | 100% | Not viable | Nothing left for any cost; shortfall whenever a place goes unsold. Paying promises from future money is a Ponzi structure. |
| B — 30 × ₦900m (10% charge) | 90% | Not viable | ₦3bn is consumed by bank charges and estimated levies before staff, audit or reserve |
| C — 3 × ₦1bn + 27 × ₦333m | 40% | Viable | Strong ecosystem, but awards judged too small |
| **D — 3 × ₦1bn + 27 × ₦556m** | **60%** | **Adopted** | Balances attractive awards with solvency and the jobs ecosystem |

### Risks specific to the adopted model

| Risk | Mitigation |
|---|---|
| Levies/taxes exceed the 8% estimate | Obtain the tax opinion first; the team share has little slack |
| **Opening-time rush**: millions of payments in minutes | Virtual waiting room, atomic place counter, idempotent payments, pre-funded wallets via a licensed partner, load testing at 10× expected peak |
| Fairness: urban/fast-internet members win the rush | USSD channel parity, bot protection, one place per verified identity; consider a fixed opening time announced in advance |
| Scarcity marketing seen as pressure selling | Show factual availability only; no countdowns or "last chance" copy; ARCON vetting |
| Mischaracterisation as a lottery | "Daily places", not "tickets"; multi-entity structure; the business and community funds are real and audited |
| Award concentration | Optional business support; financial-literacy onboarding for winners |

### Five kinds of money
1. **Member contribution**: the ₦100 for a daily place. Not an investment, no promised return.
2. **Prize / award**: 60% pool, regulated according to the licensing route.
3. **Business investment**: 12% fund in a separately regulated vehicle.
4. **Community development fund**: 5%, non-repayable grants.
5. **Operating expense**: 9% combined (bank, staff, audit), capped and published.

## 3. Regulatory questions (Nigeria)

Full map and checklist: `/compliance` page and `src/lib/content/compliance.ts`. Headline items:
- **Lottery/gaming** — characterisation of the award mechanism; federal (NLRC, FCT) vs state regulators following the 2024 Supreme Court guidance on jurisdiction; certified selection.
- **Securities** — SEC; Investments and Securities Act 2025 (collective investment schemes, Ponzi prohibition).
- **Payments & custody** — CBN-licensed partners; segregated custodial accounts; trustee.
- **Consumer protection** — FCCPC (FCCPA 2018).
- **Data** — NDPC (Nigeria Data Protection Act 2023).
- **AML/CFT** — NFIU, SCUML/EFCC (MLPPA 2022).
- **Tax** — Nigeria Revenue Service (formerly FIRS), state IRS; 2025 tax reform Acts.
- **Advertising** — ARCON pre-exposure vetting.
- **Corporate** — CAC (CAMA 2020), FRC governance code.
- **Telecoms** — NCC for USSD/SMS.

**Proposed structure for counsel to test:** licensed award vehicle (or licensed-operator partnership) · SEC-regulated business development fund with independent trustee · foundation (incorporated trustees) for community grants · operating company on a capped, published fee · independent custodian and external auditor across all.

## 4. Brand

- **Name:** The Billionaire Circle (TBC).
- **Logo:** supplied artwork (`public/brand/tbc-logo-supplied.webp`), redrawn as a vector in `src/components/ui/Logo.tsx`: the TBC monogram in a gold ring with an inner hairline and a highlight dot at twelve o'clock, beside the wordmark. On white backgrounds the wordmark switches to navy for legibility.
- **Favicon:** the roundel alone (`src/app/icon.svg`, `src/app/apple-icon.png`).
- **Logo tagline:** *Together, we build billionaires.* Supporting line: *Small daily. Shared prosperity.*
- **Mission:** To unite millions of Nigerians in a transparent, well-governed community wealth system that funds awards, builds enduring businesses and creates jobs — beginning only once it is lawfully approved.
- **Vision:** A Nigeria where every community can build and share in its own prosperity.
- **Palette:** Logo navy `#0d1b2b`, logo gold `#d4af37`, highlight `#f5d06a`; interface navy `#0b1834`, button gold `#c89a24`, mist `#f6f7f9`.
- **Type:** Fraunces (display), Inter (interface, tabular figures).
- **Voice:** say *target, projection, proposed, awaiting approval*; never *guaranteed, jackpot, win big, returns*.
- **Advertising caution:** "we build billionaires" must always appear alongside the odds and the awards-follow-collections rule in campaigns; ARCON/FCCPC may treat an unqualified wealth promise as misleading.

## 5. Site architecture

```
/                      Home (hero, idea, value proposition, steps, ecosystem, financial honesty, transparency, roadmap)
/how-it-works          Seven-step journey with safeguards and status labels
/ecosystem             Interactive flywheel + value-flow table
/business-development  Services, venture pathway, beneficiary rights
/financial-model       Adopted 60/40 model, daily places, awards-follow-collections tables, alternatives, calculator
/transparency          Actual-zero counters, nine reporting commitments, report preview (demo)
/impact                Seven indicators (actual = 0), demo impact dashboard
/about                 Vision, mission, philosophy, leadership placeholders, governance, partner contact
/faq                   14 questions; unresolved policies flagged "Awaiting approval"
/compliance            Regulatory map + readiness checklist
/brand                 Brand kit
/login, /register      Auth
/dashboard/*           Member space
/admin/*               Administration (RBAC)
```
