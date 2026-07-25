import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

import { toAppUserFacingError } from '@/errors/toAppUserFacingError'

function isLikelyStoreOrRuntimeFault(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const name = error.name
  if (name === 'TypeError' || name === 'ReferenceError') return true
  const msg = error.message.toLowerCase()
  return msg.includes('undefined is not') || msg.includes('cannot read propert')
}

function messageFromError(error: unknown): string {
  if (isLikelyStoreOrRuntimeFault(error)) {
    return 'The app hit an unexpected state. Reloading usually fixes this.'
  }
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) return 'This page could not be found.'
    if (error.status === 401 || error.status === 403) {
      return 'You do not have access to this page. Sign in again or contact support.'
    }
    if (error.status >= 500) return 'The server had a problem. Please reload and try again.'
    return toAppUserFacingError(error.statusText || `Request failed (${error.status})`, {
      fallback: 'Something went wrong while loading this page.',
    })
  }
  return toAppUserFacingError(error, {
    fallback: 'Something went wrong while loading this page.',
  })
}

/** Shown when a route throws; offers a full reload to recover from bad store/bundle state. */
export default function RouteErrorFallback() {
  const error = useRouteError()
  const description = messageFromError(error)

  return (
    <div className="h-dvh w-full bg-[#EEF0F4] flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] rounded-[10px] border border-[#E6E8EC] bg-white px-6 py-7 shadow-sm">
        <p className="text-[#0B1220] font-semibold text-[16px] leading-tight">Unable to load page</p>
        <p className="text-[#6B7488] text-[13px] mt-2 leading-snug">{description}</p>
        <button
          type="button"
          className="mt-6 h-[44px] w-full rounded-[6px] bg-[#195EBC] text-white text-[14px] font-medium hover:bg-[#154a9a] transition-colors"
          onClick={() => {
            window.location.reload()
          }}
        >
          Reload app
        </button>
      </div>
    </div>
  )
}
