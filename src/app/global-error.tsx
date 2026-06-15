'use client'

import { MaintenanceNotice } from '@/components/MaintenanceNotice'

export default function GlobalError({ reset }: { error?: Error; reset: () => void }) {
  return <html><body><MaintenanceNotice onRetry={reset} /></body></html>
}
