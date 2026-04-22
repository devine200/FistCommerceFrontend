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
import type { PersistedState } from 'redux-persist/es/types'

import { authPersistStorage } from '@/store/authPersistStorage'
import {
  AUTH_PERSIST_KEY,
  AUTH_PERSIST_STORAGE_KEY,
  KYC_PERSIST_KEY,
  LEGACY_AUTH_STORAGE_KEY,
  ONBOARDING_PERSIST_KEY,
} from '@/store/persistConstants'
import { authReducer } from '@/store/slices/authSlice'
import { adminDashboardReducer } from '@/store/slices/adminDashboardSlice'
import { adminInvestorsReducer } from '@/store/slices/adminInvestorsSlice'
import { adminMerchantsReducer } from '@/store/slices/adminMerchantsSlice'
import { investorDashboardReducer } from '@/store/slices/investorDashboardSlice'
import { recentTransactionsReducer } from '@/store/slices/recentTransactionsSlice'
import { merchantDashboardReducer } from '@/store/slices/merchantDashboardSlice'
import { kycReducer } from '@/store/slices/kycSlice'
import { onboardingReducer } from '@/store/slices/onboardingSlice'
import { onboardingProfileDraftReducer } from '@/store/slices/onboardingProfileDraftSlice'
import { walletReducer } from '@/store/slices/walletSlice'

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
    const onboarded = Boolean(parsed.onboarded)
    const inbound = {
      accessToken: onboarded ? 'migrated_session' : null,
      refreshToken: null,
      user: null,
      onboarded,
      role: parsed.role === 'merchant' ? 'merchant' : 'investor',
      kycVerified: false,
      _persist: { version: -1, rehydrated: false },
    }
    localStorage.setItem(AUTH_PERSIST_STORAGE_KEY, JSON.stringify(inbound))
  } catch {
    /* ignore corrupt legacy storage */
  }
}

seedLegacyAuthIntoPersist()

/** v1: clear legacy kycVerified. v2: add refreshToken for wallet session API. */
const authPersistConfig = {
  key: AUTH_PERSIST_KEY,
  storage: authPersistStorage,
  version: 2,
  migrate: async (state: PersistedState): Promise<PersistedState> => {
    if (!state || typeof state !== 'object') return undefined
    const next = { ...state, kycVerified: false } as Record<string, unknown>
    if (next.refreshToken === undefined) next.refreshToken = null
    return next as PersistedState
  },
}

/** v1: add step dirty maps for forward URL guard after revisiting a form. */
const onboardingPersistConfig = {
  key: ONBOARDING_PERSIST_KEY,
  storage: authPersistStorage,
  version: 1,
  migrate: async (state: PersistedState): Promise<PersistedState> => {
    if (!state || typeof state !== 'object') return undefined
    const s = state as Record<string, unknown>
    if (!s.investorStepDirty || typeof s.investorStepDirty !== 'object') s.investorStepDirty = {}
    if (!s.merchantStepDirty || typeof s.merchantStepDirty !== 'object') s.merchantStepDirty = {}
    return state as PersistedState
  },
}

/** Bump version to clear any persisted `verified` / `pending` KYC back to not_started. */
const kycPersistConfig = {
  key: KYC_PERSIST_KEY,
  storage: authPersistStorage,
  version: 1,
  migrate: async (state: PersistedState): Promise<PersistedState> => {
    if (!state || typeof state !== 'object') return undefined
    return { ...state, status: 'verified' } as PersistedState
  },
}

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  wallet: walletReducer,
  onboarding: persistReducer(onboardingPersistConfig, onboardingReducer),
  onboardingProfileDraft: onboardingProfileDraftReducer,
  kyc: persistReducer(kycPersistConfig, kycReducer),
  adminDashboard: adminDashboardReducer,
  adminInvestors: adminInvestorsReducer,
  adminMerchants: adminMerchantsReducer,
  investorDashboard: investorDashboardReducer,
  recentTransactions: recentTransactionsReducer,
  merchantDashboard: merchantDashboardReducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ['auth._persist', 'onboarding._persist', 'kyc._persist'],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
