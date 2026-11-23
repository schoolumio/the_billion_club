# Deployment

## Environment
| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Managed PostgreSQL with TLS (`?sslmode=require`) |
| `AUTH_SECRET` | yes | ≥32 random bytes, stored in a secrets manager |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical URL for SEO metadata and sitemap |
| `DB_POOL_MAX` | no | Default 10 |
| `SEED_DEMO_DATA` | no | `true` loads demo accounts on deploy when the database is empty |

## Vercel (configured)
`vercel.json` runs `npm run vercel-build`, which:
1. applies any pending SQL migrations (skipped with a warning if `DATABASE_URL` is unset),
2. loads demonstration data **only if** `SEED_DEMO_DATA=true` **and** the database has no users,
3. runs `next build`.

Set `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL` (and `SEED_DEMO_DATA=true` for a demo deployment) in Project → Settings → Environment Variables. Remove `SEED_DEMO_DATA` before real launch.

## Other targets
- **Container (AWS ECS / GCP Cloud Run / Azure):** `npm ci && npm run build && npm start` on Node 22; put behind a TLS load balancer; health check `GET /`.
- **Data residency:** consider hosting member data in-country or in an NDPC-acceptable jurisdiction — confirm with the DPO.

## Pre-launch hardening checklist
- [ ] Remove demo accounts and demo data; never run `db:seed` in production
- [ ] Email + phone verification, MFA for all staff roles
- [ ] Redis-backed rate limiting and session revocation
- [ ] Content-Security-Policy with nonces
- [ ] Centralised logging, alerting on audit-log write failures
- [ ] Automated backups + point-in-time recovery; restore drill
- [ ] Independent penetration test and code review
- [ ] DPIA, privacy notice, cookie notice, terms (legal sign-off)
- [ ] All regulated modules remain disabled until compliance sign-off
