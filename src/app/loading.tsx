import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--pf-bg)]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--pf-orange)]" />
        <p className="text-[var(--pf-text-secondary)] text-sm">Loading...</p>
      </div>
    </div>
  )
}
