import type { Metadata } from 'next'
import FaqContent from './faq/page'

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions',
  description: 'Frequently asked questions about Porterful, music, merchandise, payments, and support.',
  alternates: { canonical: '/faq' },
}

export default function FaqPage() {
  return <FaqContent />
}
