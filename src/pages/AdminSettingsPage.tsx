import { useState } from 'react'

type FeeKey =
  | 'platformFee'
  | 'managementFee'
  | 'performanceFee'
  | 'withdrawalFee'
  | 'latePenaltyFee'

type FeeValues = Record<FeeKey, string>

const DEFAULT_FEES: FeeValues = {
  platformFee: '2.5',
  managementFee: '2.5',
  performanceFee: '2.5',
  withdrawalFee: '2.5',
  latePenaltyFee: '2.5',
}

const LABELS: Record<FeeKey, string> = {
  platformFee: 'Platform Fee',
  managementFee: 'Management Fee',
  performanceFee: 'Performance Fee',
  withdrawalFee: 'Withdrawal Fee',
  latePenaltyFee: 'Late Penalty Fee',
}

const ORDER: FeeKey[] = [
  'platformFee',
  'managementFee',
  'performanceFee',
  'withdrawalFee',
  'latePenaltyFee',
]

function PercentField({
  id,
  label,
  value,
  onChange,
}: {
  id: FeeKey
  label: string
  value: string
  onChange: (next: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-[#6B7488]">
        {label}
      </label>
      <div className="flex h-[44px] items-center rounded-[8px] bg-[#F0F2F5] px-3 gap-2">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-[#0B1220] outline-none placeholder:text-[#B0B7C4]"
        />
        <span className="shrink-0 text-[15px] font-medium text-[#6B7488]" aria-hidden>
          %
        </span>
      </div>
    </div>
  )
}

const AdminSettingsPage = () => {
  const [saved, setSaved] = useState<FeeValues>(() => ({ ...DEFAULT_FEES }))
  const [draft, setDraft] = useState<FeeValues>(() => ({ ...DEFAULT_FEES }))

  const setFee = (key: FeeKey, v: string) => {
    setDraft((prev) => ({ ...prev, [key]: v }))
  }

  const handleCancel = () => {
    setDraft({ ...saved })
  }

  const handleSave = () => {
    setSaved({ ...draft })
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto pb-10 flex flex-col gap-6">
      <section className="rounded-[10px] border border-[#E6E8EC] bg-white px-6 py-6 shadow-sm">
        <h2 className="text-[#0B1220] text-[18px] font-bold leading-tight">Fee Structure</h2>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          {ORDER.map((key) => (
            <PercentField
              key={key}
              id={key}
              label={LABELS[key]}
              value={draft[key]}
              onChange={(v) => setFee(key, v)}
            />
          ))}
        </div>
      </section>

      <section className="rounded-[10px] border border-[#E6E8EC] bg-white px-6 py-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="h-[48px] w-full rounded-[8px] bg-[#E8EFFB] text-[#195EBC] text-[15px] font-semibold transition-colors hover:bg-[#DCE8F8]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-[48px] w-full rounded-[8px] bg-[#195EBC] text-white text-[15px] font-semibold transition-colors hover:bg-[#154a9e]"
          >
            Save Changes
          </button>
        </div>
      </section>
    </div>
  )
}

export default AdminSettingsPage
