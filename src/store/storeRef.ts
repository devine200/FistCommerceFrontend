/**
 * Late-bound store access so API modules (e.g. payout) can read session chain
 * without a static `import { store } from '@/store'` cycle through dashboard slices.
 */

export type AppStoreRef = {
  getState: () => {
    auth: { chainId?: number | null }
    wallet: { chainId?: number | null }
  }
}

let appStore: AppStoreRef | null = null

/** Called once from `store/index` after `configureStore`. */
export function registerAppStore(next: AppStoreRef): void {
  appStore = next
}

/** Returns null until the store has finished booting. */
export function getAppStore(): AppStoreRef | null {
  return appStore
}
