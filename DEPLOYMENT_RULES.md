# Porterful Deployment Rules

These rules exist because the canonical Vercel project previously received manual
deployments from unrelated Git histories.

## Production truth

- Public domain: `https://porterful.com`
- Vercel team: `inquiringmindsco-ship-its-projects`
- Vercel project: `porterful`
- Vercel project ID: `prj_WTDTDRhVtON6ROzD5VAP2xDqzZxa`
- GitHub repository: `inquiringmindsco-ship-it/porterful`
- Canonical branch: `codex/porterful-production-recovery`
- Verified baseline tag: `production-baseline-2026-09-08`
- Verified baseline commit: `f3b56727752060214b4023673f05795ba12c920d`

The GitHub `main` branch is an unrelated history and must not be deployed to this
Vercel project. The August `18d99ea` line is divergent and must not be deployed
wholesale either. Changes from another history require file-level review and a new
preview from the canonical branch.

## Required workflow

1. Work only in a clean worktree descended from the verified baseline tag.
2. Run `npm run preflight` before creating a preview.
3. Build and verify the preview on desktop and mobile.
4. Have a second agent independently compare routes and visuals with production.
5. Obtain Jonathan's explicit final approval for the specific preview.
6. Set `PORTERFUL_PRODUCTION_APPROVED=YES` only for that approved promotion and run
   `npm run deploy:production`.
7. Verify the resulting deployment ID, commit, domain mapping, routes, and rendered
   behavior on `porterful.com` before reporting the change as live.

Never use `vercel --prod` directly. Never deploy from a dirty worktree, detached
HEAD, `main`, or a checkout that fails the lineage check.

