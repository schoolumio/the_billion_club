/**
 * Regulatory map for Nigeria. This is a scoping document prepared to brief
 * counsel — NOT legal advice. Every item must be confirmed by qualified
 * Nigerian legal, tax and regulatory professionals before launch.
 */
export interface RegArea {
  area: string;
  question: string;
  authorities: string[];
  instruments: string[];
  needed: string[];
}

export const REG_AREAS: RegArea[] = [
  {
    area: "Lottery & gaming",
    question: "Is selecting paying members to receive awards a lottery, a sales promotion, or something else — and who regulates it?",
    authorities: ["State lottery / gaming regulators (e.g. Lagos State Lotteries and Gaming Authority)", "National Lottery Regulatory Commission (NLRC) — FCT"],
    instruments: ["National Lottery Act 2005", "State lottery and gaming laws", "Supreme Court guidance (2024) on federal vs state jurisdiction over lotteries"],
    needed: ["Formal legal opinion on characterisation", "Licence(s) in each state of operation, or a licensed-operator partnership", "Approved draw/selection rules and certified random number generation"],
  },
  {
    area: "Investments & collective schemes",
    question: "Does pooling member money for business capital create a collective investment scheme or regulated investment activity?",
    authorities: ["Securities and Exchange Commission (SEC) Nigeria"],
    instruments: ["Investments and Securities Act 2025 (including provisions on Ponzi schemes and collective investment schemes)", "SEC Rules and Regulations"],
    needed: ["Opinion on whether any element is an investment", "If so, a registered fund manager and trustee for the business development fund", "Strict separation from the award pool"],
  },
  {
    area: "Payments & fund custody",
    question: "Who may collect, hold and disburse member funds, and must they be safeguarded?",
    authorities: ["Central Bank of Nigeria (CBN)", "Licensed payment service providers and commercial banks"],
    instruments: ["CBN payments licensing framework", "BOFIA 2020", "CBN guidelines on e-mandates, KYC and consumer protection"],
    needed: ["Licensed collection and payout partners", "Segregated escrow/custodial accounts", "No stored-value wallet without the appropriate licence or licensed partner"],
  },
  {
    area: "Consumer protection",
    question: "Are terms fair, are refund rights clear, and are promotional claims truthful and not misleading?",
    authorities: ["Federal Competition and Consumer Protection Commission (FCCPC)"],
    instruments: ["Federal Competition and Consumer Protection Act 2018", "FCCPC promotion and disclosure requirements"],
    needed: ["Plain-language terms and odds disclosure", "Complaints and dispute-resolution process", "Approval of any sales promotion elements if applicable"],
  },
  {
    area: "Data protection",
    question: "How will identity, financial and contact data of millions of members be lawfully processed and protected?",
    authorities: ["Nigeria Data Protection Commission (NDPC)"],
    instruments: ["Nigeria Data Protection Act 2023", "NDPC General Application and Implementation Directive"],
    needed: ["Registration as a data controller of major importance", "Data Protection Impact Assessment", "Data Protection Officer, breach response plan, annual compliance audit"],
  },
  {
    area: "Anti-money laundering",
    question: "How do we prevent the platform being used to launder money or finance terrorism?",
    authorities: ["Nigerian Financial Intelligence Unit (NFIU)", "SCUML (EFCC)", "EFCC"],
    instruments: ["Money Laundering (Prevention and Prohibition) Act 2022", "Terrorism (Prevention and Prohibition) Act 2022"],
    needed: ["AML/CFT programme and compliance officer", "SCUML registration if designated", "Transaction monitoring, sanctions screening, suspicious transaction reporting"],
  },
  {
    area: "Taxation",
    question: "How are contributions, awards, fund income, fees and business investments taxed?",
    authorities: ["Nigeria Revenue Service (formerly FIRS)", "State Internal Revenue Services"],
    instruments: ["Nigeria Tax Act 2025 and Nigeria Tax Administration Act 2025", "State tax and lottery-levy laws"],
    needed: ["Formal tax opinion", "Withholding and remittance processes", "VAT treatment of fees"],
  },
  {
    area: "Advertising",
    question: "Can our campaigns legally say what we want them to say?",
    authorities: ["Advertising Regulatory Council of Nigeria (ARCON)"],
    instruments: ["ARCON Act 2022", "Nigerian Code of Advertising Practice"],
    needed: ["Pre-exposure vetting of adverts", "No guaranteed-wealth or misleading claims", "Clear target vs actual labelling", "Daily-places scarcity shown factually — no countdowns or pressure selling"],
  },
  {
    area: "Corporate governance",
    question: "What legal entities, boards and controls will hold the organisation accountable?",
    authorities: ["Corporate Affairs Commission (CAC)", "Financial Reporting Council of Nigeria (FRC)"],
    instruments: ["Companies and Allied Matters Act 2020", "Nigerian Code of Corporate Governance"],
    needed: ["Operating company + foundation/incorporated trustees", "Independent board, audit and risk committees", "Conflict-of-interest and related-party policies"],
  },
  {
    area: "Telecoms channels",
    question: "Can members contribute and receive updates via USSD and SMS?",
    authorities: ["Nigerian Communications Commission (NCC)"],
    instruments: ["NCC short-code and value-added service rules"],
    needed: ["USSD/SMS through licensed aggregators", "Clear charges disclosed to members"],
  },
];

