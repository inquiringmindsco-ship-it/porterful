# Porterful Deployment Passport

## Verified baseline

| Field | Canonical value |
| --- | --- |
| Public domain | `https://porterful.com` |
| Vercel project | `inquiringmindsco-ship-its-projects/porterful` |
| Project ID | `prj_WTDTDRhVtON6ROzD5VAP2xDqzZxa` |
| Repository | `inquiringmindsco-ship-it/porterful` |
| Canonical branch | `codex/porterful-production-recovery` |
| Baseline tag | `production-baseline-2026-09-08` |
| Baseline commit | `f3b56727752060214b4023673f05795ba12c920d` |
| Audited production deployment | `dpl_FFW9HCgF87PkqEDct7hvKDtj6cTV` |

The baseline tag and branch are preserved on GitHub. Two isolated previews of the
baseline were independently compared with production on September 8, 2026; the
second-agent check reported route parity on 22 of 22 sampled routes and matching
desktop/mobile visuals.

## Promotion gate

A preview is not production proof. A production change is complete only when the
approved canonical-branch deployment is Ready, `porterful.com` maps to it, the live
route/redirect matrix passes, desktop and mobile rendering match the approved
preview, authentication boundaries pass, and runtime logs contain no new errors.

See `DEPLOYMENT_RULES.md` and use the guarded package scripts. Production promotion
requires Jonathan's explicit final approval for the preview being promoted.
