#!/usr/bin/env bash
# Porterful deployment preflight. This is intentionally strict: the same Vercel
# project has previously received builds from unrelated Git histories.

set -euo pipefail

MODE="preview"
if [[ "${1:-}" == "--production" ]]; then
  MODE="production"
elif [[ $# -gt 0 ]]; then
  echo "Usage: $0 [--production]" >&2
  exit 2
fi

EXPECTED_PROJECT_ID="prj_WTDTDRhVtON6ROzD5VAP2xDqzZxa"
EXPECTED_ORG_ID="team_SgVobhtThOM1FwJ86K9cYrRg"
EXPECTED_REPOSITORY="inquiringmindsco-ship-it/porterful"
CANONICAL_BRANCH="codex/porterful-production-recovery"
BASELINE_TAG="production-baseline-2026-09-08"
BASELINE_COMMIT="f3b56727752060214b4023673f05795ba12c920d"

fail() {
  echo "PORTERFUL PREFLIGHT FAILED: $*" >&2
  exit 1
}

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || fail "not inside a Git worktree"
cd "$repo_root"

[[ -f package.json && -f package-lock.json ]] || fail "package manifest or lockfile is missing"
[[ -f .vercel/project.json ]] || fail ".vercel/project.json is missing; link only to the canonical Porterful project"

read_project_field() {
  node -e 'const fs=require("fs"); const data=JSON.parse(fs.readFileSync(process.argv[1], "utf8")); process.stdout.write(String(data[process.argv[2]] || ""));' .vercel/project.json "$1"
}

project_id="$(read_project_field projectId)"
org_id="$(read_project_field orgId)"
[[ "$project_id" == "$EXPECTED_PROJECT_ID" ]] || fail "wrong Vercel project ID: $project_id"
[[ "$org_id" == "$EXPECTED_ORG_ID" ]] || fail "wrong Vercel team ID: $org_id"

remote_url="$(git remote get-url origin 2>/dev/null)" || fail "origin remote is missing"
case "$remote_url" in
  "git@github.com:${EXPECTED_REPOSITORY}.git"|"https://github.com/${EXPECTED_REPOSITORY}"|"https://github.com/${EXPECTED_REPOSITORY}.git") ;;
  *) fail "wrong Git remote: $remote_url" ;;
esac

tag_commit="$(git rev-list -n 1 "$BASELINE_TAG" 2>/dev/null)" || fail "baseline tag $BASELINE_TAG is missing"
[[ "$tag_commit" == "$BASELINE_COMMIT" ]] || fail "baseline tag was moved: $tag_commit"
git merge-base --is-ancestor "$BASELINE_TAG" HEAD || fail "HEAD is not descended from the verified production baseline"

[[ -z "$(git status --porcelain --untracked-files=normal)" ]] || fail "worktree has uncommitted or untracked changes"

branch="$(git branch --show-current)"
[[ -n "$branch" ]] || fail "detached HEAD deployments are not allowed"

if [[ "$MODE" == "production" ]]; then
  [[ "$branch" == "$CANONICAL_BRANCH" ]] || fail "production must deploy from $CANONICAL_BRANCH, not $branch"
  [[ "${PORTERFUL_PRODUCTION_APPROVED:-}" == "YES" ]] || fail "final owner approval is required; set PORTERFUL_PRODUCTION_APPROVED=YES only for the approved promotion"
fi

echo "PORTERFUL PREFLIGHT PASSED"
echo "mode=$MODE"
echo "project=$EXPECTED_PROJECT_ID"
echo "repository=$EXPECTED_REPOSITORY"
echo "branch=$branch"
echo "head=$(git rev-parse HEAD)"
echo "baseline=$BASELINE_COMMIT"
