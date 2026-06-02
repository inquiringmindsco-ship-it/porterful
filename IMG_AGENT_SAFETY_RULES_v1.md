# IMG Agent Safety Rules v1

**Status:** Draft  
**Date:** 2026-06-02  
**Author:** Sentinel (per O D Porter directive)  
**Purpose:** ECC-inspired workflow guardrail system for IMG projects. Planning-only. No installs yet.

---

## 1. DEPLOYMENT APPROVAL RULE

### Rule
No production deploy unless O D explicitly says one of:
- "deploy"
- "deploy to production"
- "ship it"
- "approve production deploy"

If wording is unclear, do not deploy. Ask for explicit confirmation.

### Allowed Before Approval
- Local build (`npm run build`)
- Local test (`npm run test`)
- localhost review (http://localhost:3000)
- Dry-run deploy (`vercel --preview`)
- Status report

### Not Allowed Before Approval
- `vercel --prod`
- Production alias promotion
- Deployment trigger commits
- Merge to production branch (if it triggers auto-deploy)
- Any action that makes changes live on public URL

### Exception
Emergency security patches may bypass with Sentinel + Codex dual approval, but must notify O D immediately after.

---

## 2. LOCALHOST REVIEW DEFAULT RULE

### Rule
If localhost:3000 or local preview is available, use that for review.

Do not ask O D for screenshots as the default review method.

### Screenshots Allowed Only For
- Documentation
- Audit artifacts
- Comparing before/after
- When O D explicitly requests screenshots
- When localhost is unavailable (e.g., API-only changes, mobile-specific bugs)

### Default Review Phrase
> "Localhost is ready at http://localhost:3000 for review."

### Workflow
1. Build completes → verify localhost loads
2. Report: "Localhost ready at [URL]"
3. Wait for O D to review or request screenshots
4. Only if localhost unavailable → offer screenshots as alternative

---

## 3. NO BIG-BANG EDITS RULE

### Rule
Block sessions that modify unrelated areas together.

If a task touches more than one major area, require a plan first.

### Major Areas
| # | Area | Examples |
|---|------|----------|
| 1 | Homepage architecture | Sections, layout, CTAs |
| 2 | Routing/navigation | New routes, nav structure |
| 3 | Pricing/revenue | Price changes, revenue claims |
| 4 | Legal/terms/privacy | Policy text, compliance |
| 5 | Proposal/lease documents | Contracts, terms |
| 6 | Deployment config | Vercel, CI/CD, env vars |
| 7 | Package/dependencies | npm install, version bumps |
| 8 | Database/schema | Migrations, RLS, indexes |
| 9 | Authentication/payments | Auth flow, Stripe, checkout |
| 10 | API contracts | Route changes, response shapes |

### Threshold
If more than **2 major areas** are touched in one task:
1. STOP
2. Draft a plan listing each area and why it needs changing
3. Submit to O D for approval
4. Only proceed after explicit "proceed" or "do it"

### Exception
Purely additive changes (new page, new component) that don't touch existing logic in other areas.

---

## 4. HOMEPAGE ARCHITECTURE LOCK RULE

### Rule
Homepage architecture cannot be changed unless O D explicitly requests homepage architecture changes.

### Allowed Without Approval
- Small copy edits (text changes)
- Image swap (same size/position)
- Styling refinement (colors, spacing)
- Bug fix (broken link, typo)

### Not Allowed Without Approval
- Adding new sections
- Removing existing sections
- Changing page role (e.g., from minimal → explainer)
- Changing CTA structure
- Moving pricing/status/case studies back to homepage
- Converting short homepage into long explainer page
- Any structural change to section order or count

### Trigger Words
If any agent says:
- "redesign the homepage"
- "add a section to homepage"
- "restructure the homepage"
→ STOP and ask O D for explicit approval.

---

## 5. PROPOSAL / LEGAL / LEASE FREEZE RULE

### Rule
Proposal, lease, legal, privacy, terms, compliance-sensitive pages, and contract-related documents are protected.

No changes allowed unless O D explicitly approves the document scope.

### Protected Values
| Category | Examples |
|----------|----------|
| Financial | Lease duration, deposit, rent abatement, reduced rent period, full-rent timing |
| Identity | UEI, CAGE, phone numbers, emails, legal entity names |
| IP | Trademarks, patent-pending language, proprietary claims |
| Commercial | Pricing, revenue claims, revenue-share terms, payout promises |
| Compliance | Legal disclaimers, terms of service, privacy policy |

### Required Before Any Change
1. Identify the exact value changing
2. Report old value → new value
3. Explain why it needs to change
4. Wait for O D "approve" keyword

### If Protected Value Changes
- Report it clearly before finalizing
- Do not silently update
- Use diff format: `OLD: X → NEW: Y`

---

## 6. NO UNSUPPORTED CLAIMS RULE

### Rule
Block or flag language that claims:

| Forbidden Claim | Why Blocked |
|-----------------|-------------|
| "Earn guaranteed money" | False promise, legal risk |
| "Get paid automatically" | Payout not guaranteed |
| "Unlock income" | Revenue not assured |
| "Guaranteed revenue" | Cannot guarantee |
| "Earn $X per month" | Speculative income |
| "Passive income" | Misleading for creators |
| "Get rich" / "financial freedom" | Hyperbolic, risky |
| "Official partner of [brand]" | Without written proof |
| "Patented" | Unless patent number provided |
| "Certified" | Unless certification body named |
| "Guaranteed jobs" | Cannot guarantee employment |
| "Guaranteed property value increase" | Real estate speculation |
| "Active office/location where none exists" | False representation |
| "Proprietary AI capability not implemented" | False capability claim |
| "Guaranteed authenticity" | Cannot guarantee |
| "Medical/hair growth claims" (Noble Naturals) | FDA risk |
| "Surveillance/tracking language" | Privacy risk |
| "Facial recognition/biometric claims without approval" | Legal risk |

### Safe Alternatives
| Instead Of | Use |
|------------|-----|
| "Earn guaranteed money" | "Prepare for monetization" |
| "Get paid automatically" | "Track earnings when available" |
| "Unlock income" | "Enable revenue tracking" |
| "Guaranteed revenue" | "Revenue potential" |
| "Passive income" | "Recurring revenue opportunity" |
| "Official partner" | "Relationship pathway" |
| "Proprietary AI" | "Supports AI-assisted workflow" |
| "Guaranteed authenticity" | "Proof-supported verification" |
| "Medical-grade" | "Wellness-focused" |
| "Surveillance" | "Optional location permission" |
| "Facial recognition" | "Consent-based visual matching" |

### Review Trigger
Any text containing "earn", "guaranteed", "automatic", "passive", "income", "revenue", "official", "patented", "certified", "medical", "surveillance", "facial recognition", "biometric" in user-facing copy must pass a claim review.

### Safe Language
- "Intended"
- "Proposed"
- "Supports"
- "Can support"
- "Relationship pathway"
- "Operating connection"
- "Proof-supported"
- "Consent-based"
- "Reviewable record"
- "Optional location permission"
- "Human review"

---

## 7. WORD BAN / STYLE RULE

### Rule
Do not use the word "node" for IMG x Likeness / HQ-1 positioning.

### Use Instead
- Base
- Hub
- Anchor
- Location
- Center
- First physical home
- Headquarters
- St. Louis operations hub

### Context
"Node" implies distributed computing / network topology. IMG's physical presence is not a "node" — it's a base of operations.

### Enforcement
Search all IMG-related docs for "node" → replace with approved term.

---

## 8. DEPLOYMENT STATUS TRUTH RULE

### Rule
Do not say "deployed" unless production is verified live.

### Exact Labels
| Stage | Phrase |
|-------|--------|
| Built locally | "Built locally" |
| Pushed to GitHub | "Pushed to GitHub" |
| Vercel build triggered | "Vercel build triggered" |
| Vercel build failed | "Vercel build failed" |
| Vercel deployment ready | "Vercel deployment ready" |
| Production verified live | "Production verified live" |
| Production not live | "Production not live" |

### Required In Every Deployment Report
- Local HEAD SHA
- origin/main SHA
- Vercel deployment ID
- Build status (pass/fail)
- Production URL
- Live verification strings (curl output or screenshot)
- Whether production is actually live

### Forbidden Phrases
- "Should be deployed" → use "Ready for testing at [URL]"
- "Deployed" without URL → must include URL + status check
- "Fixed" without test → must include test evidence

---

## 9. GIT / VERCEL SAFETY RULE

### Rule
Before deployment, verify:

| Check | Command/Method |
|-------|---------------|
| git status clean | `git status` — list dirty files if any |
| Correct branch | `git branch --show-current` |
| Local HEAD SHA | `git rev-parse HEAD` |
| origin/main SHA | `git rev-parse origin/main` |
| Git author email | `git config user.email` |
| Vercel project ID | Check `vercel.json` or dashboard |
| Vercel team/org | Check `.vercel/project.json` |
| Production branch | Check Vercel settings |
| Package build passes | `npm run build` exit 0 |

### No More Deployment Guesses
If any check fails → STOP, report failure, do not deploy.

---

## 10. DEPENDENCY SAFETY RULE

### Rule
Any package.json or package-lock change requires:

| Step | Required |
|------|----------|
| Reason for dependency change | Yes |
| List of added/removed dependencies | Yes |
| `npm install` or lockfile update | Yes |
| `npm run build` | Yes |
| Confirmation no unrelated dependency stripping | Yes |

### Forbidden
- Installing packages for one-line functions
- Installing unmaintained packages
- Installing packages with GPL/viral licenses for commercial use
- Installing packages without checking GitHub issues/security advisories
- Silent lockfile updates without build verification

---

## 11. DATABASE / PAYMENTS SAFETY RULE

### Rule
Any database, Stripe, order, payout, or revenue-tracking change requires:

| Requirement | Details |
|-------------|---------|
| Migration name | `NNN_descriptive_name.sql` |
| Tables touched | List each table |
| Fields touched | List each field |
| Rollback note | How to revert |
| Acceptance checks | How to verify correctness |
| Amount/revenue field approval | Explicit O D approval required |

### No Amount/Revenue Field Changes Unless
- O D explicitly approves
- Change is clearly documented
- Rollback path is known

---

## 12. COMPLETION REPORT RULE

### Rule
No vague "done" reports.

### Required In Every Completion Report
| Section | Content |
|---------|---------|
| Files changed | List each file |
| What changed | Summary of changes |
| What was NOT changed | Scope boundary confirmation |
| Build/test result | Pass/fail with evidence |
| localhost status | URL and verification |
| Deployment status | Exact label (Rule 8) |
| Risks or blockers | Any remaining issues |
| Next recommended action | What to do next |

### Forbidden Phrases
- "Done" → use "Complete. See report above."
- "Should work" → use "Ready for testing at [URL]"
- "Fixed" → use "Fixed. Test evidence: [link/output]"
- "Almost done" → use "X% complete. Remaining: [tasks]"

---

## 13. STOP / ABORT RULE

### Rule
If O D says:
- "stop"
- "pause"
- "wait"
- "do not continue"
- "no more changes"

Then immediately stop all actions.

### Allowed After Stop
- Status report only
- No edits
- No deploys
- No commits
- No agent spawns

### Not Allowed After Stop
- Any file edits
- Any deploys
- Any commits
- Any agent tasks
- Any installations

---

## 14. RECON-ONLY MODE

### Rule
When O D says recon, research, audit, review, or positioning only:

### Allowed
- Inspect files
- Research topics
- Report findings
- Recommend actions

### Not Allowed
- Code edits
- Config edits
- Installs
- Commits
- Pushes
- Deploys

### Trigger Words
"recon", "research", "audit", "review", "positioning only", "analysis only"

---

## 15. ONE PROJECT PILOT RULE

### Rule
ECC guardrails must be piloted on one project first.

Do not apply across all projects at once.

### Recommended First Pilot
IMGLikeness or LikenessVerified

### Pilot Duration
One full work cycle

### Success Criteria
- No unauthorized deploys
- No big-bang edits
- Clean completion reports
- Local review before production
- No proposal/lease value drift
- No unsupported claims added
- Easy rollback path

---

## ENFORCEMENT

### How These Rules Are Enforced
1. **Sentinel review** — Every plan is checked against these rules before execution
2. **Pre-build checklist** — Before any build, verify: deploy approval, scope, no protected values
3. **Post-build verification** — Confirm localhost works, build passes, no forbidden claims
4. **Codex briefing** — These rules are included in every Codex task prompt
5. **Self-audit** — After completion, review against this checklist

### Violation Handling
| Severity | Action |
|----------|--------|
| Minor (style, wording) | Note in report, fix if quick |
| Moderate (scope creep) | Pause, ask O D for direction |
| Major (deploy without approval) | STOP, rollback if possible, notify O D immediately |
| Critical (legal/financial claim) | STOP, revert change, report to O D immediately |

---

## REMAINING BLOCKERS

Before these rules go live:
1. O D approval of this draft
2. Codex briefing update (include rules in every task)
3. Sentinel prompt injection (rules in system context)
4. One pilot project test

---

## CONTEXT UPDATE REQUIRED

- **Files to update:** `CURRENT_STATE.md` — Safety Rules v1 drafted with 15 rules
- **New decision:** IMG adopts partial ECC discipline layer
- **New open loop:** Pilot rollout plan needed (IMGLikeness recommended)
- **Next command O D can use:** "Approve safety rules" or "Pilot on [project name]"
