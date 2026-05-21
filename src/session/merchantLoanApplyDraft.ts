/** In-memory draft for merchant apply-loan (survives navigation to failure page; cleared on success/cancel). */

export type MerchantLoanApplyRiskAcknowledgements = {
  repaymentTerms: boolean
  latePaymentPenalties: boolean
  smartContractEnforcement: boolean
}

export type MerchantLoanApplyUploadedDocMeta = {
  name: string
  size: string
  uploadedAtLabel: string
}

export type MerchantLoanApplyDraft = {
  poolSlug: string
  amount: string
  receiveableName: string
  riskTierId: string
  riskAcknowledgements: MerchantLoanApplyRiskAcknowledgements
  selectedDocument: File | null
  uploadedDocs: MerchantLoanApplyUploadedDocMeta[]
}

let draft: MerchantLoanApplyDraft | null = null

export function saveMerchantLoanApplyDraft(next: MerchantLoanApplyDraft): void {
  draft = next
}

export function getMerchantLoanApplyDraft(): MerchantLoanApplyDraft | null {
  return draft
}

export function clearMerchantLoanApplyDraft(): void {
  draft = null
}
