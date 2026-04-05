import { Link } from 'react-router-dom'
import clsx from 'clsx'

import logo from '@/assets/logo.png'

type FistCommerceLogoProps = {
  className?: string
  /**
   * `onDark` — default header on navy (logo reads as brand blue).
   * `onLight` — light backgrounds (same asset; add subtle contrast if needed).
   */
  variant?: 'onDark' | 'onLight'
}

/** Fist Commerce mark — same asset used across dashboard and onboarding. */
export function FistCommerceLogo({ className, variant = 'onDark' }: FistCommerceLogoProps) {
  return (
    <Link
      to="/"
      className={clsx(
        'inline-flex shrink-0 items-center no-underline transition-opacity hover:opacity-90',
        className
      )}
      aria-label="Fist Commerce home"
    >
      <img
        src={logo}
        alt=""
        width={120}
        height={48}
        className={clsx(
          'h-9 w-auto object-contain object-left sm:h-10',
          variant === 'onDark' && 'drop-shadow-[0_1px_12px_rgba(56,189,248,0.15)]'
        )}
      />
    </Link>
  )
}
