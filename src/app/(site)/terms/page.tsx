import type { Metadata } from "next";
import { PolicyLayout } from "@/components/site/PolicyLayout";

export const metadata: Metadata = { title: "Waitlist terms", description: "Terms for joining The Billionaire Circle pre-launch waitlist." };

export default function Terms() {
  return (
    <PolicyLayout
      eyebrow="Waitlist terms"
      title="Simple terms for a free waitlist."
      lead="These terms apply to the pre-launch waitlist and referral programme only."
      version="Draft v0.1 · November 2026"
      sections={[
        { h: "Pre-launch status", body: <p>TBC has not launched and does not yet hold the licences or approvals required to operate its proposed contribution and award model. Information on this site describes intentions and proposals, not operating services.</p> },
        { h: "Free, not an investment", body: <p>Joining the waitlist is free. It is not a deposit, savings product, investment or security, does not entitle you to any financial return and does not enrol you in any future paid programme. If TBC launches, any participation will require you to accept separate terms at that time.</p> },
        { h: "Eligibility and accounts", body: <p>You must be 18 or older and provide accurate information. One account per person. You are responsible for keeping your password confidential.</p> },
        { h: "Referral programme", body: <p>Your participation in referrals is governed by the Referral Programme Policy, which forms part of these terms.</p> },
        { h: "Acceptable use", body: <p>Do not create fake or duplicate accounts, use bots, spam people, impersonate TBC, collect money in TBC&apos;s name or make claims about income or returns. We may suspend accounts that do.</p> },
        { h: "Changes and termination", body: <p>We may change or close the waitlist, or these terms, with notice where reasonably possible. You may close your account at any time.</p> },
        { h: "Liability", body: <p>[Limitation of liability, governing law (Federal Republic of Nigeria) and dispute resolution clauses to be drafted by Nigerian counsel.]</p> },
      ]}
    />
  );
}
