import {
  MERCHANT_REPAY_STEPS,
  type MerchantRepayStepIndex,
} from '@/components/dashboard/merchant/repay/repayFlowConfig'

const tabButtonClass = (isActive: boolean) =>
  [
    'py-3 text-center text-[13px] font-medium border-r last:border-r-0 disabled:cursor-not-allowed',
    isActive ? 'bg-[#195EBC] text-white' : 'bg-white text-[#6B7488]',
  ].join(' ')

interface MerchantRepayFlowTabsProps {
  activeStep: MerchantRepayStepIndex
  onStepSelect?: (step: MerchantRepayStepIndex) => void
}

const MerchantRepayFlowTabs = ({ activeStep, onStepSelect }: MerchantRepayFlowTabsProps) => (
  <div className="w-full lg:hidden">
    <div className="w-full rounded-[6px] border border-[#E6E8EC] bg-white overflow-hidden">
      <div className="grid grid-cols-3">
        {MERCHANT_REPAY_STEPS.map((label, idx) => {
          const step = idx as MerchantRepayStepIndex
          const isActive = step === activeStep
          const isClickable = step <= activeStep

          return (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (isClickable) onStepSelect?.(step)
              }}
              disabled={!isClickable || !onStepSelect}
              className={tabButtonClass(isActive)}
              aria-current={isActive ? 'step' : undefined}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  </div>
)

export default MerchantRepayFlowTabs
