export default function FullPageLoading({ label }: { label?: string }) {
  return (
    <div className="h-dvh w-full bg-[#EEF0F4] flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] rounded-[10px] border border-[#E6E8EC] bg-white px-6 py-7 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className="h-5 w-5 rounded-full border-2 border-[#195EBC] border-t-transparent animate-spin"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="text-[#0B1220] font-semibold text-[16px] leading-tight">Loading…</p>
            <p className="text-[#6B7488] text-[13px] mt-1 leading-snug">
              {label?.trim() ? label : 'Preparing your session.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

