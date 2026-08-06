/**
 * Fist Receivable Financing Agreement — source text for the loan apply document reader.
 * Content must match the provided legal write-up; only presentation/organization may differ.
 */
export const FIST_RECEIVABLE_FINANCING_AGREEMENT_VERSION = '1.0'

export type AgreementContentBlock =
  | { type: 'docTitle'; text: string }
  | { type: 'meta'; label: string; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'party'; text: string }
  | { type: 'sectionHeading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'bullet'; text: string }

/** Verbatim agreement body (organization only — no wording changes). */
export const FIST_RECEIVABLE_FINANCING_AGREEMENT_BLOCKS: readonly AgreementContentBlock[] = [
  { type: 'docTitle', text: 'FIST RECEIVABLE FINANCING AGREEMENT' },
  { type: 'meta', label: 'Agreement Version', text: '1.0' },
  {
    type: 'meta',
    label: 'Effective Date',
    text: 'The date the Merchant electronically accepts this Agreement for the applicable receivable.',
  },
  {
    type: 'paragraph',
    text: 'This Receivable Financing Agreement is entered into between:',
  },
  {
    type: 'party',
    text: 'FIST COMMERCE INCORPORATED, corporation number 102025248, a Saskatchewan business corporation with its registered office at 103-25 Russell Drive, Yorkton, Saskatchewan, Canada, S3N 3V5 (“Fist”);',
  },
  { type: 'paragraph', text: 'and' },
  {
    type: 'party',
    text: 'the business identified as the merchant in the applicable receivable-funding application and Transaction Schedule (“Merchant”).',
  },
  {
    type: 'paragraph',
    text: 'The company details above are taken from Fist’s Saskatchewan incorporation records.',
  },
  {
    type: 'paragraph',
    text: 'Fist and the Merchant are each a “Party” and together the “Parties.”',
  },

  { type: 'sectionHeading', text: '1. Application of this Agreement' },
  {
    type: 'paragraph',
    text: 'This Agreement applies separately to every invoice or receivable submitted by the Merchant for financing through the Fist platform.',
  },
  {
    type: 'paragraph',
    text: 'The specific terms for each receivable will be shown in a Transaction Schedule before the Merchant submits the application.',
  },
  {
    type: 'paragraph',
    text: 'Submitting an application does not guarantee approval or funding. A receivable is funded only after Fist approves it and sufficient financing capital is available.',
  },

  { type: 'sectionHeading', text: '2. Transaction Schedule' },
  {
    type: 'paragraph',
    text: 'The Transaction Schedule will contain the applicable transaction details, including:',
  },
  { type: 'bullet', text: 'Merchant legal name and wallet address;' },
  { type: 'bullet', text: 'buyer or debtor;' },
  { type: 'bullet', text: 'invoice number;' },
  { type: 'bullet', text: 'invoice date and due date;' },
  { type: 'bullet', text: 'invoice face value and currency;' },
  { type: 'bullet', text: 'amount requested;' },
  { type: 'bullet', text: 'amount approved for financing;' },
  { type: 'bullet', text: 'financing fees or charges;' },
  { type: 'bullet', text: 'total repayment amount;' },
  { type: 'bullet', text: 'repayment date;' },
  { type: 'bullet', text: 'grace period, where applicable;' },
  { type: 'bullet', text: 'late-payment charge, where applicable;' },
  { type: 'bullet', text: 'recourse or non-recourse status;' },
  { type: 'bullet', text: 'payout wallet;' },
  { type: 'bullet', text: 'repayment instructions;' },
  { type: 'bullet', text: 'invoice or document hash;' },
  { type: 'bullet', text: 'receivable ID;' },
  { type: 'bullet', text: 'Agreement version; and' },
  { type: 'bullet', text: 'governing jurisdiction.' },
  {
    type: 'paragraph',
    text: 'The Merchant must review and accept the Transaction Schedule before submitting the application.',
  },
  {
    type: 'paragraph',
    text: 'Where the Transaction Schedule conflicts with this Agreement, the Transaction Schedule will govern only for the transaction-specific commercial term concerned.',
  },

  { type: 'sectionHeading', text: '3. Merchant authority and electronic acceptance' },
  {
    type: 'paragraph',
    text: 'The person submitting the application confirms that they:',
  },
  { type: 'bullet', text: 'are authorized to act for and legally bind the Merchant;' },
  { type: 'bullet', text: 'have reviewed this Agreement and the Transaction Schedule;' },
  { type: 'bullet', text: 'understand and accept the financing and repayment terms;' },
  {
    type: 'bullet',
    text: 'intend the checkbox confirmations, submission action and wallet signature to serve as the Merchant’s electronic acceptance; and',
  },
  {
    type: 'bullet',
    text: 'authorize Fist to retain an electronic record of that acceptance.',
  },
  {
    type: 'paragraph',
    text: 'The Agreement becomes binding for a receivable when the Merchant completes the required acknowledgements, signs using the connected wallet and submits the application.',
  },

  { type: 'sectionHeading', text: '4. Merchant representations' },
  {
    type: 'paragraph',
    text: 'For every submitted invoice, the Merchant represents and confirms that:',
  },
  {
    type: 'bullet',
    text: 'the invoice and supporting information are genuine, complete and accurate;',
  },
  {
    type: 'bullet',
    text: 'the invoice relates to a real sale of goods or provision of services;',
  },
  {
    type: 'bullet',
    text: 'the goods or services have been supplied or performed as represented;',
  },
  { type: 'bullet', text: 'the buyer is obligated to pay the invoice;' },
  { type: 'bullet', text: 'the invoice has not already been paid;' },
  {
    type: 'bullet',
    text: 'the invoice has not been forged, duplicated or materially altered;',
  },
  {
    type: 'bullet',
    text: 'the receivable has not previously been sold, assigned, pledged or financed, except where disclosed to Fist;',
  },
  {
    type: 'bullet',
    text: 'the invoice is not subject to an undisclosed dispute, cancellation, return, credit note, deduction or set-off;',
  },
  { type: 'bullet', text: 'the Merchant owns or lawfully controls the receivable;' },
  {
    type: 'bullet',
    text: 'the Merchant has authority to obtain financing against the receivable;',
  },
  { type: 'bullet', text: 'the submitted wallet and payment information are correct;' },
  {
    type: 'bullet',
    text: 'any relationship between the Merchant and buyer has been disclosed;',
  },
  { type: 'bullet', text: 'the submitted transaction is lawful; and' },
  {
    type: 'bullet',
    text: 'the Merchant has authority to provide the invoice and supporting documents to Fist and approved financing participants.',
  },
  {
    type: 'paragraph',
    text: 'The Merchant must promptly notify Fist if any submitted information becomes inaccurate or if the invoice is disputed, reduced, cancelled or paid outside the agreed repayment process.',
  },

  { type: 'sectionHeading', text: '5. Verification and approval' },
  { type: 'paragraph', text: 'The Merchant authorizes Fist to:' },
  {
    type: 'bullet',
    text: 'verify the Merchant, buyer, invoice and supporting documents;',
  },
  { type: 'bullet', text: 'perform KYC, KYB, sanctions, fraud and risk checks;' },
  { type: 'bullet', text: 'request additional documents or information;' },
  { type: 'bullet', text: 'compare document hashes and transaction records;' },
  { type: 'bullet', text: 'verify whether the invoice has previously been financed;' },
  { type: 'bullet', text: 'approve an amount lower than the amount requested;' },
  { type: 'bullet', text: 'impose reasonable funding conditions or limits; and' },
  { type: 'bullet', text: 'reject or suspend an application.' },
  {
    type: 'paragraph',
    text: 'Fist’s verification does not guarantee that the buyer will pay the invoice.',
  },

  { type: 'sectionHeading', text: '6. Financing and payout' },
  {
    type: 'paragraph',
    text: 'After approval and subject to available liquidity, Fist may:',
  },
  { type: 'bullet', text: 'register the approved receivable through the platform;' },
  { type: 'bullet', text: 'create the applicable onchain verification record;' },
  { type: 'bullet', text: 'allocate capital from the financing pool;' },
  {
    type: 'bullet',
    text: 'transfer the approved financing amount to the Merchant’s confirmed payout wallet; and',
  },
  { type: 'bullet', text: 'record the funding and payout transactions onchain.' },
  {
    type: 'paragraph',
    text: 'The financing amount may be less than the invoice’s full face value.',
  },
  {
    type: 'paragraph',
    text: 'A confirmed transfer to the approved payout wallet constitutes evidence that the financing amount was disbursed.',
  },
  {
    type: 'paragraph',
    text: 'The Merchant is responsible for confirming that the payout wallet is accurate and under its authorized control.',
  },

  { type: 'sectionHeading', text: '7. Financing pool' },
  {
    type: 'paragraph',
    text: 'Funding may be provided by Fist, an affiliated financing vehicle or a permissioned financing pool.',
  },
  {
    type: 'paragraph',
    text: 'Approved liquidity providers contribute capital to the financing pool. Fist determines which receivables qualify and how available pool capital is allocated under its underwriting and risk policies.',
  },
  {
    type: 'paragraph',
    text: 'Unless expressly stated otherwise, an individual liquidity provider does not independently approve or select a specific Merchant application.',
  },

  { type: 'sectionHeading', text: '8. Invoice and document access' },
  {
    type: 'paragraph',
    text: 'The Merchant authorizes Fist to provide the invoice and applicable supporting information to approved liquidity providers and relevant:',
  },
  { type: 'bullet', text: 'auditors;' },
  { type: 'bullet', text: 'insurers;' },
  { type: 'bullet', text: 'financing partners;' },
  { type: 'bullet', text: 'legal and compliance advisers;' },
  { type: 'bullet', text: 'service providers;' },
  { type: 'bullet', text: 'program reviewers; and' },
  { type: 'bullet', text: 'regulators or public authorities where required by law.' },
  { type: 'paragraph', text: 'The information may be used for:' },
  { type: 'bullet', text: 'due diligence;' },
  { type: 'bullet', text: 'funding assessment;' },
  { type: 'bullet', text: 'verification;' },
  { type: 'bullet', text: 'risk management;' },
  { type: 'bullet', text: 'transaction monitoring;' },
  { type: 'bullet', text: 'audit;' },
  { type: 'bullet', text: 'collection; and' },
  { type: 'bullet', text: 'enforcement of the applicable financing terms.' },
  {
    type: 'paragraph',
    text: 'Fist may provide redacted copies where full disclosure is unnecessary. Confidential invoices are not required to be made publicly accessible merely because an invoice hash or receivable record is stored onchain.',
  },

  { type: 'sectionHeading', text: '9. Repayment' },
  {
    type: 'paragraph',
    text: 'The repayment amount, repayment date, payer and repayment instructions will be stated in the Transaction Schedule.',
  },
  { type: 'paragraph', text: 'The Merchant must:' },
  { type: 'bullet', text: 'provide the buyer with the approved repayment instructions;' },
  { type: 'bullet', text: 'cooperate with payment reconciliation;' },
  {
    type: 'bullet',
    text: 'promptly report any delayed, reduced or disputed payment;',
  },
  { type: 'bullet', text: 'notify Fist of any payment received directly; and' },
  {
    type: 'bullet',
    text: 'transfer any financed-receivable proceeds received directly in accordance with Fist’s instructions.',
  },
  {
    type: 'paragraph',
    text: 'The Merchant must not redirect, conceal or retain proceeds belonging to a financed receivable.',
  },

  { type: 'sectionHeading', text: '10. Recourse status' },
  {
    type: 'paragraph',
    text: 'The Transaction Schedule must identify the financing as recourse or non-recourse.',
  },
  { type: 'subheading', text: 'Recourse financing' },
  {
    type: 'paragraph',
    text: 'Where financing is recourse, the Merchant remains responsible for the repayment amount if the buyer does not pay as required.',
  },
  { type: 'subheading', text: 'Non-recourse financing' },
  {
    type: 'paragraph',
    text: 'Where financing is non-recourse, the Merchant will not be responsible solely because of the buyer’s genuine credit default.',
  },
  {
    type: 'paragraph',
    text: 'The Merchant remains responsible for losses arising from:',
  },
  { type: 'bullet', text: 'fraud;' },
  { type: 'bullet', text: 'forged or inaccurate documents;' },
  { type: 'bullet', text: 'duplicate financing;' },
  { type: 'bullet', text: 'undisclosed disputes or deductions;' },
  { type: 'bullet', text: 'failure to supply the relevant goods or services;' },
  { type: 'bullet', text: 'lack of ownership or authority;' },
  { type: 'bullet', text: 'redirected payments;' },
  { type: 'bullet', text: 'breach of the Merchant’s representations; or' },
  {
    type: 'bullet',
    text: 'another repurchase event stated in the Transaction Schedule.',
  },

  { type: 'sectionHeading', text: '11. Assignment or security' },
  {
    type: 'paragraph',
    text: 'Where the Transaction Schedule states that the receivable is assigned, the Merchant assigns the financed receivable and its proceeds to Fist or the financing vehicle identified in the Transaction Schedule.',
  },
  {
    type: 'paragraph',
    text: 'Where the Transaction Schedule states that the financing is secured, the Merchant grants the security interest described in the Transaction Schedule over the financed receivable and its proceeds.',
  },
  {
    type: 'paragraph',
    text: 'The Merchant agrees to provide reasonable assistance required to document or protect the applicable assignment or security interest.',
  },

  { type: 'sectionHeading', text: '12. Fees and late payment' },
  {
    type: 'paragraph',
    text: 'All applicable financing fees and charges must be displayed in the Transaction Schedule before acceptance.',
  },
  { type: 'paragraph', text: 'No undisclosed fee may be charged.' },
  {
    type: 'paragraph',
    text: 'Where a late-payment charge applies, the Transaction Schedule must state:',
  },
  { type: 'bullet', text: 'when the charge begins;' },
  { type: 'bullet', text: 'the amount to which it applies;' },
  { type: 'bullet', text: 'the rate or fixed amount;' },
  { type: 'bullet', text: 'how it is calculated;' },
  { type: 'bullet', text: 'whether it compounds;' },
  { type: 'bullet', text: 'any maximum amount; and' },
  { type: 'bullet', text: 'when it stops accruing.' },
  {
    type: 'paragraph',
    text: 'All financing and late-payment charges remain subject to applicable law.',
  },

  { type: 'sectionHeading', text: '13. Events of default' },
  { type: 'paragraph', text: 'An event of default occurs where:' },
  { type: 'bullet', text: 'a required repayment is not made when due;' },
  {
    type: 'bullet',
    text: 'the Merchant provides materially false or misleading information;',
  },
  {
    type: 'bullet',
    text: 'an invoice is forged, duplicated, previously paid or previously financed;',
  },
  { type: 'bullet', text: 'the Merchant does not own or control the receivable;' },
  { type: 'bullet', text: 'the Merchant redirects or retains invoice proceeds;' },
  {
    type: 'bullet',
    text: 'the underlying transaction is cancelled or disputed without prompt disclosure;',
  },
  {
    type: 'bullet',
    text: 'the Merchant materially breaches this Agreement or the Transaction Schedule;',
  },
  { type: 'bullet', text: 'the Merchant becomes insolvent or ceases business;' },
  { type: 'bullet', text: 'the transaction becomes unlawful; or' },
  { type: 'bullet', text: 'the Merchant refuses a reasonable verification request.' },

  { type: 'sectionHeading', text: '14. Remedies following default' },
  {
    type: 'paragraph',
    text: 'Following an event of default, Fist may, subject to applicable law:',
  },
  { type: 'bullet', text: 'suspend the Merchant’s platform access;' },
  { type: 'bullet', text: 'stop pending financing;' },
  { type: 'bullet', text: 'reject future applications;' },
  { type: 'bullet', text: 'demand payment of amounts due;' },
  {
    type: 'bullet',
    text: 'require repurchase of the financed receivable where applicable;',
  },
  {
    type: 'bullet',
    text: 'exercise agreed rights over the receivable and its proceeds;',
  },
  { type: 'bullet', text: 'apply an agreed right of set-off;' },
  { type: 'bullet', text: 'notify affected financing participants;' },
  { type: 'bullet', text: 'preserve relevant evidence; and' },
  { type: 'bullet', text: 'pursue available collection or legal remedies.' },
  {
    type: 'paragraph',
    text: 'Fist will not take control of assets unrelated to the relevant financing unless it has a valid legal and contractual right to do so.',
  },

  { type: 'sectionHeading', text: '15. Smart-contract authorization' },
  {
    type: 'paragraph',
    text: 'The Merchant authorizes Fist’s smart contracts to process approved actions associated with the receivable, including:',
  },
  { type: 'bullet', text: 'verification records;' },
  { type: 'bullet', text: 'document-hash records;' },
  { type: 'bullet', text: 'receivable creation;' },
  { type: 'bullet', text: 'funding allocation;' },
  { type: 'bullet', text: 'merchant payout;' },
  { type: 'bullet', text: 'repayment recording;' },
  { type: 'bullet', text: 'investor and fee distributions;' },
  { type: 'bullet', text: 'status changes; and' },
  { type: 'bullet', text: 'permitted emergency actions.' },
  {
    type: 'paragraph',
    text: 'The Merchant understands that confirmed blockchain transactions may be irreversible and publicly visible.',
  },
  {
    type: 'paragraph',
    text: 'Smart-contract processing supports the transaction but does not replace the Parties’ legal obligations under this Agreement.',
  },

  { type: 'sectionHeading', text: '16. Platform and wallet responsibilities' },
  { type: 'paragraph', text: 'The Merchant is responsible for:' },
  { type: 'bullet', text: 'maintaining control of its account and wallet;' },
  { type: 'bullet', text: 'protecting its wallet credentials;' },
  { type: 'bullet', text: 'confirming wallet addresses before submission;' },
  { type: 'bullet', text: 'notifying Fist of suspected unauthorized access; and' },
  { type: 'bullet', text: 'maintaining accurate contact and business information.' },
  {
    type: 'paragraph',
    text: 'Fist is not responsible for losses caused by an incorrect wallet address supplied or confirmed by the Merchant.',
  },
  {
    type: 'paragraph',
    text: 'Fist does not guarantee uninterrupted platform availability or that blockchain and third-party services will always operate without delay or error.',
  },

  { type: 'sectionHeading', text: '17. Records' },
  {
    type: 'paragraph',
    text: 'The Merchant agrees that the following may be retained and used as evidence of the transaction:',
  },
  { type: 'bullet', text: 'this Agreement and its version;' },
  { type: 'bullet', text: 'the accepted Transaction Schedule;' },
  { type: 'bullet', text: 'checkbox confirmations;' },
  { type: 'bullet', text: 'wallet signatures;' },
  { type: 'bullet', text: 'recovered signer address;' },
  { type: 'bullet', text: 'acceptance timestamps;' },
  { type: 'bullet', text: 'submitted invoices and supporting documents;' },
  { type: 'bullet', text: 'document and agreement hashes;' },
  { type: 'bullet', text: 'receivable IDs;' },
  { type: 'bullet', text: 'platform records;' },
  { type: 'bullet', text: 'smart-contract events;' },
  { type: 'bullet', text: 'blockchain transactions;' },
  { type: 'bullet', text: 'payment records; and' },
  { type: 'bullet', text: 'communications relating to the receivable.' },

  { type: 'sectionHeading', text: '18. Confidentiality and privacy' },
  {
    type: 'paragraph',
    text: 'Each Party must protect confidential information received from the other Party and use it only for the relevant financing, verification, compliance, audit, operational or enforcement purpose.',
  },
  {
    type: 'paragraph',
    text: 'Fist may process and disclose information as authorized by this Agreement, its applicable privacy notice and applicable law.',
  },
  {
    type: 'paragraph',
    text: 'The Merchant confirms that it has authority to submit any personal or confidential information provided through the platform.',
  },

  { type: 'sectionHeading', text: '19. Amendments' },
  {
    type: 'paragraph',
    text: 'Fist may update this Agreement for future transactions.',
  },
  {
    type: 'paragraph',
    text: 'An update will not change a previously accepted Transaction Schedule unless:',
  },
  { type: 'bullet', text: 'the Merchant separately accepts the change; or' },
  { type: 'bullet', text: 'the change is required by law.' },
  {
    type: 'paragraph',
    text: 'Any material change to the following requires fresh electronic acceptance:',
  },
  { type: 'bullet', text: 'financing amount;' },
  { type: 'bullet', text: 'repayment amount;' },
  { type: 'bullet', text: 'due date;' },
  { type: 'bullet', text: 'fees;' },
  { type: 'bullet', text: 'late-payment charge;' },
  { type: 'bullet', text: 'recourse status;' },
  { type: 'bullet', text: 'payout wallet;' },
  { type: 'bullet', text: 'contracting entity; or' },
  { type: 'bullet', text: 'governing law.' },

  { type: 'sectionHeading', text: '20. Notices' },
  { type: 'paragraph', text: 'Notices may be delivered through:' },
  { type: 'bullet', text: 'the Fist platform;' },
  { type: 'bullet', text: 'the Merchant’s registered email;' },
  { type: 'bullet', text: 'the Merchant’s registered business address; or' },
  { type: 'bullet', text: 'another communication method accepted by the Parties.' },
  {
    type: 'paragraph',
    text: 'The Merchant must keep its contact information current.',
  },

  { type: 'sectionHeading', text: '21. Governing law and disputes' },
  {
    type: 'paragraph',
    text: 'This Agreement, each Transaction Schedule and each related financing transaction are governed by the laws of the Province of Saskatchewan and the federal laws of Canada applicable in Saskatchewan.',
  },
  {
    type: 'paragraph',
    text: 'The Parties will first attempt to resolve a dispute through good-faith negotiation.',
  },
  {
    type: 'paragraph',
    text: 'A Party raising a dispute must provide written notice describing the issue. The Parties will have 14 days after that notice to attempt resolution.',
  },
  {
    type: 'paragraph',
    text: 'If the dispute is not resolved, the Parties submit to the jurisdiction of the courts of the Province of Saskatchewan, unless mandatory applicable law requires another forum.',
  },

  { type: 'sectionHeading', text: '22. General provisions' },
  {
    type: 'paragraph',
    text: 'This Agreement and the applicable Transaction Schedule constitute the agreement for the relevant financed receivable.',
  },
  {
    type: 'paragraph',
    text: 'The Merchant may not transfer its obligations under this Agreement without Fist’s written approval.',
  },
  {
    type: 'paragraph',
    text: 'Fist may transfer its rights to an affiliate, financing vehicle or successor where this does not increase the Merchant’s accepted payment obligations.',
  },
  {
    type: 'paragraph',
    text: 'If any provision is found unenforceable, the remaining provisions will continue to apply.',
  },
  {
    type: 'paragraph',
    text: 'A failure or delay in exercising a right does not waive that right.',
  },
  {
    type: 'paragraph',
    text: 'Electronic copies and electronic records may be used in place of paper copies where legally permitted.',
  },
]
