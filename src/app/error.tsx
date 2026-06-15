'use client'

import { MaintenanceNotice } from '@/components/MaintenanceNotice'

export default function ErrorPage({ reset }: { error?: Error; reset?: () => void }) {
  return <MaintenanceNotice onRetry={reset} />
}
