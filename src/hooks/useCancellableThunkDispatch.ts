import type { AsyncThunkAction } from '@reduxjs/toolkit'
import { useCallback, useRef } from 'react'

import { useAppDispatch } from '@/store/hooks'

type AbortableDispatchResult = {
  abort: () => void
  unwrap: () => Promise<unknown>
  finally: (onfinally: () => void) => Promise<unknown>
}

type CancellableThunkAction = AsyncThunkAction<unknown, unknown, { state: unknown }>

/** Dispatches async thunks and exposes `.abort()` on the returned promise. */
export function useCancellableThunkDispatch() {
  const dispatch = useAppDispatch()
  const pendingRef = useRef<AbortableDispatchResult | null>(null)

  const dispatchCancellable = useCallback(
    (thunkAction: CancellableThunkAction) => {
      pendingRef.current?.abort()
      const promise = dispatch(thunkAction) as unknown as AbortableDispatchResult
      pendingRef.current = promise
      void promise.finally(() => {
        if (pendingRef.current === promise) {
          pendingRef.current = null
        }
      })
      return promise
    },
    [dispatch],
  )

  const cancelPending = useCallback(() => {
    pendingRef.current?.abort()
    pendingRef.current = null
  }, [])

  return { dispatchCancellable, cancelPending }
}
