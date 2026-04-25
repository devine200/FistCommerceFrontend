import { useCallback } from 'react'

import WebSdk from '@sumsub/websdk-react'

type SumsubWebSdkPanelProps = {
  accessToken: string
  onFinished: () => void
  onError: (message: string) => void
  /**
   * Sumsub calls this when the iframe token expires. Production usually needs a dedicated refresh endpoint.
   * Until then we reject so the user can go back and restart the upload step.
   */
  getNewAccessToken?: () => Promise<string>
}

/**
 * Embeds Sumsub WebSDK. Listens for `idCheck.onApplicantSubmitted` to signal the user finished the SDK flow.
 */
export default function SumsubWebSdkPanel({
  accessToken,
  onFinished,
  onError,
  getNewAccessToken,
}: SumsubWebSdkPanelProps) {
  const expirationHandler = useCallback(() => {
    if (getNewAccessToken) {
      return getNewAccessToken()
    }
    return Promise.reject(
      new Error('Your verification session expired. Please go back and upload your documents again.'),
    )
  }, [getNewAccessToken])

  return (
    <div className="w-full min-h-[420px] rounded-[10px] border border-[#E3E7EF] overflow-hidden bg-[#FAFBFD]">
      <WebSdk
        accessToken={accessToken}
        expirationHandler={expirationHandler}
        options={{ adaptIframeHeight: true }}
        onMessage={(type: string) => {
          if (type === 'idCheck.onApplicantSubmitted') {
            onFinished()
          }
        }}
        onError={(err: { code?: string; error?: string; message?: string }) => {
          const msg =
            typeof err?.message === 'string' && err.message.trim()
              ? err.message.trim()
              : typeof err?.error === 'string' && err.error.trim()
                ? err.error.trim()
                : 'Verification could not be completed.'
          onError(msg)
        }}
      />
    </div>
  )
}
