import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import {
  fetchAdminContactSocialLinks,
  postAdminContactSocialLinks,
  type AdminContactSocialLinks,
  type AdminContactSocialLinksResponse,
} from '@/api/adminContactSocialLinks'
import { ApiRequestError, formatApiRequestErrorPlain } from '@/api/client'

export type AdminContactSocialLinksSyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'
export type AdminContactSocialLinksSaveStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

const emptyValues: AdminContactSocialLinks = {
  email: '',
  telegram: '',
  linkedin: '',
  instagram: '',
  facebook: '',
}

export type AdminContactSocialLinksState = {
  values: AdminContactSocialLinks
  updatedAt: string | null
  status: AdminContactSocialLinksSyncStatus
  error: string | null
  saveStatus: AdminContactSocialLinksSaveStatus
  saveError: string | null
  lastUpdated: number | null
}

const initialState: AdminContactSocialLinksState = {
  values: emptyValues,
  updatedAt: null,
  status: 'idle',
  error: null,
  saveStatus: 'idle',
  saveError: null,
  lastUpdated: null,
}

type RefreshAdminAuth = {
  auth?: { accessToken?: string | null }
}

function applyResponse(
  state: AdminContactSocialLinksState,
  data: AdminContactSocialLinksResponse,
  fetchedAt: number,
) {
  state.values = {
    email: data.email,
    telegram: data.telegram,
    linkedin: data.linkedin,
    instagram: data.instagram,
    facebook: data.facebook,
  }
  state.updatedAt = data.updatedAt
  state.lastUpdated = fetchedAt
}

export const refreshAdminContactSocialLinks = createAsyncThunk(
  'adminContactSocialLinks/refresh',
  async (_arg, thunkApi) => {
    const state = thunkApi.getState() as RefreshAdminAuth
    const accessToken = state.auth?.accessToken
    if (!accessToken?.trim()) {
      throw new Error('Sign in to load contact and social link settings.')
    }

    try {
      const data = await fetchAdminContactSocialLinks(accessToken)
      return { fetchedAt: Date.now(), data }
    } catch (e) {
      if (e instanceof ApiRequestError) {
        return thunkApi.rejectWithValue(formatApiRequestErrorPlain(e))
      }
      throw e
    }
  },
)

export const saveAdminContactSocialLinks = createAsyncThunk(
  'adminContactSocialLinks/save',
  async (payload: AdminContactSocialLinks, thunkApi) => {
    const state = thunkApi.getState() as RefreshAdminAuth
    const accessToken = state.auth?.accessToken
    if (!accessToken?.trim()) {
      throw new Error('Sign in to save contact and social link settings.')
    }

    try {
      const data = await postAdminContactSocialLinks(accessToken, payload)
      return { fetchedAt: Date.now(), data }
    } catch (e) {
      if (e instanceof ApiRequestError) {
        return thunkApi.rejectWithValue(formatApiRequestErrorPlain(e))
      }
      throw e
    }
  },
)

const adminContactSocialLinksSlice = createSlice({
  name: 'adminContactSocialLinks',
  initialState,
  reducers: {
    resetAdminContactSocialLinks: () => initialState,
    clearAdminContactSocialLinksSaveError: (state) => {
      state.saveStatus = 'idle'
      state.saveError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshAdminContactSocialLinks.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(refreshAdminContactSocialLinks.fulfilled, (state, action) => {
        state.status = 'succeeded'
        applyResponse(state, action.payload.data, action.payload.fetchedAt)
      })
      .addCase(refreshAdminContactSocialLinks.rejected, (state, action) => {
        state.status = 'failed'
        state.error =
          (typeof action.payload === 'string' ? action.payload : null) ??
          action.error.message ??
          'Could not load contact and social link settings.'
      })
      .addCase(saveAdminContactSocialLinks.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = null
      })
      .addCase(saveAdminContactSocialLinks.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        state.saveError = null
        applyResponse(state, action.payload.data, action.payload.fetchedAt)
      })
      .addCase(saveAdminContactSocialLinks.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError =
          (typeof action.payload === 'string' ? action.payload : null) ??
          action.error.message ??
          'Could not save contact and social link settings.'
      })
  },
})

export const { resetAdminContactSocialLinks, clearAdminContactSocialLinksSaveError } =
  adminContactSocialLinksSlice.actions
export const adminContactSocialLinksReducer = adminContactSocialLinksSlice.reducer
