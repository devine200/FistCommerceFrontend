import { useMemo } from 'react'

import { toUserFacingError } from '@/api/client'
import AdminActionFeedbackModal from '@/components/admin/AdminActionFeedbackModal'

import { AdminGovernanceOutcomeFlow } from './AdminGovernanceOutcomeFlow'
import type { ResolvedGovernanceOutcome } from './types'

export type PrivilegedActionPhase = 'idle' | 'loading' | 'succeeded' | 'failed'

export type PrivilegedActionFeedbackLayerProps = {
  phase: PrivilegedActionPhase
  resolvedOutcome: ResolvedGovernanceOutcome | null
  loadingTitle: string
  loadingDescription: string
  errorTitle: string
  errorDescription?: string
  directSuccessTitle: string
  directSuccessDescription?: string
  onDismiss: () => void
  onRetry?: () => void
  /** Override default "Try again" label on error modal primary action. */
  errorPrimaryLabel?: string
  /** Aborts the in-flight request when the loading modal is dismissed. */
  onCancelLoading?: () => void
  /**
   * When true, never show the loading overlay (e.g. a confirm dialog is open).
   * Prevents stacking under AdminConfirmModal.
   */
  suppressLoading?: boolean
}

export function PrivilegedActionFeedbackLayer({
  phase,
  resolvedOutcome,
  loadingTitle,
  loadingDescription,
  errorTitle,
  errorDescription,
  directSuccessTitle,
  directSuccessDescription,
  onDismiss,
  onRetry,
  errorPrimaryLabel,
  onCancelLoading,
  suppressLoading = false,
}: PrivilegedActionFeedbackLayerProps) {
  const showGovernanceOutcome =
    phase === 'succeeded' && resolvedOutcome?.kind === 'proposal_queued'

  const actionFeedbackModal = useMemo(() => {
    if (phase === 'loading' && !suppressLoading) {
      return {
        open: true,
        variant: 'loading' as const,
        title: loadingTitle,
        description: loadingDescription,
      }
    }

    if (phase === 'loading' && suppressLoading) {
      return { open: false, variant: 'loading' as const, title: '', description: '' }
    }

    if (phase === 'failed') {
      return {
        open: true,
        variant: 'error' as const,
        title: errorTitle,
        description: toUserFacingError(
          errorDescription,
          'Could not complete this action. Please try again.',
        ),
        primaryLabel: errorPrimaryLabel?.trim() || 'Try again',
        onPrimary: onRetry,
      }
    }

    if (phase === 'succeeded' && !showGovernanceOutcome) {
      const description =
        directSuccessDescription?.trim() ||
        (resolvedOutcome?.kind === 'direct_complete' ? resolvedOutcome.message.trim() : '') ||
        'The action completed successfully.'
      return {
        open: true,
        variant: 'success' as const,
        title: directSuccessTitle,
        description,
        primaryLabel: 'Done',
        onPrimary: onDismiss,
      }
    }

    return { open: false, variant: 'loading' as const, title: '', description: '' }
  }, [
    phase,
    showGovernanceOutcome,
    loadingTitle,
    loadingDescription,
    errorTitle,
    errorDescription,
    directSuccessTitle,
    directSuccessDescription,
    resolvedOutcome,
    onDismiss,
    onRetry,
    errorPrimaryLabel,
    suppressLoading,
  ])

  if (phase === 'idle' && !showGovernanceOutcome) return null
  // Confirm is open during an in-flight action: hide this layer entirely so only confirm shows.
  if (suppressLoading && phase === 'loading' && !showGovernanceOutcome) return null

  return (
    <>
      <AdminActionFeedbackModal
        open={actionFeedbackModal.open}
        variant={actionFeedbackModal.variant}
        title={actionFeedbackModal.title}
        description={actionFeedbackModal.description}
        primaryLabel={actionFeedbackModal.primaryLabel}
        onPrimary={actionFeedbackModal.onPrimary}
        onCancel={
          phase === 'loading'
            ? onCancelLoading
            : phase === 'failed'
              ? onDismiss
              : undefined
        }
      />
      <AdminGovernanceOutcomeFlow
        open={showGovernanceOutcome}
        outcome={resolvedOutcome}
        onClose={onDismiss}
      />
    </>
  )
}
