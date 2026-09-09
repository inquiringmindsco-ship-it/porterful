import type { Metadata } from 'next'
import PrivacyContent from './privacy/page'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Porterful collects, uses, and protects personal information.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return <PrivacyContent />
}
