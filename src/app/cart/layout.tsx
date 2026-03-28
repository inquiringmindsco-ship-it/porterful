import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cart - Your Shopping Cart',
  description: 'Review your cart before checkout. Support independent artists by purchasing music and merchandise.',
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}