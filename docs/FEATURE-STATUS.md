# Feature Status

| Feature | Status | Notes |
|---|---|---|
| Public website (11 pages) | ✅ Production-ready | Content requires legal review before publication |
| Registration & sign-in | ✅ Production-ready | Add email/phone verification and MFA before launch |
| Role-based access control | ✅ Production-ready | admin · auditor · support · member |
| Append-only audit log | ✅ Production-ready | DB-enforced |
| Member dashboard UI | ✅ Built | Displays **simulated** ledger data |
| Admin console UI | ✅ Built | Displays **demonstration** data |
| Support ticketing | ✅ Production-ready | Add notifications/SLA tracking |
| Financial model & calculator | ✅ Built | Assumptions are placeholders pending professional review |
| Contribution ledger schema | ✅ Built | Rows are `simulated` |
| Reconciliation view | 🧪 Simulated | Real matching needs custodian integration |
| Fraud alerts | 🧪 Simulated | Detection rules not implemented; alerts are seeded |
| Impact dashboard | 🧪 Demonstration | Clearly labelled demo data |
| Payment processing | ⛔ Not implemented by design | Awaiting approvals — interface only |
| Identity verification (NIN/BVN) | ⛔ Not implemented by design | Interface only |
| Beneficiary selection | ⛔ Not implemented by design | Interface only; methodology needs approval |
| Award payouts | ⛔ Not implemented by design | — |
| Leadership profiles | 📝 Placeholder | Awaiting real, consented information |
| Partnership email | 📝 Placeholder | — |
| **Waitlist & referrals** | | |
| Waitlist landing page, registration, attribution | ✅ Production-ready | Add CAPTCHA and SMS OTP before mass campaigns |
| Email verification | ✅ Built | Needs `RESEND_API_KEY`; otherwise demo links shown in-app |
| Referral links, QR, cards, flyers, share buttons | ✅ Production-ready | |
| Member referral dashboard, levels, appeals, privacy | ✅ Production-ready | |
| Leaderboard (opt-in names) | ✅ Production-ready | |
| Fraud scoring & human review | ✅ Production-ready | Tune thresholds with real data |
| Admin growth, review, settings, campaigns, exports | ✅ Production-ready | |
| Scheduled aggregation (cron) | ✅ Built | Daily on Vercel Hobby; move to incremental worker at scale |
| Referral rewards calculation engine | ✅ Built, **inactive** | Requires legal approval, funding and founder approval of the 1% source |
| Referral reward payouts | ⛔ Not implemented by design | Payments module disabled |
| Phone/SMS verification | 📝 Interface only | Needs licensed SMS provider |

