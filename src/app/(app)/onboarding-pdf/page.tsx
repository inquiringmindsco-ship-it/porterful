import type { Metadata } from 'next';
import './pdf.css';

// ⚠️  REPLACE THIS WITH YOUR ACTUAL DISCORD INVITE LINK
// e.g. https://discord.gg/XXXXX
const DISCORD_INVITE_URL = 'https://discord.gg/nqHT6rEP';

const PILOT_ROLES = [
  {
    id: 'artist',
    label: 'Artist',
    icon: '🎤',
    color: '#FF6B00',
    porterfulSteps: [
      '<a href="https://porterful.com/signup" target="_blank">Sign up at porterful.com</a>',
      'Go to Settings → upload a photo and write your bio',
      'Go to Dashboard → Upload to add music or merch',
      'Set your prices — you can change them anytime',
      'Share your Porterful link in your social bios',
      'Reply to this message with your portfolio link so we can verify you',
    ],
  },
  {
    id: 'business',
    label: 'Business',
    icon: '🏪',
    color: '#3B82F6',
    porterfulSteps: [
      '<a href="https://porterful.com/signup" target="_blank">Sign up at porterful.com</a>',
      'Go to Settings → add your business name and logo',
      'Go to Dashboard → Choose Products to pick what to sell',
      'Set your prices and fill in product details',
      'Share your Porterful link wherever you sell',
    ],
  },
  {
    id: 'brand',
    label: 'Brand',
    icon: '💼',
    color: '#10B981',
    porterfulSteps: [
      '<a href="https://porterful.com/signup" target="_blank">Sign up at porterful.com</a>',
      'Go to Settings → add your brand name and logo',
      '<a href="https://porterful.com/artists" target="_blank">Browse porterful.com/artists</a> to find artists you want to sponsor',
      'Message us in #feedback to set up a sponsorship deal',
    ],
  },
  {
    id: 'fan',
    label: 'Supporter / Fan',
    icon: '❤️',
    color: '#A855F7',
    porterfulSteps: [
      '<a href="https://porterful.com/signup" target="_blank">Sign up at porterful.com</a>',
      'Browse porterful.com — find artists you want to support',
      'Make your first purchase',
      'Optional: go to Dashboard → Superfan to get your referral link and start earning',
    ],
  },
];

const DISCORD_STEPS = [
  'Open Discord or download it at <a href="https://discord.com" target="_blank">discord.com</a>',
  `Click your invite link: <a href="${DISCORD_INVITE_URL}" target="_blank" class="link">Join the Porterful server</a>`,
  'Accept the invite to the Porterful pilot server',
  'In any channel, type <span class="code">/verify</span> and press Enter',
  'Click the server name (top left) → Notifications → turn on all messages for this server',
];

export default function PilotOnboardingPDFPage() {
  return (
    <div className="pdf-page">
      {/* HEADER */}
      <header className="pdf-header">
        <div className="logo">PORTERFUL</div>
        <div className="header-tag">Pilot Onboarding</div>
      </header>

      {/* HERO */}
      <section className="pdf-hero">
        <h1>Welcome to the<br />Porterful Pilot. 🚀</h1>
        <p className="hero-sub">
          Three steps and you&apos;re in. Follow yours below. When you need help, post in the channel — we read everything.
        </p>
      </section>

      {/* STEP 1 — DISCORD */}
      <section className="pdf-section">
        <div className="step-label">Step 1</div>
        <h2>Join Our Discord</h2>
        <div className="discord-grid">
          <div className="discord-steps">
            {DISCORD_STEPS.map((step, i) => (
              <div key={i} className="discord-step">
                <div className="discord-num">{i + 1}</div>
                <p dangerouslySetInnerHTML={{ __html: step }} />
              </div>
            ))}
          </div>
          <div className="discord-note">
            <p className="note-title">⚠️ Turn on notifications</p>
            <p>We communicate exclusively through Discord during the pilot. Missed messages = missed updates, bug fixes, and feature drops.</p>
          </div>
        </div>
      </section>

      {/* STEP 2 — PORTERFUL PROFILE */}
      <section className="pdf-section">
        <div className="step-label">Step 2</div>
        <h2>Set Up Your Porterful Profile</h2>
        <div className="porterful-grid">
          {PILOT_ROLES.map((role) => (
            <div key={role.id} className="porterful-card">
              <div className="porterful-header">
                <span>{role.icon}</span>
                <span className="porterful-label" style={{ color: role.color }}>{role.label}</span>
              </div>
              <div className="porterful-steps">
                {role.porterfulSteps.map((step, i) => (
                  <div key={i} className="porterful-step">
                    <span className="porterful-num" style={{ color: role.color }}>{i + 1}</span>
                    <p dangerouslySetInnerHTML={{ __html: step }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STEP 3 — PILOT RULES */}
      <section className="pdf-section">
        <div className="step-label">Step 3</div>
        <h2>Pilot Rules</h2>
        <div className="rules-grid">
          <div className="rule green">
            <p className="rule-title">✔ All Good</p>
            <p>Keep your art, data, and earnings — you own what you upload</p>
          </div>
          <div className="rule green">
            <p className="rule-title">✔ Free to Join</p>
            <p>No monthly fees, no listing costs</p>
          </div>
          <div className="rule yellow">
            <p className="rule-title">⚠ Attention</p>
            <p>12-month non-compete — don&apos;t build a competing platform</p>
          </div>
          <div className="rule red">
            <p className="rule-title">🚫 Private</p>
            <p>No beta screenshots outside this server</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pdf-footer">
        <div className="footer-logo">PORTERFUL</div>
        <div className="footer-links">
          <a href="https://porterful.com" target="_blank" className="footer-link">porterful.com</a>
          <span>support@porterful.com</span>
        </div>
        <p className="footer-tagline">Your feedback shapes what we build.</p>
      </footer>
    </div>
  );
}
