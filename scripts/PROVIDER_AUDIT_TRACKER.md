# Provider Audit List — Hydration Risk Tracking

This file tracks high-risk hydration surfaces for future review.

## Status: PENDING AUDIT

### Tier 1 — High Risk (known hydration surfaces)
- [ ] `ThemeProvider` (`src/lib/theme-context.tsx`) — DOM manipulation on mount, theme class switching
- [ ] `GlobalPlayer` (`src/components/GlobalPlayer.tsx`) — conditional null return, audio state, mount guard
- [ ] `CartProvider` (`src/lib/cart-context.tsx`) — localStorage read on mount, SSR mismatch history

### Tier 2 — Medium Risk (localStorage/session/browser APIs)
- [ ] `WalletProvider` (`src/lib/wallet-context.tsx`) — lazy Supabase client, localStorage balance
- [ ] `PayoutProvider` (`src/lib/payout-context.tsx`) — localStorage reads on mount
- [ ] `ToastProvider` (`src/components/Toast.tsx`) — renders fixed-position DOM elements conditionally

### Tier 3 — Lower Risk (Suspense-aware, well-structured)
- [ ] `AudioProvider` (`src/lib/audio-context.tsx`) — audio playback state, should be safe after hooks fix
- [ ] `InstallPrompt` (`src/components/InstallPrompt.tsx`) — browser API checks, PWA install flow
- [ ] `IOSInstallInstructions` (`src/components/InstallPrompt.tsx`) — user agent detection

### Audit Criteria
For each provider, verify:
1. Does it read from localStorage/sessionStorage on mount? → needs mount guard
2. Does it manipulate DOM directly? → must be imperatively applied after mount
3. Does it return different content on server vs client? → needs suppressHydrationWarning or consistent SSR
4. Does it have conditional renders based on pathname/auth state? → must not break during hydration
5. Are all useEffect calls BEFORE any early-returns? → React hooks rules compliance

### Audit Priority
1. ThemeProvider — already had one fix, still marked as high risk
2. GlobalPlayer — controls audio, has mount guards but complex
3. CartProvider — core commerce flow, must be bulletproof
4. WalletProvider — financial context, sensitive
5. PayoutProvider — financial context, sensitive

Last updated: 2026-04-12 (post hydration fix)