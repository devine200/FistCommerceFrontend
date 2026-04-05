import type { ReceivableTableRow } from '@/components/dashboard/merchant/receivables/types'

/** Case-insensitive filter on receivable name, loan amount, and debt status (merchant profile tables). */
export function filterMerchantProfileReceivableRows(
  items: ReceivableTableRow[],
  query: string,
): ReceivableTableRow[] {
  const q = query.trim().toLowerCase()
  if (!q) return items
  return items.filter(
    (row) =>
      row.receivableName.toLowerCase().includes(q) ||
      row.loanAmount.toLowerCase().includes(q) ||
      row.debtStatus.toLowerCase().includes(q),
  )
}
