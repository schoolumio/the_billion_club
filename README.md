# The Billion Club — Community Wealth Initiative

> **10 million people. One shared vision. A new generation of wealth.**
> *Small daily. Shared prosperity.*

A pre-launch platform for a proposed Nigerian community wealth creation initiative: a public website, a member dashboard and an administrative console, built on Next.js, TypeScript, Tailwind CSS and PostgreSQL.

> ⚠️ **Status: pre-launch demonstration.** The platform does not collect money, run selections or pay awards, and the initiative is not licensed. All member, contribution and venture records are **seeded demonstration data**, labelled as such throughout the UI.

## Quick start

```bash
cp .env.example .env            # set DATABASE_URL and AUTH_SECRET
npm install
npm run db:setup                # migrate + seed demonstration data
npm run dev                     # http://localhost:3000
```

Requires Node 22.6+ (scripts use `--experimental-strip-types`) and PostgreSQL 14+.

### Demonstration accounts

| Role | Email | Password | Access |
|---|---|---|---|
| Member | `member@demo.tbc` | `Demo#2026` | Member dashboard |
| Administrator | `admin@demo.tbc` | `Admin#2026` | Everything |
| Auditor | `auditor@demo.tbc` | `Audit#2026` | Read-only finance, risk, audit |
| Support | `support@demo.tbc` | `Support#2026` | Members, support desk |

**Remove these before any production deployment** (the seed script refuses to run when `NODE_ENV=production`).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Next.js development, production build, production server |
| `npm run typecheck` · `npm run lint` | Static checks |
| `npm test` | Unit tests: financial model, RBAC, module gating |
| `npm run db:migrate` · `npm run db:seed` | Apply SQL migrations · load demonstration data |

## What's in the box

**Public site** — Home · How it works · Ecosystem (interactive flywheel) · Business development arm · Financial model (scenarios + interactive calculator) · Transparency centre · Community impact · About · FAQ · Legal & regulatory readiness · Brand kit · Register / sign in.

**Member dashboard** — profile, verification status, contribution statement with pagination, totals and streaks, eligibility status, announcements, opportunities (jobs, suppliers, training, business), business development updates, support centre with ticketing.

**Admin console** — KPIs (registered / verified / active), contribution monitoring, daily reconciliation, fund allocation monitoring, beneficiary records (intentionally empty), venture & employment tracking, compliance register, fraud alerts, append-only audit log, support desk. Role-based: admin, auditor, support.

## Documentation

- [`docs/STRATEGY.md`](docs/STRATEGY.md) — Phase 1–2: refined concept, financial critique, risks, brand and positioning
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — technical architecture, security, data model, integration modules
- [`docs/FEATURE-STATUS.md`](docs/FEATURE-STATUS.md) — what is production-ready vs simulated vs proposed
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — deployment and pre-launch hardening checklist
- [`docs/PRESENTATION.md`](docs/PRESENTATION.md) — a guided walkthrough for investor / government presentations
