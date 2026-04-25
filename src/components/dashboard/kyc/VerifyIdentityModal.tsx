import { useMemo, useRef, useState, type DragEvent } from 'react'

import backArrowIcon from '@/assets/ph_arrow-left.png'
import cloudUploadIcon from '@/assets/cloud-upload.png'
import {
  postInvestorKycIdentityForSumsub,
} from '@/api/kycInvestor'
import { postMerchantKycIdentityForSumsub, postMerchantKycInsuranceForSumsub } from '@/api/kycMerchant'
import { ApiRequestError, formatApiRequestErrorPlain } from '@/api/client'
import SumsubWebSdkPanel from '@/components/dashboard/kyc/SumsubWebSdkPanel'

export type KycVerifyIdentityFlow = 'investor_identity' | 'merchant_identity' | 'merchant_insurance'

type VerifyIdentityModalProps = {
  flow: KycVerifyIdentityFlow
  accessToken: string
  /** When present and `reviewed === false`, skip upload UI and open Sumsub directly. */
  initialSumsubToken?: string | null
  /** From GET `kyc_record.reviewed` */
  reviewed?: boolean
  /** Safety: never auto-jump on rejected flows. */
  kycRejected?: boolean
  onBack: () => void
  onCancel: () => void
  /** Called after Sumsub reports applicant submitted (parent refetches KYC / navigates). */
  onSumsubFinished: () => void | Promise<void>
}

const copy: Record<
  KycVerifyIdentityFlow,
  { title: string; subtitle: string; uploadHeading: string; uploadHint: string }
> = {
  investor_identity: {
    title: 'Verify Your Identity',
    subtitle:
      'Upload a valid government ID, then continue to Sumsub to complete face verification and confirm your identity.',
    uploadHeading: 'Upload your government ID',
    uploadHint: 'List of accepted government IDs is provided during Sumsub verification.',
  },
  merchant_identity: {
    title: 'Verify Your Identity',
    subtitle:
      'Upload a valid government ID for the business representative, then complete verification in Sumsub.',
    uploadHeading: 'Upload representative government ID',
    uploadHint: 'List of accepted government IDs is provided during Sumsub verification.',
  },
  merchant_insurance: {
    title: 'Verify Insurance',
    subtitle: 'Upload your business insurance certificate, then continue to Sumsub to complete this step.',
    uploadHeading: 'Upload insurance certificate',
    uploadHint: 'PDF or image formats accepted unless your policy states otherwise.',
  },
}

