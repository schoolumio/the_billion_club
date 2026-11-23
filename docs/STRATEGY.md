# Strategy, Financial Critique & Brand (Phases 1–2)

> Not legal, tax or investment advice. A briefing document for founders and their professional advisers.

## 1. The concept, refined

| Element | Original concept | Refined position |
|---|---|---|
| Community | 10M members × ₦100/day | Kept as the **target**, always labelled as such |
| Inflow | ₦1bn/day, ₦30bn/month | Correct at **100% participation, before costs** |
| Awards | 30 × ₦1bn per month | Not fundable alongside any other commitment — see §2 |
| Differentiator | Ecosystem: businesses, jobs, suppliers | Kept and made central; legally separated funds |
| Launch | — | **No collection until licences, custody and opinions are in place** |

## 2. Critical financial finding

30 × ₦1bn = ₦30bn = **100% of projected gross inflow**. That leaves nothing for payment processing, statutory levies and tax, audit, operations, reserves, business development capital or community investment — and it assumes every member pays every day. At 80% participation the scheme would be ₦6bn short every month.

**Paying committed awards out of future growth is the structure of a Ponzi scheme**, which Nigerian law prohibits. The core rule we adopt: *awards are set from verified, already-collected inflow, never from projections.*

### Scenarios (all in `src/lib/finance/model.ts`, unit-tested)

| | Awards | Award pool | Verdict | Trade-off |
|---|---|---|---|---|
| A — As proposed | 30 × ₦1bn | 100% | Not viable | Nothing else funded; deficit below 100% participation |
| B — Keep ₦1bn | 12 × ₦1bn | 40% | Viable with conditions | Fewer beneficiaries; count floats with inflow |
| **C — Tiered (recommended)** | 3 × ₦1bn + 27 × ₦333m | 40% | Recommended | Keeps 30 beneficiaries and the ₦1bn headline |
| D — Larger base | 30 × ₦1bn | 40% | Requires growth | Needs 25M members, ₦250/day, or ≈₦18bn/month co-funding |

### Proposed allocation policy (share of gross inflow)

Awards 40% · Business development capital 20% · Community development 10% · Reserve 8% · Regulatory levies & tax 8% *(placeholder)* · Payment processing 3% *(placeholder)* · Operations 9% · Audit, assurance & governance 2%.

### Other risks and proposed mitigations

| Risk | Mitigation |
|---|---|
| Micro-payment fees and failures on 365 × ₦100 payments | Weekly/monthly pre-funding recorded daily; e-mandate direct debit |
| Participation volatility | Award tiers recalculated monthly from verified inflow; reserve target of 3 months' awards |
| Odds (~1 in 333,333/month) misread as likely wealth | Plain odds disclosure; ecosystem benefits for non-selected members |
| Mischaracterisation (lottery vs investment vs savings) | Multi-entity structure; five money types never blurred (below) |
| Concentration / failure of awarded wealth | Optional business development support; financial-literacy onboarding |
| Fraud and impersonation | No agent cash collection; in-app fraud reporting; public warnings |
| Governance capture | Independent board majority, member advisory council, conflicts register |

### Five kinds of money
1. **Member contribution** — not an investment, no promised return.
2. **Prize / award** — regulated according to licensing route.
3. **Business investment** — risk-bearing, separately regulated vehicle.
4. **Community development fund** — non-repayable grants.
5. **Operating expense** — capped and published.

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

- **Name:** The Billion Club (working name) — descriptor *Community Wealth Initiative*.
- **Primary tagline:** *Small daily. Shared prosperity.* Campaign line: *Together, we build wealth. Together, we change lives.*
- **Mission:** To unite millions of Nigerians in a transparent, well-governed community wealth system that funds awards, builds enduring businesses and creates jobs — beginning only once it is lawfully approved.
- **Vision:** A Nigeria where every community can build and share in its own prosperity.
- **Story:** Esusu and ajo, brought to national scale with professional management and radical transparency.
- **Mark:** twelve members in a ring around three ascending bars. Never a coin.
- **Palette:** Navy 950 `#060e22`, Navy 900 `#0b1834`, Gold 500 `#c89a24`, Gold 300 `#e3c46a`, Mist `#f6f7f9`.
- **Type:** Fraunces (display), Inter (interface, tabular figures).
- **Voice:** say *target, projection, proposed, awaiting approval*; never *guaranteed, jackpot, win big, returns*.

## 5. Site architecture

```
/                      Home (hero, idea, value proposition, steps, ecosystem, financial honesty, transparency, roadmap)
/how-it-works          Seven-step journey with safeguards and status labels
/ecosystem             Interactive flywheel + value-flow table
/business-development  Services, venture pathway, beneficiary rights
/financial-model       Critical finding, four scenarios, allocation policy, calculator, money types
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
