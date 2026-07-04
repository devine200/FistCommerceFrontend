import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'

import { toUserFacingError } from '@/api/client'
import { fetchAdminReceivableDetail, type AdminReceivableDetailResult } from '@/api/adminLoan'
import { AdminPageFrame, AdminPanel, AdminStatusPill } from '@/components/admin/primitives'
import { DashboardRequestFeedbackLayer } from '@/components/dashboard/shared/DashboardRequestFeedbackLayer'
import { useAppSelector } from '@/store/hooks'

const AdminReceivableDetailPage = () => {
  const navigate = useNavigate()
  const { receivableId } = useParams<{ receivableId: string }>()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const sessionKind = useAppSelector((s) => s.auth.sessionKind)

  const [detail, setDetail] = useState<AdminReceivableDetailResult | null>(null)
  const [phase, setPhase] = useState<'loading' | 'failed' | 'idle'>('loading')
  const [error, setError] = useState<string | null>(null)

  const loadDetail = useCallback(() => {
    if (!receivableId?.trim() || !accessToken?.trim() || sessionKind !== 'admin') return
    setPhase('loading')
    setError(null)
    void fetchAdminReceivableDetail(accessToken, receivableId)
      .then((data) => {
        setDetail(data)
        setPhase('idle')
      })
      .catch((e) => {
        setDetail(null)
        setError(toUserFacingError(e, 'Could not load receivable detail.'))
        setPhase('failed')
      })
  }, [receivableId, accessToken, sessionKind])

  useEffect(() => {
    loadDetail()
  }, [loadDetail])

  if (!receivableId) {
    return <Navigate to="/dashboard/admin/receivables" replace />
  }

  return (
    <AdminPageFrame>
      <DashboardRequestFeedbackLayer
        phase={phase}
        loadingTitle="Loading receivable details"
        loadingDescription="Fetching receivable and document information…"
        errorTitle="Unable to load receivable"
        errorDescription={error ?? undefined}
        onDismiss={() => navigate('/dashboard/admin/receivables')}
        onRetry={loadDetail}
        cancelLabel="Back to receivables"
      />

      {detail ? (
        <>
          <button
            type="button"
            onClick={() => navigate('/dashboard/admin/receivables')}
            className="text-[#195EBC] text-[14px] font-medium hover:underline w-fit"
          >
            ← Back to receivables
          </button>

          <AdminPanel>
            <div className="px-5 py-5 flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-[#0B1220] text-[20px] font-bold">{detail.title}</h2>
                  <p className="text-[#6B7488] text-[13px] mt-1 font-mono">{detail.loanId}</p>
                </div>
                <AdminStatusPill variant="underReview">{detail.status.replace('_', ' ')}</AdminStatusPill>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
                <div>
                  <p className="text-[#6B7488] text-[12px]">Merchant</p>
                  <p className="text-[#0B1220] font-medium mt-1">{detail.merchant.displayName}</p>
                  <p className="text-[#6B7488] text-[13px] font-mono mt-1">{detail.merchant.wallet}</p>
                </div>
                <div>
                  <p className="text-[#6B7488] text-[12px]">Loan amount</p>
                  <p className="text-[#0B1220] font-semibold mt-1">{detail.loanAmount}</p>
                  <p className="text-[#6B7488] text-[13px] mt-1">
                    Period: {detail.periodDays != null ? `${detail.periodDays} days` : '—'}
                  </p>
                </div>
              </div>

              {detail.documents.length > 0 ? (
                <div>
                  <p className="text-[#0B1220] font-semibold text-[15px] mb-2">Documents</p>
                  <ul className="space-y-2">
                    {detail.documents.map((doc) => (
                      <li key={doc.url}>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#195EBC] text-[14px] hover:underline"
                        >
                          {doc.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to={`/dashboard/admin/loan-monitoring/${detail.loanId}`}
                  className="h-10 px-5 inline-flex items-center rounded-[4px] bg-[#195EBC] text-white text-[14px] font-semibold"
                >
                  Open in loan monitoring
                </Link>
              </div>
            </div>
          </AdminPanel>
        </>
      ) : null}
    </AdminPageFrame>
  )
}

export default AdminReceivableDetailPage
