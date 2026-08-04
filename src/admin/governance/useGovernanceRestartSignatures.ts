import { useCallback, useState } from 'react'

import { toAppUserFacingError } from '@/errors/toAppUserFacingError'
import { postMultisigProposalRestartSignatures } from '@/api/multisig/proposals'
import type { ProposalDetail } from '@/api/types/multisig'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { refreshMultisigProposalDetail } from '@/store/slices/adminMultisigSlice'

export function useGovernanceRestartSignatures() {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastDetail, setLastDetail] = useState<ProposalDetail | null>(null)

  const restart = useCallback(
    async (proposalId: string): Promise<ProposalDetail | null> => {
      const id = proposalId.trim()
      if (!id) {
        setError('Missing proposal id.')
        return null
      }
      if (!accessToken?.trim()) {
        setError('Sign in to restart proposal signatures.')
        return null
      }

      setPending(true)
      setError(null)
      try {
        const detail = await postMultisigProposalRestartSignatures(accessToken, id)
        setLastDetail(detail)
        await dispatch(refreshMultisigProposalDetail(id)).unwrap()
        return detail
      } catch (e) {
        const message = toAppUserFacingError(e, {
          fallback: 'Could not restart signatures.',
          context: 'governance_execute',
        })
        setError(message)
        return null
      } finally {
        setPending(false)
      }
    },
    [accessToken, dispatch],
  )

  return {
    restart,
    pending,
    error,
    lastDetail,
    clearError: () => setError(null),
    clearLastDetail: () => setLastDetail(null),
  }
}
