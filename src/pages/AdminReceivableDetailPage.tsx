import { useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import {
  ADMIN_RECEIVABLE_RETURN_STATE_KEY,
  resolveAdminReceivableBackTarget,
  RETURN_TO_QUERY_KEY,
} from '@/components/admin/adminReceivableReturnNav'
import type { LifecycleStepVariant } from '@/components/dashboard/merchant/receivables/receivableDetailTypes'
import { getReceivableDetailById } from '@/components/dashboard/merchant/receivables/receivableDetailConfig'
import { isReceivableVerified, lifecycleCompletedCount } from '@/types/receivables'

const lifecycleBarClass = (variant: LifecycleStepVariant): string => {
  if (variant === 'purple') return 'bg-[#9333EA]'
  if (variant === 'green') return 'bg-[#16A34A]'
  if (variant === 'sky') return 'bg-[#38BDF8]'
  if (variant === 'neutral') return 'bg-[#1F2937]'
  return 'bg-[#195EBC]'
}

const AdminReceivableDetailPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { receivableId } = useParams<{ receivableId: string }>()
  const detail = receivableId ? getReceivableDetailById(receivableId) : null
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState<string>('')

  const backHref = resolveAdminReceivableBackTarget(
    (location.state as Record<string, unknown> | null)?.[ADMIN_RECEIVABLE_RETURN_STATE_KEY],
    searchParams.get(RETURN_TO_QUERY_KEY),
  )

  if (!detail || !receivableId) {
    return <Navigate to="/dashboard/admin/receivables" replace />
  }

  const { row, merchantId, basicInfo, documentName, lifecycle, repaymentRows, maturityBanner } = detail
  const merchantProfileHref = `/dashboard/admin/merchants/${merchantId}`
  const stage = detail.stage
  const verified = isReceivableVerified(stage)
  const completedCount = lifecycleCompletedCount(stage)

  const rejectReasons = useMemo(
    () => [
      {
        id: 'incomplete',
        title: 'Incomplete or Missing Documents',
        description: 'Some required documents (invoice, delivery proof, or PO) were not provided or are unclear.',
      },
      {
        id: 'mismatch',
        title: 'Invoice Details Mismatch',
        description: 'Information across documents (amount, dates, buyer name) does not match.',
      },
      {
        id: 'duplicate',
        title: 'Duplicate or Previously Financed Invoice',
        description: 'This receivable appears to have already been submitted or financed elsewhere.',
      },
      {
        id: 'criteria',
        title: 'Does Not Meet Funding Criteria',
        description: 'The receivable does not meet platform rules (amount too low/high, due date outside allowed range, etc.).',
      },
    ],
    [],
  )

  return (
    <div className="w-full max-w-[1280px] mx-auto pb-10 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(backHref)}
          aria-label="Go back"
          className="h-10 w-10 rounded-[8px] flex items-center justify-center text-[#4D5D80] hover:bg-black/5"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-[#0B1220] font-bold text-[18px] sm:text-[20px] leading-tight truncate">{row.receivableName}</h1>
      </div>

      <section className="rounded-[12px] border border-[#E6E8EC] bg-white p-6 lg:p-8 shadow-sm">
        <h2 className="text-[#0B1220] font-bold text-[18px] mb-6">Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          {basicInfo.map((field) => {
            const linkToMerchant =
              field.label === 'Full Name' || field.label === 'Business Name' ? merchantProfileHref : null
            return (
              <div key={field.label}>
                <p className="text-[#4D5D80] text-[14px] font-medium mb-2">{field.label}</p>
                <div className="rounded-[6px] border border-[#D0D7E3] bg-[#FAFBFC] px-4 py-3 min-h-[48px] flex items-center">
                  {linkToMerchant ? (
                    <Link
                      to={linkToMerchant}
                      className="text-[#195EBC] text-[15px] font-medium hover:underline underline-offset-2"
                    >
                      {field.value}
                    </Link>
                  ) : (
                    <span className="text-[#195EBC] text-[15px] font-medium">{field.value}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-[12px] border border-[#E6E8EC] bg-white p-6 lg:p-8 shadow-sm">
        <h2 className="text-[#0B1220] font-bold text-[18px] mb-5">Uploaded Documents</h2>
        <div className="rounded-[6px] border border-[#D0D7E3] bg-[#FAFBFC] px-4 py-3 min-h-[56px] flex items-center">
          <button
            type="button"
            className="inline-flex items-center gap-3 text-left text-[#195EBC] text-[15px] font-medium hover:opacity-90"
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] border border-[#CFE0FF] bg-[#E8EFFB]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#195EBC]" aria-hidden>
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                />
                <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="underline underline-offset-2 decoration-[#195EBC]">{documentName}</span>
          </button>
        </div>

        {!verified ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            <button
              type="button"
              onClick={() => setRejectOpen(true)}
              className="w-full h-[44px] rounded-[4px] bg-[#DC2626] text-white text-[14px] font-semibold hover:bg-[#b91c1c] transition-colors"
            >
              Reject
            </button>
            <button
              type="button"
              className="w-full h-[44px] rounded-[4px] bg-[#195EBC] text-white text-[14px] font-semibold hover:bg-[#154a9a] transition-colors"
              onClick={() => navigate(`/dashboard/admin/receivables/${receivableId}/approved`)}
            >
              Approve
            </button>
          </div>
        ) : null}
      </section>

      {rejectOpen ? (
        <div className="fixed inset-0 z-80 flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-label="Reject receivable funding">
          <div className="absolute inset-0 bg-black/35" onClick={() => setRejectOpen(false)} aria-hidden />
          <div className="relative w-full max-w-[920px] rounded-[10px] bg-white border border-[#E6E8EC] shadow-xl overflow-hidden">
            <div className="px-8 py-6 border-b border-[#EDF0F4] flex items-center gap-4">
              <button
                type="button"
                onClick={() => setRejectOpen(false)}
                className="h-10 w-10 rounded-[8px] flex items-center justify-center text-[#4D5D80] hover:bg-black/5"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <h3 className="text-[#0B1220] font-bold text-[18px] leading-tight">Reject Receivable Funding</h3>
            </div>

            <div className="px-8 py-8">
              <p className="text-[#6B7488] text-[14px] mb-6">Select a reason for rejecting this receivable funding</p>

              <div className="rounded-[8px] border border-[#EEF0F4] overflow-hidden">
                {rejectReasons.map((r, idx) => {
                  const selected = rejectReason === r.id
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRejectReason(r.id)}
                      className={[
                        'w-full px-6 py-5 flex items-start justify-between gap-6 text-left bg-white hover:bg-[#F9FAFB] transition-colors',
                        idx > 0 ? 'border-t border-[#EEF0F4]' : '',
                      ].join(' ')}
                    >
                      <div className="min-w-0">
                        <p className="text-[#0B1220] text-[15px] font-semibold leading-snug">{r.title}</p>
                        <p className="text-[#6B7488] text-[14px] leading-relaxed mt-2">{r.description}</p>
                      </div>
                      <span
                        className={[
                          'h-6 w-6 rounded-[4px] border flex items-center justify-center shrink-0 mt-0.5',
                          selected ? 'bg-[#195EBC] border-[#195EBC]' : 'bg-white border-[#C9D1DE]',
                        ].join(' ')}
                        aria-hidden
                      >
                        {selected ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        ) : null}
                      </span>
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => setRejectOpen(false)}
                className="mt-8 w-full h-[50px] rounded-[4px] bg-[#DC2626] text-white text-[15px] font-semibold hover:bg-[#b91c1c] transition-colors disabled:opacity-50 disabled:hover:bg-[#DC2626]"
                disabled={!rejectReason}
              >
                Reject Withdrawal
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-[12px] border border-[#E6E8EC] bg-white p-6 lg:p-8 shadow-sm">
          <h2 className="text-[#0B1220] font-bold text-[18px] mb-6">Receivable Lifecycle</h2>
          <ol className="m-0 p-0 list-none flex flex-col gap-8">
            {lifecycle.map((step, i) => {
              const completed = i < completedCount
              return (
                <li key={`${step.label}-${i}`} className="flex gap-4 min-w-0">
                  <div
                    className={[
                      'w-1.5 shrink-0 rounded-full self-stretch',
                      completed ? lifecycleBarClass(step.variant) : 'bg-[#D0D7E3]',
                    ].join(' ')}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className={['font-bold text-[15px] leading-snug', completed ? 'text-[#0B1220]' : 'text-[#8B92A3]'].join(' ')}>
                      {step.label}
                    </p>
                    <p className={['text-[14px] leading-relaxed mt-2', completed ? 'text-[#6B7488]' : 'text-[#B0B7C4]'].join(' ')}>
                      {step.description}
                    </p>
                    <p className={['text-[13px] mt-3', completed ? 'text-[#8B92A3]' : 'text-[#C2C8D4]'].join(' ')}>
                      {step.date}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>

        <section className="rounded-[12px] border border-[#E6E8EC] bg-white p-6 lg:p-8 shadow-sm self-start">
          <h2 className="text-[#0B1220] font-bold text-[18px] mb-5">Repayment Details</h2>
          <ul className="flex flex-col gap-4 m-0 p-0 list-none">
            {repaymentRows.map((r) => (
              <li
                key={r.label}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 border-b border-[#F0F2F6] pb-4 last:border-0 last:pb-0"
              >
                <span className="text-[#6B7488] text-[14px] font-medium">{r.label}</span>
                <span className="text-[#0B1220] font-medium text-[14px] sm:text-right">{r.value}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-[8px] bg-[#828282] px-4 py-3 text-center">
            <p className="text-white text-[14px] font-medium">{maturityBanner}</p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminReceivableDetailPage

