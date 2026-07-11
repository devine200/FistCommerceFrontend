/** Onboarding connect-wallet step — chain switch is handled on Continue, not by the global enforcer. */
export function isOnboardingConnectWalletPath(pathname: string): boolean {
  return /^\/onboarding\/(investor|merchant)\/connect-wallet\/?$/.test(pathname)
}

export function onboardingConnectWalletPath(role: 'investor' | 'merchant'): string {
  return `/onboarding/${role}/connect-wallet`
}
