import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resources - Artist Resources',
  description: 'Resources for Porterful artists. Tips, guides, and tools to help you succeed.',
}

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}