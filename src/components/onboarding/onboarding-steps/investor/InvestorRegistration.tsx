import type { FormEvent } from 'react'

import logo from '@/assets/logo.png'
import CountrySelect from '@/components/forms/CountrySelect'
import { useNavigate } from 'react-router-dom'

import { useOnboardingFormStep } from '@/hooks/useOnboardingFormStep'
import { unlockAfterVerifyIdentity } from '@/state/session'
import { useAppDispatch } from '@/store/hooks'
import { RootState } from '@/store'
import { setInvestorOnboardingProfileDraft } from '@/store/slices/onboardingProfileDraftSlice'
import { useSelector } from 'react-redux'
import { isValidPhoneNumber, PHONE_VALIDITY_HINT } from '@/utils/phoneNumber'

const INVESTOR_VERIFY_STEP_INDEX = 2

const InvestorRegistration = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { address } = useSelector((state: RootState) => state.wallet)
  const { formMonitorProps, clearStepDirty } = useOnboardingFormStep('investor', INVESTOR_VERIFY_STEP_INDEX)

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
      setInvestorOnboardingProfileDraft({
        first_name: String(fd.get('first_name') ?? '').trim(),
        last_name: String(fd.get('last_name') ?? '').trim(),
        phone: String(fd.get('phone') ?? '').trim(),
        email: String(fd.get('email') ?? '').trim(),
        country: String(fd.get('country') ?? '').trim(),
        date_of_birth: String(fd.get('date_of_birth') ?? '').trim(),
      }),
    )
    clearStepDirty()
    unlockAfterVerifyIdentity('investor')
    navigate('/onboarding/investor/investment-explainer')
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-[700px] lg:w-[700px]">
      <div className="flex flex-col gap-2 mb-6 lg:mb-8">
        {/* Mobile uses the layout header/stepper */}
        <img src={logo} alt="logo" className="hidden lg:inline-block w-[58px] h-[48px]" />
        <h3 className="text-black font-bold text-[20px]">Verify Your identity</h3>
        <p className="text-[#6B7488] font-normal">
          Your information has been automatically filled with your wallet information. Please review and confirm
          the details to proceed with verification.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" {...formMonitorProps}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[26px] gap-y-4 sm:gap-y-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="investor-first-name" className="text-black">
              First Name
            </label>
            <input
              id="investor-first-name"
              name="first_name"
              className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
              placeholder="Enter your first name"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="investor-last-name" className="text-black">
              Last Name
            </label>
            <input
              id="investor-last-name"
              name="last_name"
              className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
              placeholder="Enter your last name"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="investor-phone" className="text-black">
              Phone Number
            </label>
            <input
              id="investor-phone"
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
            <label htmlFor="investor-email" className="text-black">
              Email Address
            </label>
            <input
              id="investor-email"
              name="email"
              className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
              placeholder="Enter your email address"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="investor-country" className="text-black">
              Country of Residence
            </label>
            <CountrySelect id="investor-country" name="country" required aria-label="Country of residence" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="investor-dob" className="text-black">
              Date of Birth
            </label>
            <input
              id="investor-dob"
              name="date_of_birth"
              className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
              type="date"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="investor-wallet" className="text-black">
              Wallet Address
            </label>
            <input
              id="investor-wallet"
              name="wallet_address"
              className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
              defaultValue={address ?? ''}
              disabled
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="investor-network" className="text-black">
              Network
            </label>
            <input
              id="investor-network"
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

export default InvestorRegistration
