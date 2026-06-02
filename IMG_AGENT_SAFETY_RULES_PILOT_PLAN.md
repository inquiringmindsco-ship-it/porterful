# IMG Agent Safety Rules — Pilot Rollout Plan

**Status:** Draft  
**Date:** 2026-06-02  
**Target Project:** IMGLikeness (recommended by O D)  
**Duration:** One full work cycle  
**Rules Source:** IMG Agent Safety Rules v1 (15 rules)

---

## Why IMGLikeness

| Factor | IMGLikeness | Porterful |
|--------|-------------|-----------|
| Active development | ✅ Recent Phase 1 upgrade | ✅ Daily |
| Simpler surface | ✅ 7 routes, 1 page | ⚠️ 50+ routes, complex DB |
| Recent deploy issues | ✅ Phase 1 deploy needed verification | ✅ Multiple deploy incidents |
| Homepage sensitivity | ✅ High (brand positioning) | ⚠️ Medium |
| Legal/proposal risk | ✅ Present (IMG positioning) | ⚠️ Lower |
| Claim risk | ✅ "Where St. Louis builders become visible" | ⚠️ Commerce claims |
| Agent exposure | ✅ Moderate | ⚠️ High (Codex + Claude) |

**IMGLikeness is the best pilot because it's smaller, has recent homepage sensitivity, and touches brand positioning — perfect for testing Rules 4, 5, 6, 7.**

---

## Pilot Scope

### One Full Work Cycle on IMGLikeness Only

**Phase 1: Rule Activation (Day 1)**
- [ ] Sentinel loads all 15 rules into every IMGLikeness task prompt
- [ ] Codex briefings updated with IMGLikeness-specific rules reference
- [ ] All new IMGLikeness tasks → pre-flight checklist

**Phase 2: Live Testing (Days 2-5)**
- [ ] Every new task → pre-flight checklist against rules
- [ ] Every build → localhost review default (no screenshots unless requested)
- [ ] Every deploy → explicit O D approval required (Rule 1)
- [ ] Every status report → structured format (Rule 12)
- [ ] Every completion → full report with files, build, localhost, deploy status

**Phase 3: Review (Days 6-7)**
- [ ] Count rule violations caught
- [ ] Count false positives (rules too strict)
- [ ] Adjust rules based on friction
- [ ] Report to O D: pilot results

---

## Rules Active vs Warning-Only

### ACTIVE (Enforced — Stop Work If Violated)

| Rule # | Rule | Enforcement |
|--------|------|-------------|
| 1 | Deployment Approval | STOP if deploy attempted without keyword |
| 4 | Homepage Architecture Lock | STOP if homepage structurally changed without approval |
| 5 | Proposal/Legal/Lease Freeze | STOP if protected values changed without approval |
| 6 | No Unsupported Claims | STOP if forbidden claim added |
| 7 | Word Ban | STOP if "node" used for IMG positioning |
| 13 | Stop/Abort | STOP immediately if O D says stop/pause/wait |
| 14 | Recon-Only | STOP edits if recon mode active |

### WARNING-ONLY (Flagged, Reported, But Work Continues)

| Rule # | Rule | Enforcement |
|--------|------|-------------|
| 2 | Localhost Review Default | Warn if screenshots requested before localhost check |
| 3 | No Big-Bang Edits | Warn if >2 major areas touched; ask for plan |
| 8 | Deployment Status Truth | Flag if "deployed" used without verification |
| 9 | Git/Vercel Safety | Flag if deploy report missing SHA/URL |
| 10 | Dependency Safety | Flag if package change without justification |
| 11 | Database/Payments Safety | Flag if DB change without migration details |
| 12 | Completion Report | Flag if report is vague or missing sections |
| 15 | One Project Pilot | Flag if rules applied to non-pilot projects |

---

## Commands Allowed vs Blocked

### ALLOWED (Anytime)

| Command | When |
|---------|------|
| `npm run build` | Local verification |
| `npm run dev` | localhost review |
| `git status` | Status check |
| `git diff` | Review changes |
| `git log --oneline -5` | Check recent commits |
| File reads | Research, inspection |
| `web_search` | Research |
| Status reports | Anytime |

### ALLOWED (With Conditions)

| Command | Condition |
|---------|-----------|
| `git add` / `git commit` | Clean working tree, clear message, single purpose |
| `git push` | Correct branch, not main unless approved |
| `vercel --preview` | Dry-run only, not production |
| File edits | ≤2 major areas, not homepage structure, not protected values |
| `npm install` | Justified, checked license, build passes after |

### BLOCKED (Require Explicit Approval)

| Command | Required Approval |
|---------|-------------------|
| `vercel --prod` | O D says "deploy" |
| Merge to main (if auto-deploys) | O D says "merge" |
| Homepage architecture changes | O D says "redesign homepage" |
| Proposal/legal document edits | O D says "edit proposal" |
| Protected value changes | O D says "approve changes" |
| New dependencies | O D says "install" |
| Database migrations touching amounts/revenue | O D says "run migration" |

---

## How localhost Review Works

