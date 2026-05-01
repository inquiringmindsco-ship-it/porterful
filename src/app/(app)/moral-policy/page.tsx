import Link from 'next/link'
import { Shield, Music, Mic, Users, Heart, Ban } from 'lucide-react'

export default function MoralPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--pf-bg)] text-white py-16">
      <div className="pf-container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pf-orange)]/20 rounded-full text-[var(--pf-orange)] text-sm font-medium mb-6">
            <Shield size={16} />
            Our Promise to Artists
          </div>
          <h1 className="text-4xl font-bold mb-4">
            No AI Voices. Period.
          </h1>
          <p className="text-xl text-[var(--pf-text-secondary)]">
            Real artists. Real voices. Real music.
          </p>
        </div>

        {/* Core Belief */}
        <div className="pf-card p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Why We Don't Allow AI Voices</h2>
          <p className="text-[var(--pf-text-secondary)] mb-6">
            The music industry is already rigged against artists. Streaming pays fractions of a cent. 
            Labels take 80-90%. Now AI wants to replace artists entirely.
          </p>
          <p className="text-[var(--pf-text-secondary)] mb-6">
            We built Porterful to <strong className="text-white">empower artists</strong>, not replace them.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                <Music className="text-green-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">✅ Beats & Production</h3>
                <p className="text-sm text-[var(--pf-text-muted)]">
                  AI tools for beats and production are allowed. They help artists create faster 
                  without replacing the human element.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                <Mic className="text-red-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">❌ AI Vocal Replacement</h3>
                <p className="text-sm text-[var(--pf-text-muted)]">
                  No AI-generated vocals, voice cloning, or replacing human artists with AI voices.
                  This is non-negotiable.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* The Line */}
        <div className="pf-card p-8 mb-8 border-l-4 border-[var(--pf-orange)]">
          <h2 className="text-2xl font-bold mb-4">Where We Draw the Line</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                <Music size={18} />
                Allowed
              </h3>
              <ul className="space-y-2 text-[var(--pf-text-secondary)]">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  AI beat makers and production tools
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  Sample libraries and sound packs
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  AI-assisted mixing and mastering
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  Human artists using AI as a tool
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                <Ban size={18} />
                Not Allowed
              </h3>
              <ul className="space-y-2 text-[var(--pf-text-secondary)]">
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  AI-generated vocals impersonating artists
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  Voice cloning without consent
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  Fully AI "artists" with no human behind them
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  Replacing real singers with AI voices
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Why It Matters */}
        <div className="pf-card p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Why This Matters</h2>
          <div className="space-y-4 text-[var(--pf-text-secondary)]">
            <p>
              <strong className="text-white">Artists are already struggling.</strong> The average musician 
              earns less than $0.003 per stream. They can't pay rent. They're working day jobs. 
              The last thing they need is AI replacing them entirely.
            </p>
            <p>
              <strong className="text-white">Voice is identity.</strong> An artist's voice is their signature, 
              their story, their soul. It's not just sound — it's them. Using AI to copy that without permission 
              is theft of identity.
            </p>
            <p>
              <strong className="text-white">We're building a different path.</strong> Porterful exists to 
              give artists a fair shot. Direct support from fans. the majority of every sale goes to the artist. 
              No middleman. No exploitation.
            </p>
          </div>
        </div>

        {/* Enforcement */}
        <div className="pf-card p-8 mb-8 bg-[var(--pf-orange)]/10 border-[var(--pf-orange)]">
          <h2 className="text-2xl font-bold mb-4">How We Enforce This</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--pf-orange)]/20 flex items-center justify-center shrink-0 text-[var(--pf-orange)] font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold">Artist Verification</h3>
                <p className="text-sm text-[var(--pf-text-muted)]">
                  Every artist is verified. We confirm they're a real person behind the music.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--pf-orange)]/20 flex items-center justify-center shrink-0 text-[var(--pf-orange)] font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold">Community Reporting</h3>
                <p className="text-sm text-[var(--pf-text-muted)]">
                  Listeners can report AI voice content. We investigate every report.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--pf-orange)]/20 flex items-center justify-center shrink-0 text-[var(--pf-orange)] font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold">Account Termination</h3>
                <p className="text-sm text-[var(--pf-text-muted)]">
                  Artists found using AI vocals to deceive listeners will be permanently removed 
                  and forfeit all earnings.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* The Promise */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--pf-orange)] rounded-full text-white font-semibold">
            <Heart className="text-white" size={20} />
            Real Artists. Real Voices. Real Music.
          </div>
          <p className="text-[var(--pf-text-muted)] mt-6 max-w-xl mx-auto">
            Porterful was built by artists, for artists. We will never compromise on that.
            If you're an artist who believes in authentic music, you're home.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Link href="/" className="pf-btn pf-btn-primary">
              Back to Home
            </Link>
            <Link href="/signup?role=artist" className="pf-btn pf-btn-secondary">
              Join as Artist
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}