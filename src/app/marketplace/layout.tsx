import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Marketplace — Official Merch | Porterful',
  description: 'Official Porterful merchandise. Apparel, tech, home goods and more. Your purchase supports independent artists.',
  openGraph: {
    title: 'Marketplace | Porterful',
    description: 'Official Porterful merchandise — apparel, tech, home goods and more.',
    type: 'website',
  },
}

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}