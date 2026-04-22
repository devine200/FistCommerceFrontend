import type { FormEvent } from 'react'
import { useState } from 'react'

import logo from '@/assets/logo.png'
import { ApiRequestError, getApiBaseUrl } from '@/api/client'
import { postInvestorProfile } from '@/api/onboardingProfile'
import ApiFormErrorPanel from '@/components/forms/ApiFormErrorPanel'
import FormSubmitLoadingNotice from '@/components/forms/FormSubmitLoadingNotice'
import { useNavigate } from 'react-router-dom'

import { completeOnboarding } from '@/state/session'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { resetOnboardingProfileDrafts } from '@/store/slices/onboardingProfileDraftSlice'

interface InvestmentExplainerProps {
    onContinue?: () => void
}

const InvestmentExplainer = ({ onContinue }: InvestmentExplainerProps) => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const accessToken = useAppSelector((s) => s.auth.accessToken)
    const draft = useAppSelector((s) => s.onboardingProfileDraft.investor)
    const [submitError, setSubmitError] = useState<ApiRequestError | string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (onContinue) {
            onContinue()
            return
        }
        setSubmitError(null)
        if (!draft) {
            navigate('/onboarding/investor/verify-identity', { replace: true })
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
        const first_name = `${draft.first_name} ${draft.last_name}`.trim()
        setIsSubmitting(true)
        try {
            await postInvestorProfile(token, {
                first_name,
                email: draft.email,
                phone_number: draft.phone,
                country: draft.country,
                date_of_birth: draft.date_of_birth,
            })
            dispatch(resetOnboardingProfileDrafts())
            completeOnboarding('investor')
            navigate('/dashboard/investor/overview')
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
        <div className="flex flex-col gap-4 w-[700px]">
            <div className="flex flex-col gap-2 mb-8">
                <img src={logo} alt="logo" className="inline-block w-[58px] h-[48px]" />
                <h3 className="text-black font-bold text-[20px]">Start Investing</h3>
                <p className="text-[#6B7488] font-normal">
                    Learn how the lending pool works, expected returns, and how your 
                    capital will be used to fund verified receivables.
                </p>
            </div>
            <form
                onSubmit={handleSubmit}
                className={`flex flex-col gap-4 text-black ${isSubmitting ? 'cursor-wait' : ''}`}
                aria-busy={isSubmitting}
            >
                <h3 className="font-bold text-[16px]">Overview</h3>
                <p className="font-normal">
                    This pool allocates investor capital to short-duration 
                    merchant receivables with an average maturity of 30–90 
                    days, deploying funds programmatically through a dedicated smart contract 
                    across verified merchants that meet predefined underwriting standards.
                </p>
                <p className="font-normal">
                    Capital is diversified across multiple receivables to reduce concentration 
                    risk, and each financed invoice is tokenized and linked to verified transactional 
                    data submitted during merchant onboarding. Borrowed funds are secured through receivable 
                    assignments, merchant credit evaluation, and where applicable, over-collateralization 
                    buffers and reserve allocations designed to absorb first-loss exposure. 
                </p>
                <p className="font-normal">
                    Risk is managed through pre-loan KYC verification, historical repayment analysis, 
                    diversification across borrowers, and audited smart contract infrastructure. 
                    In the event of delayed or failed repayment, a structured recovery process is 
                    initiated, including grace periods and enforcement mechanisms defined within 
                    receivable agreements, with reserve capital deployed before any proportional 
                    impact to pool participants. 
                </p>
                <p className="font-normal">
                    Liquidity availability and withdrawal timing are dependent on pool utilization 
                    and repayment cycles, and yield is distributed according to the predefined schedule 
                    of the pool.
                </p>
                {submitError instanceof ApiRequestError ? (
                    <ApiFormErrorPanel error={submitError} />
                ) : submitError ? (
                    <p className="text-red-600 text-[14px]" role="alert">
                        {submitError}
                    </p>
                ) : null}
                <FormSubmitLoadingNotice show={isSubmitting} message="Saving your profile…" />
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
            </form>
        </div>
    )
}

export default InvestmentExplainer