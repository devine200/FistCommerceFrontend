import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { useOnboardingFormStep } from '@/hooks/useOnboardingFormStep'
import { unlockAfterVerifyIdentity } from '@/state/session'
import { useAppDispatch } from '@/store/hooks'
import { RootState } from '@/store'
import { setMerchantIdentityDraft } from '@/store/slices/onboardingProfileDraftSlice'
import { useSelector } from 'react-redux'
import { isValidPhoneNumber, PHONE_VALIDITY_HINT } from '@/utils/phoneNumber'

const MERCHANT_VERIFY_STEP_INDEX = 2

const MerchantIdVerification = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { address } = useSelector((state: RootState) => state.wallet)
  const { formMonitorProps, clearStepDirty } = useOnboardingFormStep('merchant', MERCHANT_VERIFY_STEP_INDEX)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const phoneEl = form.elements.namedItem('phone') as HTMLInputElement | null
    if (phoneEl) {
      if (!isValidPhoneNumber(phoneEl.value)) {
        phoneEl.setCustomValidity(PHONE_VALIDITY_HINT)
        phoneEl.reportValidity()
        return
      }
      phoneEl.setCustomValidity('')
    }
    const fd = new FormData(form)
    dispatch(
      setMerchantIdentityDraft({
        full_name: String(fd.get('full_name') ?? '').trim(),
        phone: String(fd.get('phone') ?? '').trim(),
        email: String(fd.get('email') ?? '').trim(),
      }),
    )
    clearStepDirty()
    unlockAfterVerifyIdentity('merchant')
    navigate('/onboarding/merchant/business-profile')
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-[700px] lg:w-[700px]">
      <div className="flex flex-col gap-2 mb-6 lg:mb-8">
        <h3 className="text-black font-bold text-[20px]">Verify Your Identity</h3>
        <p className="text-[#6B7488] font-normal">
          Your information has been automatically filled with your wallet information. Please review and confirm
          the details to proceed with verification.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" {...formMonitorProps}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[26px] gap-y-4 sm:gap-y-6">
          <div className="flex flex-col gap-2 lg:col-span-2">
            <label htmlFor="merchant-full-name" className="text-black">
              Full Name
            </label>
            <input
              id="merchant-full-name"
              name="full_name"
              className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="merchant-phone" className="text-black">
              Phone Number
            </label>
            <input
              id="merchant-phone"
              name="phone"
              className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
              placeholder="+1 234 567 8900"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              title={PHONE_VALIDITY_HINT}
              onInput={(ev) => ev.currentTarget.setCustomValidity('')}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="merchant-email" className="text-black">
              Email Address
            </label>
            <input
              id="merchant-email"
              name="email"
              className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
              placeholder="Enter your email address"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="merchant-wallet" className="text-black">
              Wallet Address
            </label>
            <input
              id="merchant-wallet"
              name="wallet_address"
              className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
              placeholder="Enter your wallet address"
              defaultValue={address ?? ''}
              disabled
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="merchant-network" className="text-black">
              Network
            </label>
            <input
              id="merchant-network"
              name="network"
              className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
              defaultValue="Arbitrum One"
              disabled
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white pt-4 lg:static lg:pt-0">
          <button type="submit" className="bg-[#195EBC] text-white px-4 py-2 rounded-md w-full">
            Continue
          </button>
        </div>
      </form>
    </div>
  )
}

export default MerchantIdVerification
