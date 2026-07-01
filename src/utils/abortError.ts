export function isAbortError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') return true
  if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') return true
  return false
}

export function isAbortedThunkAction(action: { meta: { aborted?: boolean } }): boolean {
  return Boolean(action.meta.aborted)
}
