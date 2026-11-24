import type { Metadata } from "next";
import { PolicyLayout } from "@/components/site/PolicyLayout";

export const metadata: Metadata = { title: "Privacy notice", description: "How The Billionaire Circle collects, uses and protects personal data under the Nigeria Data Protection Act 2023." };

export default function Privacy() {
  return (
    <PolicyLayout
      eyebrow="Privacy notice"
      title="Your data, handled with care."
      lead="How we use your personal data for the waitlist and referral programme, under the Nigeria Data Protection Act 2023."
      version="Draft v0.1 · November 2026"
      sections={[
        { h: "Who we are", body: <p>The Billionaire Circle (TBC) [legal entity name, RC number and registered address to be inserted]. Data Protection Officer: [contact to be inserted].</p> },
        { h: "What we collect", body: <ul><li>Registration details: name, email, phone, state, password (stored only as a secure hash).</li><li>Referral data: your referral code, who referred you, and who you referred.</li><li>Security signals: a random device identifier stored in a cookie and a network address, which we keep only in <strong>one-way hashed</strong> form to detect duplicate accounts and fraud.</li><li>Aggregated counts of link visits and shares by channel (never who you shared with).</li></ul> },
        { h: "Why we use it and our lawful basis", body: <ul><li>To create and secure your account and run the waitlist — <strong>contract</strong>.</li><li>To attribute referrals, prevent fraud and keep an audit trail — <strong>legitimate interests</strong> and <strong>legal obligation</strong>.</li><li>To show you on the public leaderboard — <strong>your consent</strong>, which you can withdraw at any time.</li><li>To send optional updates — <strong>your consent</strong>.</li></ul> },
        { h: "What your referrer and referrals can see", body: <p>If you joined through someone&apos;s link, they see your first name and surname initial, when you joined and your referral status. They never see your email, phone or other details. Your referrals see the same limited information about you on the join page.</p> },
        { h: "Cookies", body: <ul><li><strong>tbc_session</strong> — keeps you signed in (essential).</li><li><strong>tbc_ref / tbc_c</strong> — remember a referral link you opened for 30 days so it can be credited (functional).</li><li><strong>tbc_did</strong> — a random device identifier used, hashed, for fraud prevention (security).</li></ul> },
        { h: "Sharing", body: <p>We share data only with service providers acting for us (for example hosting, email and SMS delivery) under contract, and with authorities where the law requires. We do not sell personal data.</p> },
        { h: "Retention", body: <p>Account data is kept while your account is open and for up to [period to be confirmed by counsel] afterwards for legal, audit and dispute purposes. Hashed security signals are kept for no longer than necessary for fraud prevention.</p> },
        { h: "Your rights", body: <p>You may request access, correction, deletion, restriction or portability of your data, object to processing, and withdraw consent, by contacting our Data Protection Officer or through the Support Centre. You may also complain to the Nigeria Data Protection Commission.</p> },
        { h: "Security", body: <p>Encrypted connections, hashed passwords, role-based staff access, append-only audit logs and regular security review. No system is perfectly secure; we will notify you and the regulator of any qualifying breach as required by law.</p> },
      ]}
    />
  );
}
