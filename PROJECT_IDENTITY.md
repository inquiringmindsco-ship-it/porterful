# Porterful Project Identity

This file records the verified recovery identity as of September 8, 2026.

## Canonical infrastructure

- Domain: `https://porterful.com`
- Vercel team ID: `team_SgVobhtThOM1FwJ86K9cYrRg`
- Vercel project ID: `prj_WTDTDRhVtON6ROzD5VAP2xDqzZxa`
- Vercel project name: `porterful`
- GitHub repository: `git@github.com:inquiringmindsco-ship-it/porterful.git`
- Canonical recovery/production branch: `codex/porterful-production-recovery`
- Baseline tag: `production-baseline-2026-09-08`
- Baseline commit: `f3b56727752060214b4023673f05795ba12c920d`
- Audited production deployment: `dpl_FFW9HCgF87PkqEDct7hvKDtj6cTV`

At audit time, the Vercel project had no Git integration. Its production deployment
was created from the baseline commit above. GitHub `main` pointed to unrelated
commit `43c18054f58e3048c38d5971fd7e10fb8f0c9b27` and did not contain `package.json`.

Run `npm run preflight` from a clean worktree before every preview or deployment.
Do not infer project identity from a local folder name.
