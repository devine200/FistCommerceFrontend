import { useEffect } from 'react'
import { REHYDRATE } from 'redux-persist'

import { useAppDispatch } from '@/store/hooks'
import { AUTH_PERSIST_KEY, AUTH_PERSIST_STORAGE_KEY } from '@/store/persistConstants'

/** Rehydrates auth from localStorage when another tab updates redux-persist. */
export default function AuthStorageSync() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== AUTH_PERSIST_STORAGE_KEY || e.newValue == null) return
      try {
        const payload = JSON.parse(e.newValue) as unknown
        dispatch({
          type: REHYDRATE,
          key: AUTH_PERSIST_KEY,
          payload,
          err: undefined,
        })
      } catch {
        /* ignore corrupt payload */
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [dispatch])

  return null
}
