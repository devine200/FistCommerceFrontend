/** redux-persist `key` for the auth slice (localStorage entry is `persist:${AUTH_PERSIST_KEY}`). */
export const AUTH_PERSIST_KEY = 'auth'

export const AUTH_PERSIST_STORAGE_KEY = `persist:${AUTH_PERSIST_KEY}`

export const ONBOARDING_PERSIST_KEY = 'onboarding'
export const ONBOARDING_PERSIST_STORAGE_KEY = `persist:${ONBOARDING_PERSIST_KEY}`

export const KYC_PERSIST_KEY = 'kyc'
export const KYC_PERSIST_STORAGE_KEY = `persist:${KYC_PERSIST_KEY}`

/** Previous hand-written session key; migrated once into redux-persist storage. */
export const LEGACY_AUTH_STORAGE_KEY = 'fistcommerce.session.v2'
