import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wallet - Your Balance',
  description: 'View your Porterful wallet, balance, and transaction history.',
}

export default function WalletLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}