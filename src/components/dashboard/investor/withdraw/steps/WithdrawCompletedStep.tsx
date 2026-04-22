import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import kycPendingIllustration from '@/assets/kyc-inprogress.png'
import type { WithdrawalCompletedMetric } from '@/components/dashboard/investor/withdraw/types'

interface WithdrawCompletedStepProps {
  /** Formatted USD string (includes `$` and grouping). */
  amountDisplay: string
  poolName: string
  metrics: WithdrawalCompletedMetric[]
  backToDashboardTo: string
}

const WithdrawCompletedStep = ({
  amountDisplay,
  poolName,
  metrics,
  backToDashboardTo,
}: WithdrawCompletedStepProps) => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const withdrawalRef = useMemo(() => {
    const digits = amountDisplay.replace(/\D/g, '')
    const tail = digits.slice(-6).padStart(6, '0')
    return `FW-${tail}`
  }, [amountDisplay])

  const detailRows = useMemo(
    () =>
      [
        ['Transaction ID', '—'],
        ['Date / Time', new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(new Date())],
        ['Requested Type', 'Wallet Transfer'],
        ['Withdraw Amount', amountDisplay],
        ['Fees Deducted', '$0.00'],
        ['Net Received', amountDisplay],
        ['Pool', poolName],
        ['Network', 'Arbitrum One'],
      ] as const,
    [amountDisplay, poolName],
  )

  return (
    <>
      <section className="rounded-[8px] border border-[#E6E8EC] bg-white px-6 py-10 sm:px-8 sm:py-12 flex flex-col items-center text-center">
        <img src={kycPendingIllustration} alt="" className="h-20 w-20 object-contain" draggable={false} />
        <h2 className="mt-4 text-[#0B1220] font-bold text-[34px] leading-tight">Withdrawal Initiated!</h2>
        <p className="mt-2 max-w-[560px] text-[#6B7488] text-[15px] leading-relaxed">
          Your withdrawal of {amountDisplay} USDC from {poolName} has been submitted. Expected processing time: 24-48
          hrs.
        </p>

        <div className="mt-6 rounded-[6px] border border-[#E6E8EC] bg-white overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[#E6E8EC]">
            {metrics.map((metric) => (
              <div key={metric.label} className="px-4 py-3 min-w-[120px]">
                <p className="text-[#8B92A3] text-[12px]">{metric.label}</p>
                <p className="text-[#0B1220] text-[15px] font-semibold mt-1">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[8px] border border-[#E6E8EC] bg-white p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to={backToDashboardTo}
            className="h-[46px] rounded-[4px] bg-[#195EBC] text-white text-[15px] font-medium inline-flex items-center justify-center hover:bg-[#154a9a] transition-colors"
          >
            Back to Dashboard
          </Link>
          <button
            type="button"
            onClick={() => setIsInfoModalOpen(true)}
            className="h-[46px] rounded-[4px] bg-[#EEF2F6] text-[#195EBC] text-[15px] font-medium inline-flex items-center justify-center hover:bg-[#E5ECF4] transition-colors"
          >
            View Withdrawal Information
          </button>
        </div>
      </section>

      {isInfoModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close withdrawal information modal overlay"
            onClick={() => setIsInfoModalOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
          />

          <section className="relative z-10 w-full max-w-[430px] rounded-[12px] border border-[#E6E8EC] bg-white p-6 shadow-xl">
            <h3 className="text-[#0B1220] text-[17px] font-semibold">Withdrawal Status &amp; Transaction Details</h3>

            <div className="mt-4 rounded-[8px] border border-[#FDE2E2] bg-[#FFF5F5] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[#DC2626] text-[15px] font-semibold">- {amountDisplay}</p>
                  <p className="text-[#6B7488] text-[12px] mt-0.5">{withdrawalRef}</p>
                </div>
                <span className="inline-flex items-center rounded-full border border-[#FCD34D] bg-[#FFFBEB] px-2.5 py-1 text-[11px] font-semibold text-[#B45309]">
                  Pending
                </span>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-[#0B1220] text-[14px] font-semibold mb-2.5">Details</p>
              <div className="space-y-2">
                {detailRows.map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-3">
                    <span className="text-[#8B92A3] text-[12px]">{label}</span>
                    <span className="text-[#0B1220] text-[12px] font-medium text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="mt-6 h-[44px] w-full rounded-[6px] bg-[#195EBC] text-white text-[14px] font-medium hover:bg-[#154a9a] transition-colors"
            >
              Report an Issue
            </button>
          </section>
        </div>
      ) : null}
    </>
  )
}

export default WithdrawCompletedStep
