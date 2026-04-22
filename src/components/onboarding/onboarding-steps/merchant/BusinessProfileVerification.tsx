import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import CountrySelect from '@/components/forms/CountrySelect'
import { ApiRequestError, getApiBaseUrl } from '@/api/client'
import { postMerchantProfile } from '@/api/onboardingProfile'
import ApiFormErrorPanel from '@/components/forms/ApiFormErrorPanel'
import FormSubmitLoadingNotice from '@/components/forms/FormSubmitLoadingNotice'
import { useOnboardingFormStep } from '@/hooks/useOnboardingFormStep'
import { completeOnboarding } from '@/state/session'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { resetOnboardingProfileDrafts } from '@/store/slices/onboardingProfileDraftSlice'

const MERCHANT_BUSINESS_PROFILE_STEP_INDEX = 3

const BusinessProfileVerification = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const identity = useAppSelector((s) => s.onboardingProfileDraft.merchantIdentity)
  const { formMonitorProps, clearStepDirty } = useOnboardingFormStep(
    'merchant',
    MERCHANT_BUSINESS_PROFILE_STEP_INDEX,
  )
  const [submitError, setSubmitError] = useState<ApiRequestError | string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)
    if (!identity) {
      navigate('/onboarding/merchant/verify-identity', { replace: true })
      return
    }
    if (!getApiBaseUrl()) {
      setSubmitError('API base URL is not configured. Set VITE_API_BASE_URL and restart the dev server.')
      return
    }
    const token = accessToken?.trim()
    if (!token) {
      setSubmitError('You need an active wallet session. Go back and connect your wallet again.')
      return
    }
    const form = e.currentTarget
    const fd = new FormData(form)
    const yearsRaw = String(fd.get('years_in_operation') ?? '')
    const years = Number.parseInt(yearsRaw, 10)
    if (!Number.isFinite(years) || years < 0) {
      setSubmitError('Enter a valid number of years in operation.')
      return
    }
    const business_website = String(fd.get('business_website') ?? '').trim()
    setIsSubmitting(true)
    try {
      await postMerchantProfile(token, {
        fullname: identity.full_name,
        email: identity.email,
        phone_number: identity.phone,
        business_name: String(fd.get('business_name') ?? '').trim(),
        business_address: String(fd.get('business_address') ?? '').trim(),
        business_country: String(fd.get('country_of_registration') ?? '').trim(),
        business_year_of_operation: years,
        business_industry: String(fd.get('industry') ?? '').trim(),
        ...(business_website ? { business_website } : {}),
      })
      dispatch(resetOnboardingProfileDrafts())
      clearStepDirty()
      completeOnboarding('merchant')
      navigate('/dashboard/merchant/overview')
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setSubmitError(err)
      } else {
        setSubmitError(err instanceof Error ? err.message : 'Could not save profile.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-[700px] lg:w-[700px]">
      <div className="flex flex-col gap-2 mb-6 lg:mb-8">
        <h3 className="text-black font-bold text-[20px]">Business Profile</h3>
        <p className="text-[#6B7488] font-normal">
          Provide your business details, financial information, and verification documents to enable access to
          receivable financing.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`flex flex-col gap-4 ${isSubmitting ? 'cursor-wait' : ''}`}
        {...formMonitorProps}
        aria-busy={isSubmitting}
      >
        <fieldset
          disabled={isSubmitting}
          className="border-0 p-0 m-0 min-w-0 grid grid-cols-1 lg:grid-cols-2 gap-x-[26px] gap-y-4 sm:gap-y-6 disabled:opacity-60 disabled:pointer-events-none"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="merchant-business-name" className="text-black">
              Business Name
            </label>
            <input
              id="merchant-business-name"
              name="business_name"
              className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
              placeholder="Enter your business name"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="merchant-industry" className="text-black">
              Industry
            </label>
            <input
              id="merchant-industry"
              name="industry"
              className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
              placeholder="Enter your industry"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="merchant-business-country" className="text-black">
              Country of Registration
            </label>
            <CountrySelect
              id="merchant-business-country"
              name="country_of_registration"
              required
              aria-label="Country of registration"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="merchant-business-address" className="text-black">
              Business Address
            </label>
            <input
              id="merchant-business-address"
              name="business_address"
              className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
              placeholder="Enter your business address"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="merchant-years-operation" className="text-black">
              Years in Operation
            </label>
            <input
              id="merchant-years-operation"
              name="years_in_operation"
              className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
              placeholder="Enter the number of years"
              type="number"
              min={0}
              step={1}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="merchant-website" className="text-black">
              Business Website (opt)
            </label>
            <input
              id="merchant-website"
              name="business_website"
              className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
              placeholder="https://....."
              type="url"
            />
          </div>
        </fieldset>

        {submitError instanceof ApiRequestError ? (
          <ApiFormErrorPanel error={submitError} />
        ) : submitError ? (
          <p className="text-red-600 text-[14px]" role="alert">
            {submitError}
          </p>
        ) : null}

        <FormSubmitLoadingNotice show={isSubmitting} message="Saving your business profile…" />

        <div className="sticky bottom-0 bg-white pt-4 lg:static lg:pt-0">
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="bg-[#195EBC] text-white px-4 py-2 rounded-md w-full disabled:opacity-60 disabled:pointer-events-none inline-flex items-center justify-center gap-2 min-h-[44px]"
          >
            {isSubmitting ? (
              <>
                <span
                  className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white border-t-transparent"
                  aria-hidden
                />
                <span>Saving…</span>
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BusinessProfileVerification
