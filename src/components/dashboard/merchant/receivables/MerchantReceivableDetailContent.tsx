import { useNavigate } from 'react-router-dom'

import moneyIcon from '@/assets/Money.png'
import dollarIcon from '@/assets/CurrencyDollarSimple.png'
import type { LifecycleStepVariant, ReceivableDetailView } from '@/components/dashboard/merchant/receivables/receivableDetailTypes'
import { lifecycleCompletedCount } from '@/types/receivables'

const lifecycleBarClass = (variant: LifecycleStepVariant): string => {
  if (variant === 'purple') return 'bg-[#9333EA]'
  if (variant === 'green') return 'bg-[#16A34A]'
  if (variant === 'sky') return 'bg-[#38BDF8]'
  if (variant === 'neutral') return 'bg-[#1F2937]'
  return 'bg-[#195EBC]'
}

interface MerchantReceivableDetailContentProps {
  detail: ReceivableDetailView
}

const MerchantReceivableDetailContent = ({ detail }: MerchantReceivableDetailContentProps) => {
  const { row, subtitle, heroMetrics, lifecycle, repaymentRows, maturityBanner, basicInfo, documentName, stage } = detail
  const navigate = useNavigate()
  const completedCount = lifecycleCompletedCount(stage)

  return (
    <div className="flex flex-col gap-6 pb-8">
      <section className="rounded-[12px] border border-[#E6E8EC] bg-white p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-[#0B1220] font-bold text-[28px] lg:text-[34px] leading-tight">{row.receivableName}</h1>
            <p className="text-[#6B7488] text-[16px] mt-1.5">{subtitle}</p>
            <button type="button" className="mt-3 text-[#195EBC] text-[14px] font-medium hover:underline">
              Report an issue
            </button>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-[8px] bg-[#195EBC] text-white text-[16px] font-semibold px-8 py-3 hover:bg-[#154a9a] transition-colors w-full lg:w-auto"
            onClick={() => navigate(`/dashboard/merchant/receivables/${row.id}/repay`)}
          >
            Repay Loan
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {heroMetrics.map((m) => (
            <article
              key={m.id}
              className="rounded-[10px] border border-[#E6E8EC] bg-[#FAFBFD] px-5 py-5 flex items-start gap-4"
            >
              <div className="h-11 w-11 shrink-0 rounded-[6px] bg-[#195EBC] flex items-center justify-center">
                <img
                  src={m.icon === 'dollar' ? dollarIcon : moneyIcon}
                  alt=""
                  className="h-5 w-5 object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[#8B92A3] text-[13px] font-medium">{m.title}</p>
                <p className="text-[#0B1220] text-[24px] font-semibold leading-tight mt-1">{m.primaryValue}</p>
                <p className="text-[#8B92A3] text-[12px] mt-1">{m.secondaryValue}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

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
                      Date: {step.date}
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
              <li key={r.label} className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 border-b border-[#F0F2F6] pb-4 last:border-0 last:pb-0">
                <span className="text-[#6B7488] text-[14px]">{r.label}</span>
                <span className="text-[#0B1220] font-medium text-[14px] sm:text-right">{r.value}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-[8px] bg-[#828282] px-4 py-3 text-center">
            <p className="text-white text-[14px] font-medium">{maturityBanner}</p>
          </div>
        </section>
      </div>

      <section className="rounded-[12px] border border-[#E6E8EC] bg-white p-6 lg:p-8 shadow-sm">
        <h2 className="text-[#0B1220] font-bold text-[18px] mb-6">Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          {basicInfo.map((field) => (
            <div key={field.label}>
              <p className="text-[#4D5D80] text-[14px] font-medium mb-2">{field.label}</p>
              <div className="rounded-[6px] border border-[#D0D7E3] bg-[#FAFBFC] px-4 py-3 min-h-[48px] flex items-center">
                <span className="text-[#195EBC] text-[15px] font-medium">{field.value}</span>
              </div>
            </div>
          ))}
          <div className="sm:col-span-1">
            <p className="text-[#4D5D80] text-[14px] font-medium mb-2">Receivable Documents</p>
            <div className="rounded-[6px] border border-[#D0D7E3] bg-[#FAFBFC] px-4 py-3 min-h-[48px] flex items-center">
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
          </div>
        </div>
      </section>
    </div>
  )
}

export default MerchantReceivableDetailContent
