import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type WalletSliceState = {
  /** Mirrors wagmi connection; not persisted */
  isConnected: boolean
  address: string | null
  chainId: number | undefined
}

const initialState: WalletSliceState = {
  isConnected: false,
  address: null,
  chainId: undefined,
}

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletFromProvider: (
      state,
      action: PayloadAction<{ isConnected: boolean; address: string | null; chainId: number | undefined }>,
    ) => {
      state.isConnected = action.payload.isConnected
      state.address = action.payload.address
      state.chainId = action.payload.chainId
    },
    resetWallet: () => initialState,
  },
})

export const { setWalletFromProvider, resetWallet } = walletSlice.actions
export const walletReducer = walletSlice.reducer
