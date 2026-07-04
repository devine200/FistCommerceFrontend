import { useMemo } from 'react'

import { toUserFacingError } from '@/api/client'
import AdminActionFeedbackModal from '@/components/admin/AdminActionFeedbackModal'

export type DashboardRequestPhase = 'idle' | 'loading' | 'succeeded' | 'failed'

export type DashboardRequestFeedbackLayerProps = {
  phase: DashboardRequestPhase
  loadingTitle: string
  loadingDescription: string
  errorTitle: string
  errorDescription?: string
  successTitle?: string
  successDescription?: string
  /** When false, a succeeded phase does not show a success modal (typical for passive data loads). */
  showSuccess?: boolean
  onDismiss: () => void
  onRetry?: () => void
  /** Dismisses the loading modal (e.g. allow viewing stale content while sync continues). */
  onCancelLoading?: () => void
  retryLabel?: string
  successLabel?: string
  cancelLabel?: string
}

export function DashboardRequestFeedbackLayer({
  phase,
  loadingTitle,
  loadingDescription,
  errorTitle,
  errorDescription,
  successTitle = 'Done',
  successDescription = 'Your request completed successfully.',
  showSuccess = false,
  onDismiss,
  onRetry,
  onCancelLoading,
  retryLabel = 'Try again',
  successLabel = 'Done',
  cancelLabel = 'Cancel',
}: DashboardRequestFeedbackLayerProps) {
  const modal = useMemo(() => {
    if (phase === 'loading') {
      return {
        open: true,
        variant: 'loading' as const,
        title: loadingTitle,
        description: loadingDescription,
      }
    }

    if (phase === 'failed') {
      return {
        open: true,
        variant: 'error' as const,
        title: errorTitle,
        description: toUserFacingError(
          errorDescription,
          'Could not complete this request. Please try again.',
        ),
        primaryLabel: retryLabel,
        onPrimary: onRetry,
      }
    }

    if (phase === 'succeeded' && showSuccess) {
      return {
        open: true,
        variant: 'success' as const,
        title: successTitle,
        description: successDescription?.trim() || 'Your request completed successfully.',
        primaryLabel: successLabel,
        onPrimary: onDismiss,
      }
    }

    return { open: false, variant: 'loading' as const, title: '', description: '' }
  }, [
    phase,
    loadingTitle,
    loadingDescription,
    errorTitle,
    errorDescription,
    showSuccess,
    successTitle,
    successDescription,
    retryLabel,
    successLabel,
    onDismiss,
    onRetry,
  ])

  if (phase === 'idle') return null

  return (
    <AdminActionFeedbackModal
      open={modal.open}
      variant={modal.variant}
      title={modal.title}
      description={modal.description}
      primaryLabel={modal.primaryLabel}
      onPrimary={modal.onPrimary}
      onCancel={
        phase === 'loading'
          ? onCancelLoading
          : phase === 'failed'
            ? onDismiss
            : undefined
      }
      cancelLabel={cancelLabel}
    />
  )
}