const VerifyIdentityModal = ({
  flow,
  accessToken,
  initialSumsubToken,
  reviewed,
  kycRejected,
  onBack,
  onCancel,
  onSumsubFinished,
}: VerifyIdentityModalProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const shouldAutoJumpToSumsub = useMemo(() => {
    const t = typeof initialSumsubToken === 'string' ? initialSumsubToken.trim() : ''
    if (!t) return false
    if (kycRejected) return false
    return reviewed === false
  }, [initialSumsubToken, kycRejected, reviewed])

  const [phase, setPhase] = useState<'upload' | 'sumsub'>(shouldAutoJumpToSumsub ? 'sumsub' : 'upload')
  const [sumsubToken, setSumsubToken] = useState<string | null>(
    shouldAutoJumpToSumsub ? (initialSumsubToken ?? null) : null,
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const labels = copy[flow]

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (file: File | null) => {
    if (!file) return
    setSelectedFile(file)
    setError(null)
  }

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0] ?? null
    handleFileSelect(file)
  }

  const postForFlow = async (file: File) => {
    if (flow === 'investor_identity') {
      return postInvestorKycIdentityForSumsub(accessToken, file)
    }
    if (flow === 'merchant_identity') {
      return postMerchantKycIdentityForSumsub(accessToken, file)
    }
    return postMerchantKycInsuranceForSumsub(accessToken, file)
  }

  const handleContinue = async () => {
    if (!selectedFile) {
      setError('Please choose a file to upload.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const { sumsubAccessToken } = await postForFlow(selectedFile)
      setSumsubToken(sumsubAccessToken)
      setPhase('sumsub')
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(formatApiRequestErrorPlain(err))
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Upload failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (phase === 'sumsub' && sumsubToken) {
    return (
      <div className="max-w-[620px] mx-auto">
        <div className="flex items-start gap-3 mb-3">
          <button type="button" onClick={onBack} className="h-[40px] w-[40px] flex items-center justify-center shrink-0">
            <img src={backArrowIcon} alt="back" className="w-[24px] h-[24px] object-contain" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-black font-bold text-[20px] sm:text-[26px]">{labels.title}</h2>
            <p className="text-[#6B7488] text-[13px] sm:text-[16px] mt-1">Complete verification in the secure window below.</p>
          </div>
        </div>
        {error ? <p className="text-red-600 text-sm mb-2">{error}</p> : null}
        <SumsubWebSdkPanel
          accessToken={sumsubToken}
          onFinished={() => {
            void Promise.resolve(onSumsubFinished()).catch(() => {
              /* parent handles */
            })
          }}
          onError={(msg) => setError(msg)}
        />
        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md border border-[#C9CFDA] text-[#374151] text-[14px]">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[620px] mx-auto">
      <div className="flex items-start gap-3 mb-3">
        <button type="button" onClick={onBack} className="h-[40px] w-[40px] flex items-center justify-center shrink-0">
          <img src={backArrowIcon} alt="back" className="w-[24px] h-[24px] object-contain" />
        </button>
        <div className="flex flex-col flex-1 min-w-0">
          <h2 className="text-black font-bold text-[20px] sm:text-[26px]">{labels.title}</h2>
          <p className="text-[#6B7488] text-[13px] sm:text-[16px] mt-1">{labels.subtitle}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <h3 className="text-black font-bold text-[14px] sm:text-[16px]">{labels.uploadHeading}</h3>
        <p className="text-[#6B7488] text-[13px] sm:text-[16px]">{labels.uploadHint}</p>

        <div
          className={`border border-dashed rounded-[10px] bg-[#FAFBFD] ${isDragging ? 'border-[#195EBC]' : 'border-[#C9CFDA]'}`}
          onDragOver={onDragOver}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center text-center">
            <img src={cloudUploadIcon} alt="cloud upload" className="w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] object-contain" />

            <p className="mt-3 text-[16px]">
              <button type="button" onClick={openFilePicker} className="text-[#195EBC] font-semibold">
                Click to upload
              </button>{' '}
              <span className="text-[#6B7488]">or drag and drop</span>
            </p>

            <p className="mt-1 text-[12px] text-[#A0A8B8]">SVG, PNG, JPG, GIF or PDF when supported</p>
            {selectedFile && <p className="mt-2 text-[12px] text-[#195EBC]">{selectedFile.name}</p>}
          </div>

          <div className="border-t border-[#E3E7EF] px-4 sm:px-6 py-4 flex flex-col items-center gap-2">
            <span className="text-[#A0A8B8] text-[12px]">OR</span>
            <button type="button" onClick={openFilePicker} className="bg-[#195EBC] text-white px-5 py-2 rounded-md text-[14px]">
              Browse files
            </button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".svg,.png,.jpg,.jpeg,.gif,.pdf,image/svg+xml,image/png,image/jpeg,image/gif,application/pdf"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
      />

      {error ? <p className="mt-3 text-red-600 text-sm">{error}</p> : null}

      <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-5 py-3 rounded-md border border-[#C9CFDA] text-[#374151] text-[15px] font-semibold"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-5 py-3 rounded-md border border-[#C9CFDA] text-[#374151] text-[15px] font-semibold"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={submitting || !selectedFile}
          onClick={() => void handleContinue()}
          className="w-full sm:w-auto bg-[#195EBC] text-white px-5 py-3 rounded-md text-[15px] sm:text-[16px] font-semibold disabled:opacity-50"
        >
          {submitting ? 'Uploading…' : 'Continue'}
        </button>
      </div>
    </div>
  )
}

export default VerifyIdentityModal