### Default Workflow
1. Build completes → `npm run build` passes
2. Dev server starts → `npm run dev`
3. Verify localhost:3000 loads
4. Report: "Localhost ready at http://localhost:3000 for review."
5. Wait for O D to review
6. Only if O D requests → provide screenshots

### Screenshot Exceptions
- Mobile-specific bugs (localhost can't simulate device)
- API-only changes (no UI to review)
- O D explicitly requests screenshots
- localhost unavailable (port conflict, build failure)

### Screenshot Workflow
1. Take screenshot
2. Annotate what changed
3. Compare with previous if possible
4. Report: "Screenshot attached. localhost unavailable because [reason]."

---

## How Deployment Approval Works

### Request Format
```
DEPLOYMENT REQUEST — [Project]
What: [what is being deployed]
Why: [why it needs to go live]
Local verification: ✅ / ❌
Build: PASS / FAIL
Branch: [branch name]
Commit: [SHA]
Risk: [low/medium/high]
Rollback: [how to revert]

Approval needed: O D says "deploy" or "ship it"
```

### Approval Flow
1. Sentinel prepares deployment request
2. Sends to O D with all details
3. O D replies with keyword: "deploy", "ship it", "approve production deploy"
4. Sentinel executes deploy
5. Sentinel verifies production live
6. Sentinel reports: "Production verified live at [URL]"

### If O D Does Not Approve
- Hold deploy
- Continue local work if possible
- Report status: "Deploy held. Awaiting approval."

---

## How Rollback/Checkpoints Work

### Before Any Significant Change
1. Note current commit SHA
2. Note current branch
3. Create mental checkpoint: "If this fails, revert to [SHA]"

### Rollback Commands
| Scenario | Command |
|----------|---------|
| Bad commit (not pushed) | `git reset --hard HEAD~1` |
| Bad commit (pushed) | `git revert [SHA]` |
| Bad deploy | `vercel --rollback` |
| Bad migration | Run inverse migration or restore backup |
| File corruption | `git checkout -- [file]` |

### Rollback Report
```
ROLLBACK EXECUTED
Project: [name]
Reason: [why rollback needed]
From: [bad SHA]
To: [previous SHA]
Status: [success/failure]
Next action: [what to do now]
```

---

## How Proposal/Legal Files Are Protected

### Protected Files
- Any file with "proposal", "lease", "legal", "terms", "privacy", "contract" in name
- Any file containing protected values (Rule 5)

### Pre-Edit Checklist
1. Search file for protected values
2. Report current values to O D
3. Wait for explicit approval
4. Make changes
5. Report diff: `OLD: X → NEW: Y`

### If Protected Value Found During Edit
- STOP
- Report: "Found protected value [X]. Changing to [Y]. Approve?"
- Wait for O D "approve"

---

## How Success Will Be Measured

### Success Criteria
| # | Criteria | Target |
|---|----------|--------|
| 1 | No unauthorized deploys | 0 |
| 2 | No big-bang edits (>2 areas) | ≤1 per week |
| 3 | Clean completion reports | 100% |
| 4 | Local review before production | 100% |
| 5 | No proposal/lease value drift | 0 |
| 6 | No unsupported claims added | 0 |
| 7 | Easy rollback path | Every change has rollback plan |
| 8 | No "node" for IMG positioning | 0 |

### Metrics Tracked
| Metric | Baseline | Target |
|--------|----------|--------|
| Unapproved deploys | Unknown | 0 |
| Scope creep incidents | Unknown | ≤1/week |
| Homepage architecture changes without approval | Unknown | 0 |
| Legal/financial claims added without review | Unknown | 0 |
| Screenshot requests when localhost available | Unknown | ≤1/week |
| Build failures from package drift | Unknown | 0 |
| Vague completion reports | Unknown | 0 |

### Weekly Report
```
PILOT WEEK [N] REPORT — IMGLikeness
Rules enforced: [count]
Violations caught: [count]
False positives: [count]
Adjustments made: [list]
Success criteria met: [Y/N for each]
Recommendation: continue / adjust / abandon
```

---

## Rollback Plan (If Rules Create Too Much Friction)

### Day 3 Check-In
- If tasks take 2x longer → identify bottleneck rule
- Options: relax warning-only rules, keep active rules strict

### Day 5 Adjustment
- Relax specific rule causing friction
- Document exception for IMGLikeness

### Day 7 Decision
- O D decides: keep, adjust, or abandon
- If abandoned → rules stay as guidelines, not enforced

---

## Expansion Plan (If Pilot Succeeds)

| Week | Project | Rules Applied |
|------|---------|---------------|
| 2 | LikenessVerified | Active: 1,4,5,6,13,14. Warning: 2,3,8,9,10,11,12 |
| 3 | Porterful | Full rules (highest complexity) |
| 4 | Overstood | Deploy, localhost, claim rules |
| 5 | All projects | Full rule pack |

---

## CONTEXT UPDATE REQUIRED

- **Files to update:** `CURRENT_STATE.md` — Pilot plan drafted for IMGLikeness
- **New decision:** IMGLikeness selected as pilot (not Porterful)
- **New open loop:** Pilot execution awaiting O D approval
- **Next command O D can use:** "Approve pilot on IMGLikeness" or "Change pilot to [project]"
