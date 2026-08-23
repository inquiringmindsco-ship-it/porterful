import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout | Porterful',
  description: 'Complete your purchase and support independent artists.',
  robots: { index: false, follow: true },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