REG_AREAS.push({
  area: "Referral rewards",
  question: "Could paying members for recruiting others — funded from those members' contributions — be treated as a pyramid or Ponzi feature, a regulated sales promotion, a lottery prize or an investment return?",
  authorities: ["Securities and Exchange Commission (SEC)", "FCCPC", "State gaming regulators / NLRC", "EFCC"],
  instruments: ["Investments and Securities Act 2025 (Ponzi/pyramid provisions)", "FCCPA 2018 (unfair and deceptive practices; promotions)", "State lottery laws", "Nigeria Tax Act 2025 (treatment of rewards)", "NDPA 2023 (referral tracking, cookies, leaderboard)"],
  needed: [
    "Written opinion on the single-level, 1%-of-actual-contributions design before any activation",
    "Confirmation that rewards may be paid at all, and to whom (KYC, age, staff exclusions)",
    "Tax withholding and reporting rules for rewards; payout via a CBN-licensed provider",
    "Consent and cookie review; DPIA update; ARCON approval of member-facing materials",
  ],
});

export const CHECKLIST: { group: string; items: { text: string; status: "done" | "in_progress" | "todo" }[] }[] = [
  { group: "Legal structure", items: [
    { text: "Engage Nigerian counsel with gaming, securities and payments expertise", status: "todo" },
    { text: "Obtain written opinion on characterisation of the award mechanism", status: "todo" },
    { text: "Obtain opinion on securities/collective investment exposure", status: "todo" },
    { text: "Design multi-entity structure (operating company, award vehicle, fund vehicle, foundation)", status: "in_progress" },
    { text: "Incorporate entities with CAC", status: "todo" },
  ]},
  { group: "Licensing & approvals", items: [
    { text: "Identify launch states and their gaming regulators", status: "todo" },
    { text: "Apply for licences / partner with licensed operator", status: "todo" },
    { text: "Approval of selection methodology and certified RNG", status: "todo" },
    { text: "ARCON pre-exposure approval for launch campaign", status: "todo" },
  ]},
  { group: "Money & custody", items: [
    { text: "Appoint independent trustee and custodian bank", status: "todo" },
    { text: "Contract CBN-licensed collection and payout partners", status: "todo" },
    { text: "Approve allocation policy with actuarial/financial review", status: "in_progress" },
    { text: "Appoint external auditor", status: "todo" },
    { text: "Obtain formal tax opinion", status: "todo" },
  ]},
  { group: "Members & data", items: [
    { text: "Plain-language terms, odds and refund policy", status: "todo" },
    { text: "Data Protection Impact Assessment and DPO appointment", status: "todo" },
    { text: "NDPC registration", status: "todo" },
    { text: "AML/CFT programme and compliance officer", status: "todo" },
    { text: "Complaints handling and dispute resolution", status: "todo" },
  ]},
  { group: "Referral programme", items: [
    { text: "Single-level design, immutable attribution and fraud review built", status: "done" },
    { text: "Rewards engine gated behind funding confirmation and legal approval reference", status: "done" },
    { text: "Legal opinion on referral rewards (pyramid / promotion / lottery / tax)", status: "todo" },
    { text: "Founder approval of the 1% source (reserve 6% → 5%)", status: "done" },
    { text: "Email delivery provider and SMS OTP provider contracted", status: "todo" },
  ]},
  { group: "Platform", items: [
    { text: "Role-based access control and audit logging", status: "done" },
    { text: "Append-only ledger design with reconciliation hooks", status: "done" },
    { text: "Independent penetration test", status: "todo" },
    { text: "Identity verification (NIN/BVN) partner integration", status: "todo" },
    { text: "Payment provider integration (after approval only)", status: "todo" },
  ]},
];
