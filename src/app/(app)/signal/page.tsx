import { SignalShirtViewer } from '@/components/signal/SignalShirtViewer'

export const metadata = {
  title: 'Signal Shirt — LIKENESS',
  description: 'Wear your signal. Let people tap in.',
}

export default function SignalPage() {
  return (
    <div className="min-h-screen bg-[#090909] pt-20 text-white">
      <SignalShirtViewer />
    </div>
  )
}
