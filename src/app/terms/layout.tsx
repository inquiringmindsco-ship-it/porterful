import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Porterful terms of service. Rules and guidelines for using the platform.',
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}