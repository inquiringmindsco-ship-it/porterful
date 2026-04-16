import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout | Porterful',
  description: 'Complete your purchase securely. Support independent artists.',
  robots: 'noindex',
}

// This layout must pass children through so the parent (app)/layout.tsx
// can wrap them with Navbar + Footer + GlobalPlayer
export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
