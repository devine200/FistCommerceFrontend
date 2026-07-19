import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

/**
 * Tracks which embedded-wallet addresses have acknowledged backing up their private key.
 *
 * Keyed by lowercased wallet address (never by user id) so an acknowledgment on one account
 * cannot leak to a different account signed in on the same browser. This is an *acknowledgment*
 * only — the app never has access to the key material (Privy exports it in an isolated iframe),
 * so this cannot and does not attest that a backup actually happened.
 */
export type KeyBackupState = {
  acknowledgedByAddress: Record<string, true>
}

const initialState: KeyBackupState = {
  acknowledgedByAddress: {},
}

function normalizeAddress(address: string): string {
  return address.trim().toLowerCase()
}

const keyBackupSlice = createSlice({
  name: 'keyBackup',
  initialState,
  reducers: {
    acknowledgeKeyBackup: (state, action: PayloadAction<{ address: string }>) => {
      const key = normalizeAddress(action.payload.address)
      if (!key) return
      state.acknowledgedByAddress[key] = true
    },
    revokeKeyBackupAcknowledgement: (state, action: PayloadAction<{ address: string }>) => {
      const key = normalizeAddress(action.payload.address)
      if (key) delete state.acknowledgedByAddress[key]
    },
    resetKeyBackupAcknowledgements: () => initialState,
  },
})

export const {
  acknowledgeKeyBackup,
  revokeKeyBackupAcknowledgement,
  resetKeyBackupAcknowledgements,
} = keyBackupSlice.actions

export const keyBackupReducer = keyBackupSlice.reducer

/** True when the given address has acknowledged saving its private key. */
export function selectKeyBackupAcknowledged(
  state: { keyBackup: KeyBackupState },
  address: string | null | undefined,
): boolean {
  if (!address?.trim()) return false
  return Boolean(state.keyBackup.acknowledgedByAddress[normalizeAddress(address)])
}
