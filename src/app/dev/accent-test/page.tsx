// Safe test route for accent system
// No bootstrap script, no layout injection
// Uses dynamic imports with SSR disabled
import { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const metadata: Metadata = {
  title: 'Accent System Test',
  robots: { index: false, follow: false },
}

// Dynamic import with SSR disabled
const AccentSelectorClient = dynamic(
  () => import('@/components/AccentSelectorClient').then(mod => ({ default: mod.AccentSelectorClient })),
  { ssr: false }
)

const AccentPreview = dynamic(
  () => import('@/components/AccentSelectorClient').then(mod => ({ default: mod.AccentPreview })),
  { ssr: false }
)

export default function AccentTestPage() {
  return (
    <div className="min-h-screen bg-[var(--pf-bg)] text-[var(--pf-text)] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium mb-4">
            ⚠️ DEV TEST PAGE
          </div>
          <h1 className="text-3xl font-bold mb-2">Accent System Test</h1>
          <p className="text-[var(--pf-text-muted)]">
            Safe isolation for testing accent color system. 
            No production routes affected.
          </p>
        </div>

        {/* Status */}
        <div className="mb-8 p-4 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)]">
          <h2 className="font-semibold mb-2">Test Status</h2>
          <ul className="space-y-1 text-sm text-[var(--pf-text-secondary)]">
            <li>✅ Phase 1: CSS variables in globals.css</li>
            <li>⏳ Phase 2: AccentProvider (if stable)</li>
            <li>⏳ Phase 3: AccentSelector (if stable)</li>
            <li>⏳ Phase 4: Bootstrap script (if safe)</li>
          </ul>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-border)]">
            <AccentSelectorClient />
          </div>
          
          <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-border)]">
            <AccentPreview />
            
            <div className="mt-6 p-4 rounded-lg bg-[var(--pf-bg)] border border-[var(--pf-border)]">
              <h3 className="font-medium mb-2">Expected Behavior</h3>
              <ul className="space-y-1 text-sm text-[var(--pf-text-muted)]">
                <li>• Slider moves smoothly</li>
                <li>• Presets apply instantly</li>
                <li>• Selection persists in localStorage</li>
                <li>• No hydration warnings</li>
                <li>• No 500 errors</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CSS Variable Debug */}
        <div className="mt-8 p-4 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)]">
          <h2 className="font-semibold mb-4">CSS Variables</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded bg-[var(--pf-bg)]">
              <div className="text-[var(--pf-text-muted)] mb-1">--accent</div>
              <div className="w-full h-8 rounded" style={{ backgroundColor: 'var(--accent)' }} />
            </div>
            <div className="p-3 rounded bg-[var(--pf-bg)]">
              <div className="text-[var(--pf-text-muted)] mb-1">--accent-soft</div>
              <div className="w-full h-8 rounded" style={{ backgroundColor: 'var(--accent-soft)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
