interface InvestorFlowContinueButtonProps {
  onClick: () => void
  disabled: boolean
  disabledHint?: string | null
  label?: string
  className?: string
  buttonClassName?: string
}

const InvestorFlowContinueButton = ({
  onClick,
  disabled,
  disabledHint,
  label = 'Continue',
  className,
  buttonClassName = 'w-full rounded-[6px] bg-[#195EBC] text-white text-[18px] font-medium h-[50px] hover:bg-[#154a9a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
}: InvestorFlowContinueButtonProps) => (
  <span className={`block w-full ${className ?? ''}`} title={disabled && disabledHint ? disabledHint : undefined}>
    <button type="button" onClick={onClick} disabled={disabled} className={buttonClassName}>
      {label}
    </button>
  </span>
)

export default InvestorFlowContinueButton
