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
  /** Aborts the in-flight request when the loading modal is dismissed. */
  onCancelLoading?: () => void
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
  onCancelLoading,
}: PrivilegedActionFeedbackLayerProps) {
  const showGovernanceOutcome =
    phase === 'succeeded' && resolvedOutcome?.kind === 'proposal_queued'

  const actionFeedbackModal = useMemo(() => {
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
          'Could not complete this action. Please try again.',
        ),
        primaryLabel: 'Try again',
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
  ])

  if (phase === 'idle' && !showGovernanceOutcome) return null

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
