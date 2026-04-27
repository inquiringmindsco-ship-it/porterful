# Accent System Continuation Plan

Status: audit complete. Planning only. Do not implement until approved.

Hard constraints:

- Do not merge `accent-v2-clean`.
- Do not touch the upload pipeline.
- Do not touch player/audio behavior.
- Do not change routes.
- Do not redesign layouts.
- Keep the black/white/gray foundation intact.
- Accent may only control actions, active states, progress, selected tabs, and badges where appropriate.

## Current Working Tree State

Repository: `/Users/sentinel/Documents/porterful`

Current status:

- `src/app/globals.css` is modified.
- `src/lib/accent-context.tsx` is untracked.
- No layout wiring has been done yet.
- No settings selector has been restored yet.
- No final cleanup or build has been run yet.

## What Is Already Complete

- `src/app/globals.css` now defines:
  - `--pf-accent`
  - `--pf-accent-rgb`
  - `--pf-accent-hover`
  - `--pf-accent-soft`
  - `--pf-accent-border`
  - `--pf-accent-text`
- Legacy `--pf-orange`, `--pf-orange-dark`, and `--pf-orange-light` now alias to the accent variables.
- `src/lib/accent-context.tsx` exists and already includes:
  - `AccentProvider`
  - preset list
  - localStorage hydration
  - root CSS variable writes
  - reset behavior

## What Is Still Incomplete

- `AccentProvider` is not mounted in the app tree.
- The settings page does not expose an accent selector yet.
- Hardcoded orange hex and Tailwind orange references still remain in multiple files.
- The logo/icon/PWA surfaces still reflect the old orange/gradient asset stack.
- Final grep proof has not been run.
- Build and smoke tests have not been run.

## Provider Access Summary

These components do not need direct `useAccent()` access right now:

- `src/components/Navbar.tsx`
- `src/components/Footer.tsx`
- `src/components/MobileBottomNav.tsx`
- `src/components/GlobalPlayer.tsx`

Reason:

- They already respond to CSS variables.
- They only need direct provider access if a new reusable brand icon component is rendered inside them.

## Recommended Next Action

Finish the wiring first. Do not commit the partial token/provider foundation by itself.

Reason:

- The current foundation is useful, but it is not user-visible until the provider is mounted.
- Committing it alone creates a half-finished checkpoint with no functional accent path.
- A single checkpoint after wiring is easier to test and less confusing to hand off.

## Smallest Safe Next Batch

Batch 1: make the accent system functional.

Exact files to touch:

1. `src/app/providers.tsx`
2. `src/app/(app)/settings/settings/page.tsx`

Order:

1. Mount `AccentProvider` in `src/app/providers.tsx` so the CSS variables can be written at runtime across the whole app.
2. Restore the settings accent selector in `src/app/(app)/settings/settings/page.tsx`.

Batch 1 requirements:

- Use preset accent choices only.
- No freeform color picker yet.
- Preserve the current page layout and tab structure.
- Add a visible current-selection state.
- Include a reset-to-default action.
- Keep the change scoped to settings only.

## Settings UI Requirements

The restored settings accent control should:

- live inside the existing settings screen
- present a small Appearance or Accent section
- show the current accent swatch
- let the user switch between approved presets
- persist through reloads via the provider/localStorage path
- use accessible tap targets and focus states
- avoid redesigning the settings layout
- avoid changing routes or adding new settings pages
- avoid touching upload, audio, or checkout behavior

## Files That Can Stay Untouched In Batch 1

Leave these alone for the first batch:

- `src/components/Navbar.tsx`
- `src/components/Footer.tsx`
- `src/components/MobileBottomNav.tsx`
- `src/components/GlobalPlayer.tsx`
- `src/app/layout.tsx`
- `src/app/(app)/layout.tsx`

They will benefit automatically once the provider is mounted.

## Commit Strategy

1. Finish Batch 1.
2. Run a quick local smoke check.
3. Commit the completed foundation checkpoint.
4. Then do the broader orange cleanup.
5. Then do the logo/PWA pass.

Do not create a commit from the partial foundation alone.

## Hardcoded Orange Cleanup Plan

After Batch 1, sweep the remaining hardcoded orange references.

Use this proof command:

```bash
rg -n "#ff6b00|#f97316|orange-[0-9]{3}|from-orange-[0-9]{3}|to-orange-[0-9]{3}|via-orange-[0-9]{3}|text-orange-[0-9]{3}|bg-orange-[0-9]{3}|border-orange-[0-9]{3}|ring-orange-[0-9]{3}|shadow-orange-[0-9]{3}|rgba\\(249,115,22|249,115,22" src/app src/components src/lib
```

