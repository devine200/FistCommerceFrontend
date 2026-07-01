import { useCallback, useState } from 'react'

import type { OperationType } from '@/api/types/multisig'

import { submitAdminAction } from './submitAdminAction'
import type { ResolvedGovernanceOutcome } from './types'

export function useAdminGovernanceAction(operationType?: OperationType) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ResolvedGovernanceOutcome | null>(null)

  const submit = useCallback(
    async (action: () => Promise<import('@/api/adminActionResponse').AdminWriteOutcome>) => {
      setLoading(true)
      setError(null)
      try {
        const resolved = await submitAdminAction(action, { operationType })
        setResult(resolved)
        return resolved
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Request failed.'
        setError(message)
        throw e
      } finally {
        setLoading(false)
      }
    },
    [operationType],
  )

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setLoading(false)
  }, [])

  return { submit, loading, error, result, reset }
}
