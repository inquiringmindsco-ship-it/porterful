import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your Porterful control panel.',
  keywords: ['dashboard', 'porterful'],
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}