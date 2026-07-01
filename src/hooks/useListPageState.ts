import { useEffect, useState } from 'react'

/** Keeps the current page in range and resets to page 1 when filters/search change. */
export function useListPageState(resetDeps: readonly unknown[]) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
    // Reset when list filters change.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller supplies explicit reset keys
  }, resetDeps)

  return [page, setPage] as const
}