Expected outcome:

- No hardcoded orange remains in app/component code except intentional seed values in the accent foundation files.
- Allowable intentional seeds:
  - `src/app/globals.css`
  - `src/lib/accent-context.tsx`
  - any explicitly documented fallback constant that is still needed for resilience

Files currently showing true hardcoded orange usage and likely needing cleanup:

- `src/components/SystemSelector.tsx`
- `src/components/Logo.tsx`
- `src/app/claim/page.tsx`
- `src/components/EmailCapture.tsx`
- `src/app/page.tsx`
- `src/components/tap/TapExperience.tsx`
- `src/lib/artists.ts`
- `src/app/systems/page.tsx`
- `src/app/systems/worlds/page.tsx`
- `src/app/offer/[offerId]/success/page.tsx`
- `src/app/learn/page.tsx`
- `src/app/ecosystem/page.tsx`
- `src/app/(app)/signup/page.tsx`
- `src/app/(app)/admin/page.tsx`
- `src/app/(app)/about/page.tsx`
- `src/app/(app)/terms/terms/page.tsx`
- `src/app/(app)/resources/page.tsx`
- `src/app/(app)/food/page.tsx`
- `src/app/(app)/coming-soon/page.tsx`
- `src/app/(app)/challenge/page.tsx`
- `src/app/(app)/demo/page.tsx`
- `src/app/(app)/superfan/page.tsx`
- `src/app/(app)/settings/settings/page.tsx`

Notes:

- `var(--pf-orange)` is fine because it now aliases to the accent.
- The cleanup should focus on raw hex and raw Tailwind orange tokens.

## Logo Update Requirements

Separate the public wordmark from the app-side icon treatment.

Brand rule:

- Public wordmark stays static and gold/premium.
- App/user interface uses the color-reactive standalone P mask via CSS `mask-image`.
- Do not recolor the full Porterful wordmark.

Exact files to touch in the logo pass:

1. `src/components/Navbar.tsx`
2. `src/components/Footer.tsx`
3. `src/app/page.tsx`
4. `src/components/Logo.tsx`
5. `src/app/layout.tsx`
6. `src/app/(app)/layout.tsx`
7. `public/manifest.json`
8. `public/icon.svg`
9. `public/apple-touch-icon.png`
10. `public/favicon-32x32.png`

Possible follow-up assets if they are still used or should be normalized:

- `public/logo.svg`
- `public/porterful-logo-black.svg`
- `public/porterful-logo-white.svg`
- `public/porterful-logo-brand-purple.svg`
- `public/porterful-icon-dark-circle.svg`
- `public/porterful-icon-light-circle.svg`

Logo behavior requirements:

- Use the static official brand mark on homepage/header/footer/public marketing surfaces.
- Use the recolorable P mask on app-side surfaces where the icon should follow the selected accent or theme.
- Keep the favicon/PWA assets coherent with the static fallback icon.
- Keep the wordmark premium and untouched by accent color changes.

## PWA And Theme Compatibility Checks

After the wiring and cleanup, verify:

- `public/manifest.json` still installs cleanly.
- `theme_color` and `background_color` still make sense for light, dark, and creator themes.
- `apple-touch-icon` still renders correctly on iOS.
- The static favicon/icon still works in browser tabs.
- The recolorable P mask works in WebKit with `mask-image` and `-webkit-mask-image`.
- Accent changes persist across refresh.
- Accent changes survive theme switching.
- `prefers-color-scheme` and the app theme toggle do not fight each other.

## Smoke Tests

Run these after each major batch:

- Settings opens without hydration errors.
- Accent selection changes the UI immediately.
- Accent selection persists after refresh.
- The header/footer still render correctly.
- The player controls still behave normally.
- The mobile nav still renders normally.
- The favicon and manifest still load.
- The logo surfaces still show the right brand treatment.
- No fake layout changes or route changes appear.

## Risk If Left Partial

If this stays as-is:

- The app has the color token foundation but no mounted runtime provider, so the feature is not actually usable.
- The settings selector is still missing, so users cannot change accent yet.
- Hardcoded orange values will continue to create mixed-brand surfaces.
- The untracked provider file can be easy to overlook or lose in a later merge.
- Logo/icon assets will keep drifting between old and new brand language.

Current risk level:

- Low visual risk right now.
- Medium delivery risk if someone assumes the accent system is finished.

## Safe Implementation Call

Safe for Codex to implement in a follow-up batch after approval.

No need to wait for a Claude reset, but keep the next batch small and finish Batch 1 before expanding into the color sweep or logo pass.

