import type { AdminWriteOutcome } from '@/api/adminActionResponse'

import { resolveAdminWriteOutcome } from './resolveAdminWriteOutcome'
import type { ResolvedGovernanceOutcome, SubmitAdminActionOptions } from './types'

/** Runs an admin write and normalizes governance vs direct-complete outcomes. */
export async function submitAdminAction(
  action: () => Promise<AdminWriteOutcome>,
  options?: SubmitAdminActionOptions,
): Promise<ResolvedGovernanceOutcome> {
  const outcome = await action()
  return resolveAdminWriteOutcome(outcome, options)
}
