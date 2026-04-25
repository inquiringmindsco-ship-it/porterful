// Safe dynamic import for accent components
// SSR disabled to prevent hydration issues
'use client'

import dynamic from 'next/dynamic'

// Dynamic import with SSR disabled
// This prevents any server/client mismatch during hydration
export const AccentSelector = dynamic(
  () => import('./AccentSelectorClient').then(mod => ({ default: mod.AccentSelectorClient })),
  { ssr: false }
)

// Dynamic preview component
export const AccentPreview = dynamic(
  () => import('./AccentSelectorClient').then(mod => ({ default: mod.AccentPreview })),
  { ssr: false }
)
