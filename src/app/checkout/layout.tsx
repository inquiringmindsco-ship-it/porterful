import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout - Secure Purchase',
  description: 'Complete your purchase securely. Support independent artists with every purchase.',
  keywords: ['checkout', 'purchase', 'buy music', 'secure payment'],
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}