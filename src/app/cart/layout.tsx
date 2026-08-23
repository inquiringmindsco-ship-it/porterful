import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Cart | Porterful',
  description: 'Review your cart and proceed to checkout. Support independent artists with every purchase.',
  robots: { index: false, follow: true },
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
