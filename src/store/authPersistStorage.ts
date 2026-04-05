/**
 * redux-persist expects async WebStorage (getItem/setItem/removeItem return Promises).
 * Default `redux-persist/lib/storage` can break under Vite ESM interop or when extensions
 * (e.g. SES / wallet lockdown) leave `localStorage` without usable methods.
 */
type AsyncWebStorage = {
  getItem(key: string): Promise<string | null>
  setItem(key: string, item: string): Promise<void>
  removeItem(key: string): Promise<void>
}

function tryGetBrowserLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    const ls = window.localStorage
    if (
      !ls ||
      typeof ls.getItem !== 'function' ||
      typeof ls.setItem !== 'function' ||
      typeof ls.removeItem !== 'function'
    ) {
      return null
    }
    const probe = '__fistcommerce_ls_probe__'
    ls.setItem(probe, '1')
    ls.removeItem(probe)
    return ls
  } catch {
    return null
  }
}

function createMemoryStorage(): AsyncWebStorage {
  const map = new Map<string, string>()
  return {
    getItem: (key) => Promise.resolve(map.get(key) ?? null),
    setItem: (key, item) => {
      map.set(key, item)
      return Promise.resolve()
    },
    removeItem: (key) => {
      map.delete(key)
      return Promise.resolve()
    },
  }
}

function createLocalStorageAdapter(ls: Storage): AsyncWebStorage {
  return {
    getItem: (key) =>
      Promise.resolve().then(() => {
        try {
          return ls.getItem(key)
        } catch {
          return null
        }
      }),
    setItem: (key, item) =>
      Promise.resolve().then(() => {
        try {
          ls.setItem(key, item)
        } catch {
          /* quota / privacy mode */
        }
      }),
    removeItem: (key) =>
      Promise.resolve().then(() => {
        try {
          ls.removeItem(key)
        } catch {
          /* ignore */
        }
      }),
  }
}

function createAuthPersistStorage(): AsyncWebStorage {
  const ls = tryGetBrowserLocalStorage()
  if (ls) return createLocalStorageAdapter(ls)
  if (import.meta.env.DEV) {
    console.warn(
      '[redux-persist] localStorage is missing or unusable; using in-memory storage (state resets on full reload).',
    )
  }
  return createMemoryStorage()
}

export const authPersistStorage = createAuthPersistStorage()
