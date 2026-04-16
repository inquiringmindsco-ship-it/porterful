import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - Your Artist Hub',
  description: 'Your Porterful artist dashboard. Manage your music, merchandise, sales, and fans all in one place.',
  keywords: ['artist dashboard', 'music management', 'merch management', 'artist tools', 'music sales'],
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}