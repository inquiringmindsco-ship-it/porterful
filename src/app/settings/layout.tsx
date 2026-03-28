import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings - Account Settings',
  description: 'Manage your Porterful account settings, profile, and preferences.',
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}