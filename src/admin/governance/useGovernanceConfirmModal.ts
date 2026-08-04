import { useCallback, useEffect, useRef, useState } from 'react'

import type { NonceWarning } from '@/api/types/multisig'
import { executeQueueJumpWarningFromApiError } from '@/api/apiRequestError'

import type { GovernanceNonceConfirmPayload } from './governanceNonceWarningTypes'

type PendingConfirm = {
  payload: GovernanceNonceConfirmPayload
  resolve: (value: boolean) => void
}

export function nonceWarningToConfirmPayload(warning: NonceWarning): GovernanceNonceConfirmPayload {
  return {
    mode: 'sign_ahead',
    message: warning.message,
    blockingProposalIds: warning.blockingProposalIds,
    willInvalidateOthers: warning.willInvalidateOthers,
  }
}

export function useGovernanceConfirmModal() {
  const [open, setOpen] = useState(false)
  const [payload, setPayload] = useState<GovernanceNonceConfirmPayload | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const pendingRef = useRef<PendingConfirm | null>(null)

  const settlePending = useCallback((accepted: boolean) => {
    const pending = pendingRef.current
    pendingRef.current = null
    setOpen(false)
    setPayload(null)
    setConfirmLoading(false)
    pending?.resolve(accepted)
  }, [])

  useEffect(() => {
    return () => {
      if (pendingRef.current) {
        pendingRef.current.resolve(false)
        pendingRef.current = null
      }
    }
  }, [])

  const confirmNonceWarning = useCallback((next: GovernanceNonceConfirmPayload): Promise<boolean> => {
    if (pendingRef.current) {
      return Promise.resolve(false)
    }
    return new Promise((resolve) => {
      pendingRef.current = { payload: next, resolve }
      setPayload(next)
      setOpen(true)
    })
  }, [])

  const confirmQueueJumpFromApiError = useCallback(
    async (error: unknown): Promise<boolean> => {
      const warning = executeQueueJumpWarningFromApiError(error)
      if (!warning) return false
      return confirmNonceWarning({
        mode: 'queue_jump_execute',
        message: warning.message,
        blockingProposalIds: warning.blockingProposalIds,
        willInvalidateOthers: warning.willInvalidateOthers,
        liveNonce: warning.liveNonce,
        reservedNonce: warning.reservedNonce,
        requiresResign: warning.requiresResign,
      })
    },
    [confirmNonceWarning],
  )

  const handleConfirm = useCallback(() => {
    settlePending(true)
  }, [settlePending])

  const handleCancel = useCallback(() => {
    if (confirmLoading) return
    settlePending(false)
  }, [confirmLoading, settlePending])

  return {
    confirmNonceWarning,
    confirmQueueJumpFromApiError,
    modalProps: {
      open,
      payload,
      confirmLoading,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
    isModalOpen: open,
    setConfirmLoading,
  }
}

export type GovernanceConfirmModalApi = ReturnType<typeof useGovernanceConfirmModal>
