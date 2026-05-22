# Porterful Deployment Rules

These rules keep Sentinel and Codex synchronized on what counts as production.

## Core Rule

- Production truth is only `https://porterful.com`.
- A preview URL is not production.
- A branch preview is not production.
- An old project is not production.

## Reporting Rules

- Do not report `production-ready` unless the result has been verified on `porterful.com`.
- Do not claim a fix is live from the wrong Vercel account, team, or project.
- Before saying “deployed,” always state which Vercel team/project was used.
- Codex must verify the canonical project and domain mapping before trusting deployment claims.

## Canonical Project

- **Team/account:** `inquiringmindsco-ship-its-projects`
- **Project:** `porterful`
- **Domain:** `porterful.com`
- **Repo:** `git@github.com:inquiringmindsco-ship-it/porterful.git`
- **Branch:** `main`

## Do Not Use For Production Verification

- `porterful-app`
- Any preview-only deployment URL
- Any branch deployment that is not the current canonical production deployment

## Change Safety

- Do not rename production projects during an audit.
- Do not disconnect or rewire Vercel settings during a truth-sync.
- Do not deploy new code until the canonical production mapping is agreed.
- Do not chase failed builds from non-canonical projects unless they affect `porterful.com`.

## Verification Standard

- A fix is only considered live when:
  - the canonical project `porterful` shows the intended commit,
  - the deployment is `Ready`,
  - the domain is `porterful.com`,
  - and the browser shows the expected behavior on the live site.

