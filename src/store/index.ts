import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist'

import { authPersistStorage } from '@/store/authPersistStorage'
import {
  AUTH_PERSIST_KEY,
  AUTH_PERSIST_STORAGE_KEY,
  LEGACY_AUTH_STORAGE_KEY,
} from '@/store/persistConstants'
import { authReducer } from '@/store/slices/authSlice'
import { adminDashboardReducer } from '@/store/slices/adminDashboardSlice'
import { adminInvestorsReducer } from '@/store/slices/adminInvestorsSlice'
import { adminMerchantsReducer } from '@/store/slices/adminMerchantsSlice'
import { investorDashboardReducer } from '@/store/slices/investorDashboardSlice'
import { merchantDashboardReducer } from '@/store/slices/merchantDashboardSlice'

type LegacySessionBlob = {
  onboarded?: boolean
  role?: string
  kycVerified?: boolean
}

function seedLegacyAuthIntoPersist() {
  if (typeof localStorage === 'undefined') return
  try {
    if (localStorage.getItem(AUTH_PERSIST_STORAGE_KEY)) return
    const raw = localStorage.getItem(LEGACY_AUTH_STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as Partial<LegacySessionBlob>
    const inbound = {
      onboarded: Boolean(parsed.onboarded),
      role: parsed.role === 'merchant' ? 'merchant' : 'investor',
      kycVerified: Boolean(parsed.kycVerified),
      _persist: { version: -1, rehydrated: false },
    }
    localStorage.setItem(AUTH_PERSIST_STORAGE_KEY, JSON.stringify(inbound))
  } catch {
    /* ignore corrupt legacy storage */
  }
}

seedLegacyAuthIntoPersist()

const authPersistConfig = {
  key: AUTH_PERSIST_KEY,
  storage: authPersistStorage,
}

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  adminDashboard: adminDashboardReducer,
  adminInvestors: adminInvestorsReducer,
  adminMerchants: adminMerchantsReducer,
  investorDashboard: investorDashboardReducer,
  merchantDashboard: merchantDashboardReducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ['auth._persist'],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
