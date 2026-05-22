# Porterful Deployment Passport

This document is the shared source of truth for Porterful deployment identity.
If a future report conflicts with this file, treat this file as the baseline until verified otherwise on `porterful.com`.

## Canonical Production

- **Domain:** `https://porterful.com`
- **Vercel team/account:** `inquiringmindsco-ship-its-projects` (`Pro`)
- **Vercel project:** `porterful`
- **Project ID:** `prj_WTDTDRhVtON6ROzD5VAP2xDqzZxa`
- **Team ID:** `team_SgVobhtThOM1FwJ86K9cYrRg`
- **GitHub repo:** `git@github.com:inquiringmindsco-ship-it/porterful.git`
- **GitHub branch:** `main`
- **Supabase project ref:** `tsdjmiqczgxnkpvirkya`

## Current Production Deployment

- **Deployment ID:** `2SLT75tiJvYUW6DsHvQvrAFaV4cv`
- **Deployment URL:** `https://porterful-5t1whc2ir-inquiringmindsco-ship-its-projects.vercel.app`
- **Production status:** `Ready`
- **Production branch:** `main`
- **Current production commit:** `bcfef46eb86074a02a97d08af23baffa5f11a3ea`
- **Commit message:** `fix: backfill track durations + fix iamodmusic artist metadata`

## Canonical Rules

- `porterful.com` is the only production truth.
- Production verification must be done against `porterful.com`, not a preview URL.
- The canonical production project is `porterful` under `inquiringmindsco-ship-its-projects`.
- The canonical project is connected to `main` on `inquiringmindsco-ship-it/porterful`.

## Known Non-Canonical or Do-Not-Use Entries

- **Old project:** `porterful-app`
  - `porterful-app.vercel.app`
  - No production deployment for Porterful
  - Not the canonical project
  - Do not use for production verification

## Preview-Only Noise Inside the Canonical Project

These are not production truth. They may be useful for branch testing, but they do not prove a live fix:

- `accent-v2-clean`
- `fix/accent-system-safe-v2`
- `fix/accent-system-safe`

## How To Verify A Fix Is Truly Live

1. Confirm the change is present in the canonical project `porterful` on Vercel.
2. Confirm the deployment is on branch `main` unless a deliberate production branch change was made.
3. Confirm the production deployment status is `Ready`.
4. Confirm the deployment domain includes `porterful.com`.
5. Open `https://porterful.com` and verify the user-facing behavior there.
6. Do not treat preview URLs, old projects, or branch deployments as production proof.

