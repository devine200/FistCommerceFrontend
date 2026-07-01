import { useCallback, useEffect, useMemo, useState } from 'react'

import AdminActionFeedbackModal from '@/components/admin/AdminActionFeedbackModal'
import type { AdminContactSocialLinks } from '@/api/adminContactSocialLinks'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  clearAdminContactSocialLinksSaveError,
  refreshAdminContactSocialLinks,
  saveAdminContactSocialLinks,
} from '@/store/slices/adminContactSocialLinksSlice'

type SupportInfoKey = keyof AdminContactSocialLinks

const FIELD_CONFIG: { key: SupportInfoKey; label: string; placeholder: string; type?: string }[] = [
  { key: 'email', label: 'Email address', placeholder: 'support@example.com', type: 'email' },
  { key: 'telegram', label: 'Telegram link', placeholder: 'https://t.me/your-channel' },
  { key: 'linkedin', label: 'LinkedIn link', placeholder: 'https://www.linkedin.com/company/...' },
  { key: 'instagram', label: 'Instagram link', placeholder: 'https://www.instagram.com/...' },
  { key: 'facebook', label: 'Facebook link', placeholder: 'https://www.facebook.com/...' },
]

function SupportInfoField({
  id,
  label,
  value,
  placeholder,
  type = 'text',
  disabled,
  onChange,
}: {
  id: SupportInfoKey
  label: string
  value: string
  placeholder: string
  type?: string
  disabled?: boolean
  onChange: (next: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-[#6B7488]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-[44px] w-full rounded-[8px] bg-[#F0F2F5] px-3 text-[15px] font-medium text-[#0B1220] outline-none placeholder:text-[#B0B7C4] focus:ring-2 focus:ring-[#195EBC]/25 disabled:opacity-60 disabled:cursor-not-allowed"
      />
    </div>
  )
}

const AdminSupportDisputeInfoPage = () => {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const sessionKind = useAppSelector((s) => s.auth.sessionKind)
  const { values, status, error, saveStatus, saveError } = useAppSelector((s) => s.adminContactSocialLinks)

  const [draft, setDraft] = useState<AdminContactSocialLinks | null>(null)

  useEffect(() => {
    if (!accessToken?.trim() || sessionKind !== 'admin') return
    void dispatch(refreshAdminContactSocialLinks())
  }, [dispatch, accessToken, sessionKind])

  useEffect(() => {
    if (status === 'succeeded') {
      setDraft({ ...values })
    }
  }, [status, values])

  const setField = (key: SupportInfoKey, value: string) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const handleCancel = () => {
    dispatch(clearAdminContactSocialLinksSaveError())
    setDraft({ ...values })
  }

  const handleSave = () => {
    if (!draft) return
    void dispatch(saveAdminContactSocialLinks(draft))
  }

  const handleDismissSaveFeedback = useCallback(() => {
    dispatch(clearAdminContactSocialLinksSaveError())
  }, [dispatch])

  const handleRetryLoad = useCallback(() => {
    void dispatch(refreshAdminContactSocialLinks())
  }, [dispatch])

  const feedbackModal = useMemo(() => {
    if (saveStatus === 'loading') {
      return {
        open: true,
        variant: 'loading' as const,
        title: 'Saving changes',
        description: 'Updating contact and social link settings…',
      }
    }

    if (status === 'loading' && !draft) {
      return {
        open: true,
        variant: 'loading' as const,
        title: 'Loading settings',
        description: 'Fetching contact and social link settings…',
      }
    }

    if (saveStatus === 'succeeded') {
      return {
        open: true,
        variant: 'success' as const,
        title: 'Settings saved',
        description: 'Contact and social links were updated successfully.',
        primaryLabel: 'Done',
        onPrimary: handleDismissSaveFeedback,
      }
    }

    if (saveStatus === 'failed') {
      return {
        open: true,
        variant: 'error' as const,
        title: 'Unable to save settings',
        description: saveError?.trim() || 'Could not save contact and social link settings.',
        primaryLabel: 'OK',
        onPrimary: handleDismissSaveFeedback,
      }
    }

    if (status === 'failed') {
      return {
        open: true,
        variant: 'error' as const,
        title: 'Unable to load settings',
        description: error?.trim() || 'Could not load contact and social link settings.',
        primaryLabel: 'Try again',
        onPrimary: handleRetryLoad,
      }
    }

    return { open: false, variant: 'loading' as const, title: '', description: '' }
  }, [
    saveStatus,
    status,
    draft,
    saveError,
    error,
    handleDismissSaveFeedback,
    handleRetryLoad,
  ])

  const formDisabled =
    status === 'loading' || saveStatus === 'loading' || saveStatus === 'succeeded'
  const showForm = draft !== null

  return (
    <>
      <AdminActionFeedbackModal
        open={feedbackModal.open}
        variant={feedbackModal.variant}
        title={feedbackModal.title}
        description={feedbackModal.description}
        primaryLabel={feedbackModal.primaryLabel}
        onPrimary={feedbackModal.onPrimary}
      />

      <div className="w-full max-w-[1280px] mx-auto pb-10 flex flex-col gap-6">
        <section className="rounded-[10px] border border-[#E6E8EC] bg-white px-6 py-6 shadow-sm">
          <h2 className="text-[#0B1220] text-[18px] font-bold leading-tight">Contact &amp; Social Links</h2>
          <p className="mt-2 text-[#6B7488] text-[14px]">
            Update the support email and social links shown to users for help and dispute inquiries.
          </p>

          {showForm ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {FIELD_CONFIG.map((field) => (
                <SupportInfoField
                  key={field.key}
                  id={field.key}
                  label={field.label}
                  value={draft[field.key]}
                  placeholder={field.placeholder}
                  type={field.type}
                  disabled={formDisabled}
                  onChange={(v) => setField(field.key, v)}
                />
              ))}
            </div>
          ) : null}
        </section>

        {showForm ? (
          <section className="rounded-[10px] border border-[#E6E8EC] bg-white px-6 py-5 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={formDisabled}
                className="h-[48px] w-full rounded-[8px] bg-[#E8EFFB] text-[#195EBC] text-[15px] font-semibold transition-colors hover:bg-[#DCE8F8] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={formDisabled}
                className="h-[48px] w-full rounded-[8px] bg-[#195EBC] text-white text-[15px] font-semibold transition-colors hover:bg-[#154a9e] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </>
  )
}

export default AdminSupportDisputeInfoPage
