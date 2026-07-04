import { useEffect, useRef } from 'react'

import { DiditSdk } from '@didit-protocol/sdk-web'

type DiditVerificationPanelProps = {
  verificationUrl: string
  onFinished: () => void
  onError: (message: string) => void
}

/**
 * Launches Didit verification via the Web SDK modal.
 * Final approval is confirmed by backend webhook — onComplete is a UX signal only.
 */
export default function DiditVerificationPanel({
  verificationUrl,
  onFinished,
  onError,
}: DiditVerificationPanelProps) {
  const onFinishedRef = useRef(onFinished)
  const onErrorRef = useRef(onError)
  onFinishedRef.current = onFinished
  onErrorRef.current = onError

  useEffect(() => {
    const sdk = DiditSdk.shared
    sdk.onComplete = (result) => {
      if (result.type === 'completed') {
        onFinishedRef.current()
        return
      }
      if (result.type === 'cancelled') {
        onErrorRef.current('Verification was cancelled. You can try again when ready.')
        return
      }
      const msg =
        typeof result.error?.message === 'string' && result.error.message.trim()
          ? result.error.message.trim()
          : 'Verification could not be completed.'
      onErrorRef.current(msg)
    }

    sdk.startVerification({ url: verificationUrl })

    return () => {
      sdk.onComplete = undefined
      sdk.close()
    }
  }, [verificationUrl])

  return (
    <div className="w-full min-h-[420px] rounded-[10px] border border-[#E3E7EF] overflow-hidden bg-[#FAFBFD] flex items-center justify-center px-6 py-10">
      <p className="text-[#6B7488] text-[14px] sm:text-[16px] text-center">
        Complete verification in the Didit window. If it did not open, check your popup blocker and try again.
      </p>
    </div>
  )
}
