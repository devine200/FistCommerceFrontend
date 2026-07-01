import { splitAdminTransactionDetailText } from '@/utils/mapAdminTransactionsList'

type AdminTransactionDetailTextProps = {
  detail: string
}

export default function AdminTransactionDetailText({ detail }: AdminTransactionDetailTextProps) {
  const segments = splitAdminTransactionDetailText(detail)

  return (
    <p className="text-[14px] text-[#0B1220] leading-snug max-w-[420px]">
      {segments.map((segment, index) =>
        segment.highlight ? (
          <span key={index} className="text-[#195EBC]">
            {segment.text}
          </span>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </p>
  )
}
