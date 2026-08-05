import { useCallback, useEffect, useRef, useState } from 'react'

import type { AdminConfirmModalVariant } from '@/components/admin/AdminConfirmModal'

export type AdminConfirmRequest = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: AdminConfirmModalVariant
}

type PendingConfirm = {
  request: AdminConfirmRequest
  resolve: (value: boolean) => void
}

/**
 * Promise-based confirm dialog. Prefer this over window.confirm so custom
 * overlays never stack under AdminActionFeedbackModal loading.
 */
export function useAdminConfirmDialog() {
  const [open, setOpen] = useState(false)
  const [request, setRequest] = useState<AdminConfirmRequest | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const pendingRef = useRef<PendingConfirm | null>(null)

  const settle = useCallback((accepted: boolean) => {
    const pending = pendingRef.current
    pendingRef.current = null
    setOpen(false)
    setRequest(null)
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

  const confirm = useCallback((next: AdminConfirmRequest): Promise<boolean> => {
    if (pendingRef.current) {
      return Promise.resolve(false)
    }
    return new Promise((resolve) => {
      pendingRef.current = { request: next, resolve }
      setRequest(next)
      setOpen(true)
    })
  }, [])

  return {
    confirm,
    isOpen: open,
    setConfirmLoading,
    modalProps: {
      open,
      title: request?.title ?? '',
      description: request?.description,
      confirmLabel: request?.confirmLabel,
      cancelLabel: request?.cancelLabel,
      variant: request?.variant ?? 'default',
      confirmLoading,
      dismissible: !confirmLoading,
      onConfirm: () => settle(true),
      onCancel: () => {
        if (confirmLoading) return
        settle(false)
      },
    },
  }
}

export type AdminConfirmDialogApi = ReturnType<typeof useAdminConfirmDialog>
