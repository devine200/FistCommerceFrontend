import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'

import cloudUploadIcon from '@/assets/cloud-upload.png'
import documentCheckedIcon from '../../../../.cursor/projects/Users-stanleyezeajughi-Documents-FistCommerceFrontend/assets/icon-b3aa097d-a4d4-4432-abe8-57b3c9fccd4e.png'
import documentDownloadIcon from '../../../../.cursor/projects/Users-stanleyezeajughi-Documents-FistCommerceFrontend/assets/download-9418e7b0-b47d-4e6c-a213-c7170bad6d48.png'
import documentBinIcon from '../../../../.cursor/projects/Users-stanleyezeajughi-Documents-FistCommerceFrontend/assets/bin-714a4e8d-562a-4a49-8290-7c66c20111a4.png'

type RiskAcknowledgementKey = 'repaymentTerms' | 'latePaymentPenalties' | 'smartContractEnforcement'

type UploadedDoc = {
  name: string
  size: string
}

const MerchantApplyLoanPage = () => {
  const { poolSlug } = useParams<{ poolSlug: string }>()
  const navigate = useNavigate()

  const [amount, setAmount] = useState('')
  const [loanDuration, setLoanDuration] = useState('')
  const [repaymentType, setRepaymentType] = useState('')
  const [receiveableName, setReceiveableName] = useState('')
  const [loanInterest, setLoanInterest] = useState('')
  const [repaymentAmount, setRepaymentAmount] = useState('')

  const [riskAcknowledgements, setRiskAcknowledgements] = useState<Record<RiskAcknowledgementKey, boolean>>({
    repaymentTerms: false,
    latePaymentPenalties: false,
    smartContractEnforcement: false,
  })

  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([{ name: 'document.pdf', size: '12mb' }])

  const topBarBreadcrumbs: DashboardBreadcrumbItem[] = useMemo(
    () => [
      { label: 'Explore Lending Pools', to: '/dashboard/merchant/overview' },
      { label: 'Lending Pool' },
      { label: 'Apply for Loan' },
    ],
    []
  )

  if (!poolSlug) {
    return <Navigate to="/dashboard/merchant/overview" replace />
  }

  const allChecked = Object.values(riskAcknowledgements).every(Boolean)

  const downloadDocument = (doc: UploadedDoc) => {
    // Demo download (no real uploaded file yet).
    const blob = new Blob([''], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = doc.name
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout dashboardBasePath="/dashboard/merchant" topBarBreadcrumbs={topBarBreadcrumbs} topBarWalletDisplay="0x7A3F...92C1">
      <div className="max-w-[860px] w-full mx-auto pt-4 sm:pt-6 lg:pt-8 pb-6 flex flex-col gap-4 sm:gap-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-[#6B7488] text-[13px] inline-flex items-center gap-2 hover:text-[#195EBC]"
          >
            <span aria-hidden>←</span>
            Back
          </button>
        </div>

        <div className="pt-1">
          <h1 className="text-[#0B1220] font-bold text-[18px] sm:text-[20px] leading-tight">Loan Configuration</h1>
        </div>

        <section className="rounded-[10px] border border-[#DFE2E8] bg-white p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <label className="block">
              <span className="text-[#6B7488] text-[12px]">Loan Amount</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter an Amount"
                className="mt-2 w-full border border-[#E6E8EC] rounded-[6px] px-4 py-2.5 text-[14px] outline-none focus:border-[#195EBC]"
              />
            </label>

            <label className="block">
              <span className="text-[#6B7488] text-[12px]">Loan Duration</span>
              <select
                value={loanDuration}
                onChange={(e) => setLoanDuration(e.target.value)}
                className="mt-2 w-full border border-[#E6E8EC] rounded-[6px] px-4 py-2.5 text-[14px] outline-none focus:border-[#195EBC]"
              >
                <option value="">Select the duration of your loan</option>
                <option value="30-60">30-60 days</option>
                <option value="60-90">60-90 days</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[#6B7488] text-[12px]">Repayment Type</span>
              <input
                value={repaymentType}
                onChange={(e) => setRepaymentType(e.target.value)}
                placeholder="How would you like to pay back?"
                className="mt-2 w-full border border-[#E6E8EC] rounded-[6px] px-4 py-2.5 text-[14px] outline-none focus:border-[#195EBC]"
              />
            </label>

            <label className="block">
              <span className="text-[#6B7488] text-[12px]">Receivable Name</span>
              <input
                value={receiveableName}
                onChange={(e) => setReceiveableName(e.target.value)}
                placeholder="Name Your Receivable"
                className="mt-2 w-full border border-[#E6E8EC] rounded-[6px] px-4 py-2.5 text-[14px] outline-none focus:border-[#195EBC]"
              />
            </label>

            <label className="block">
              <span className="text-[#6B7488] text-[12px]">Loan Interest</span>
              <input
                value={loanInterest}
                onChange={(e) => setLoanInterest(e.target.value)}
                placeholder="Calculating..."
                className="mt-2 w-full border border-[#E6E8EC] rounded-[6px] px-4 py-2.5 text-[14px] outline-none focus:border-[#195EBC]"
              />
            </label>

            <label className="block">
              <span className="text-[#6B7488] text-[12px]">Repayment Amount</span>
              <input
                value={repaymentAmount}
                onChange={(e) => setRepaymentAmount(e.target.value)}
                placeholder="Calculating..."
                className="mt-2 w-full border border-[#E6E8EC] rounded-[6px] px-4 py-2.5 text-[14px] outline-none focus:border-[#195EBC]"
              />
            </label>
          </div>
        </section>

        <section className="rounded-[10px] border border-[#DFE2E8] bg-white p-4 sm:p-6">
          <h2 className="text-[#6B7488] text-[14px] font-semibold">Files Upload</h2>
          <p className="text-[#8B92A3] text-[12px] mt-2">
            Upload Invoice/Receivable Proof, Supporting Contract &amp; Agreement, Purchase Order, Monthly Revenue.
          </p>

          <div className="mt-4 rounded-[8px] border border-dashed border-[#D5DAE2] bg-[#FAFBFD] p-5 sm:p-8 text-center">
            <div className="mx-auto h-[44px] w-[44px] rounded-full bg-white flex items-center justify-center border border-[#E6E8EC]">
              <img src={cloudUploadIcon} alt="upload file" className="h-[22px] w-[22px] object-contain" draggable={false} />
            </div>

            <div className="mt-3 text-[#6B7488] text-[14px] font-medium">Click to upload or drag and drop</div>
            <div className="mt-2 text-[#8B92A3] text-[11px]">SVG, PNG, JPG or GIF (max 800x400px)</div>

            <div className="mt-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#EDF0F4]" />
              <div className="text-[#8B92A3] text-[11px] font-medium">OR</div>
              <div className="h-px flex-1 bg-[#EDF0F4]" />
            </div>

            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center px-6 py-2.5 bg-[#195EBC] text-white text-[14px] rounded-[6px] font-medium"
            >
              Browse Files
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {uploadedDocs.map((doc) => (
              <div key={doc.name} className="flex items-center justify-between border border-[#EDF0F4] rounded-[6px] px-4 py-3 bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-7 w-7 rounded-full bg-white flex items-center justify-center" aria-hidden>
                    <img src={documentCheckedIcon} alt="" className="h-7 w-7 object-contain" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#0B1220] text-[12px] font-semibold truncate">{doc.name}</p>
                    <p className="text-[#8B92A3] text-[11px] mt-0.5">Last updated: 11 Sep 2023 • 12:24pm • {doc.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <button
                    type="button"
                    className="h-5 w-5 flex items-center justify-center"
                    aria-label={`Download ${doc.name}`}
                    onClick={() => downloadDocument(doc)}
                  >
                    <img src={documentDownloadIcon} alt="" className="h-5 w-5 object-contain" />
                  </button>
                  <button
                    type="button"
                    className="h-5 w-5 flex items-center justify-center"
                    aria-label={`Remove ${doc.name}`}
                    onClick={() => setUploadedDocs((prev) => prev.filter((d) => d.name !== doc.name))}
                  >
                    <img src={documentBinIcon} alt="" className="h-5 w-5 object-contain" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[10px] border border-[#DFE2E8] bg-white p-4 sm:p-6">
          <h2 className="text-[#6B7488] text-[14px] font-semibold">Risk Acknowledgement</h2>

          <div className="mt-4 flex flex-col gap-3">
            <label className="flex items-center justify-between gap-4 border border-[#EDF0F4] rounded-[6px] px-4 py-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={riskAcknowledgements.repaymentTerms}
                  onChange={(e) => setRiskAcknowledgements((prev) => ({ ...prev, repaymentTerms: e.target.checked }))}
                />
                <span className="text-[#0B1220] text-[13px]">
                  I understand <span className="text-[#195EBC] font-semibold">repayment terms</span> ↗
                </span>
              </div>
            </label>

            <label className="flex items-center justify-between gap-4 border border-[#EDF0F4] rounded-[6px] px-4 py-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={riskAcknowledgements.latePaymentPenalties}
                  onChange={(e) => setRiskAcknowledgements((prev) => ({ ...prev, latePaymentPenalties: e.target.checked }))}
                />
                <span className="text-[#0B1220] text-[13px]">
                  I understand <span className="text-[#195EBC] font-semibold">late payment penalties</span> ↗
                </span>
              </div>
            </label>

            <label className="flex items-center justify-between gap-4 border border-[#EDF0F4] rounded-[6px] px-4 py-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={riskAcknowledgements.smartContractEnforcement}
                  onChange={(e) => setRiskAcknowledgements((prev) => ({ ...prev, smartContractEnforcement: e.target.checked }))}
                />
                <span className="text-[#0B1220] text-[13px]">
                  I agree to <span className="text-[#195EBC] font-semibold">smart contract enforcement</span> ↗
                </span>
              </div>
            </label>
          </div>

          <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 pb-4 sm:pb-6 pt-4 bg-white border-t border-[#EDF0F4] lg:static lg:border-t-0 lg:px-0 lg:pb-0 lg:pt-6 lg:mx-0">
            <button
              type="button"
              disabled={!allChecked}
              className={`w-full rounded-[6px] bg-[#1B66CF] text-white text-[15px] sm:text-[16px] font-semibold py-3 transition-colors ${
                allChecked ? 'opacity-100 hover:bg-[#154a9a]' : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => navigate(`/dashboard/merchant/lending-pool/${poolSlug}/apply-loan/success`)}
            >
              Submit Receivable Funding Application →
            </button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default MerchantApplyLoanPage

