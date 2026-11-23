# Technical Architecture

## Stack
Next.js 15 (App Router, React 19 Server Components & Server Actions) · TypeScript (strict) · Tailwind CSS v4 · PostgreSQL via `pg` (parameterised SQL) · `jose` JWT sessions · `bcryptjs` · `zod` validation · `lucide-react` icons · self-hosted fonts (`@fontsource`).

## Layout
```
src/
  app/(site)/          public marketing pages (static, prerendered)
  app/(auth)/          login, register
  app/dashboard/       member area (dynamic, permission-gated)
  app/admin/           admin area (dynamic, permission-gated)
  components/          ui primitives, site chrome, charts, app shell
  lib/auth/            JWT, session, RBAC matrix, server actions
  lib/db/              pool + typed query functions
  lib/finance/model.ts pure financial model (shared by pages, calculator, tests)
  lib/modules/         payments / identity / selection interfaces — disabled
  lib/content/         editorial content (FAQ, compliance, steps, roadmap)
  middleware.ts        edge auth gate for /dashboard and /admin
db/migrations/         SQL migrations (applied by scripts/migrate.ts)
scripts/               migrate, seed (demo data)
tests/                 node:test unit tests
```

## Security
- **Authentication:** bcrypt (cost 12) password hashes; HS256 JWT in an `httpOnly`, `SameSite=Lax`, `Secure` (prod) cookie, 8-hour expiry; issuer/audience checked.
- **Authorisation:** single RBAC matrix (`lib/auth/roles.ts`); enforced at the edge (middleware) *and* in every page/action (`requirePermission`). Auditors are read-only.
- **Input:** all forms validated with zod; all SQL parameterised; open-redirect protection on `next`.
- **Abuse:** rate limiting on login, registration and tickets (in-memory; swap for Redis when scaling horizontally); constant-time-style login failure path.
- **Audit:** `audit_logs` is append-only — a database trigger rejects UPDATE/DELETE. Logins, failures, registrations, admin views of member data, ticket and alert changes are logged with IP.
- **Headers:** HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy; `X-Powered-By` removed.
- **Money:** stored as integer kobo (`bigint`). Contributions are a ledger; status transitions `simulated → reconciled | failed | reversed`.

## Data model
`users` · `contributions` (ledger) · `announcements` · `opportunities` · `ventures` · `support_tickets` · `audit_logs` · `fraud_alerts` · `compliance_items`. Every demo-able table has `is_demo`. See `db/migrations/0001_init.sql`.

## Integration modules (post-approval)
`src/lib/modules/index.ts` defines `PaymentProvider`, `IdentityProvider` and `SelectionEngine`. Today each is a proxy that throws `FeatureNotApprovedError` (tested). To integrate:
1. Implement the interface against the licensed provider.
2. Payments: write ledger rows only from **verified webhooks**, idempotent on provider reference; reconciliation job matches custodian statements.
3. Selection: commit-reveal seed, hashed eligibility snapshot, independent observer sign-off, immutable record.
4. Gate behind a feature flag plus a recorded compliance sign-off.

## Scaling path
Stateless app servers behind a load balancer; PgBouncer; read replicas for reporting; partition `contributions` by month (≈300M rows/month at full target); move aggregates to materialised views refreshed by a job; Redis for rate limiting and sessions revocation list; queue (e.g. SQS) for webhooks and notifications; CDN for static pages.

## Accessibility & performance
Semantic landmarks, skip link, visible focus, `aria-current`, `aria-live` regions on interactive diagrams, status shown as icon + text (never colour alone), chart data tables, `prefers-reduced-motion` honoured. Chart palette validated for colour-vision deficiency. Marketing pages are statically prerendered (~105–113 kB first load JS).
