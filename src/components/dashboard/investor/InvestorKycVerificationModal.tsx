import { useEffect, useState } from 'react'

import { deriveKycStatusFromInvestorRecord, fetchInvestorKycRecord } from '@/api/kycInvestor'
import InvestorKycVerificationStepsModal from '@/components/dashboard/investor/InvestorKycVerificationStepsModal'
import KycVerificationCompleteModal from '@/components/dashboard/kyc/KycVerificationCompleteModal'
import VerifyIdentityModal from '@/components/dashboard/kyc/VerifyIdentityModal'
import { useActiveWallet } from '@/wallet/useActiveWallet'
import { patchAuth } from '@/store/slices/authSlice'
import { setInvestorKycRecord, setKycStatus } from '@/store/slices/kycSlice'
import { refreshInvestorDashboard } from '@/store/slices/investorDashboardSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

interface InvestorKycVerificationModalProps {
  onClose: () => void
}

enum InvestorKycModalView {
  VerificationSteps = 'verification_steps',
  VerifyIdentity = 'verify_identity',
  Completed = 'completed',
}

const InvestorKycVerificationModal = ({ onClose }: InvestorKycVerificationModalProps) => {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const record = useAppSelector((s) => s.kyc.investorKycRecord)
  const kycStatus = useAppSelector((s) => s.kyc.status)
  const { isConnected } = useActiveWallet()

  const [activeView, setActiveView] = useState<InvestorKycModalView>(InvestorKycModalView.VerificationSteps)

  useEffect(() => {
    const t = accessToken?.trim()
    if (!t) return
    let cancelled = false
    void (async () => {
      try {
        const r = await fetchInvestorKycRecord(t)
        if (cancelled) return
        dispatch(setInvestorKycRecord(r))
        const next = deriveKycStatusFromInvestorRecord(r)
        dispatch(setKycStatus(next))
        dispatch(patchAuth({ kycVerified: next === 'verified' }))
      } catch {
        if (!cancelled) dispatch(setInvestorKycRecord(null))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [accessToken, dispatch])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const hasKycToken = Boolean(record?.kyc_token && String(record.kyc_token).trim())
  const kycVerified = Boolean(record?.kyc_verified)
  const kycRejected = kycStatus === 'rejected'

  const token = accessToken?.trim() ?? ''

  const handleSumsubFinished = async () => {
    if (!token) return
    try {
      const r = await fetchInvestorKycRecord(token)
      dispatch(setInvestorKycRecord(r))
      const next = deriveKycStatusFromInvestorRecord(r)
      dispatch(setKycStatus(next))
      dispatch(patchAuth({ kycVerified: next === 'verified' }))
    } catch {
      /* keep existing snapshot */
    }
    await dispatch(refreshInvestorDashboard()).unwrap().catch(() => {})
    setActiveView(InvestorKycModalView.Completed)
  }

  const handleBackToDashboard = async () => {
    await dispatch(refreshInvestorDashboard()).unwrap().catch(() => {})
    onClose()
  }

  const renderModalContent = () => {
    switch (activeView) {
      case InvestorKycModalView.VerifyIdentity:
        if (!token) {
          return (
            <div className="max-w-[620px] mx-auto text-center text-[#6B7488]">
              <p>Your session is missing an access token. Reconnect your wallet and try again.</p>
              <button type="button" className="mt-4 text-[#195EBC] font-semibold" onClick={onClose}>
                Close
              </button>
            </div>
          )
        }
        return (
          <VerifyIdentityModal
            flow="investor_identity"
            accessToken={token}
            initialSumsubToken={record?.kyc_token ?? null}
            reviewed={record?.reviewed ?? false}
            kycRejected={kycRejected}
            onBack={() => setActiveView(InvestorKycModalView.VerificationSteps)}
            onCancel={onClose}
            onSumsubFinished={handleSumsubFinished}
          />
        )
      case InvestorKycModalView.Completed:
        return <KycVerificationCompleteModal onBackToDashboard={() => void handleBackToDashboard()} />
      case InvestorKycModalView.VerificationSteps:
      default:
        return (
          <InvestorKycVerificationStepsModal
            walletConnected={isConnected}
            hasKycToken={hasKycToken}
            kycVerified={kycVerified}
            kycRejected={kycRejected}
            onVerifyIdentityClick={() => setActiveView(InvestorKycModalView.VerifyIdentity)}
          />
        )
    }
  }

  return (
    <div
      className="fixed inset-0 z-60 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-[2px] p-0 sm:p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full sm:w-[920px] sm:max-w-[95vw] bg-white rounded-t-[14px] sm:rounded-[6px] border border-[#E6E8EC] px-4 sm:px-10 py-5 sm:py-[60px] max-h-[85dvh] overflow-y-auto">
        {renderModalContent()}
      </div>
    </div>
  )
}

export default InvestorKycVerificationModal
