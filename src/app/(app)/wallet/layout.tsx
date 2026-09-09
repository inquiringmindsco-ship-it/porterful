import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wallet - Your Balance',
  description: 'View your Porterful wallet, balance, and transaction history.',
  robots: { index: false, follow: false },
}

export default function WalletLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
