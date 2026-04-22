import type { ApiRequestError } from '@/api/client'

type ApiFormErrorPanelProps = {
  error: ApiRequestError
  className?: string
}

/**
 * Shows API `errorMessage` / headline plus DRF `details` as a bullet list when present.
 */
export default function ApiFormErrorPanel({ error, className = '' }: ApiFormErrorPanelProps) {
  const bullets = error.detailLines
  return (
    <div
      role="alert"
      className={`rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-900 ${className}`.trim()}
    >
      {error.message ? <p className="text-[14px] font-medium leading-snug">{error.message}</p> : null}
      {bullets.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-snug text-red-800">
          {bullets.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
