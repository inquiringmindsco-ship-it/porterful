# IMG Agent Safety Rules — Executive Summary & Recommendation

**Date:** 2026-06-02  
**Author:** Sentinel  
**Directive:** O D Porter — ECC Workflow Guardrail Directive  
**Status:** Three deliverables complete. Awaiting O D decision.

---

## What Was Delivered

| # | Deliverable | File | Status |
|---|-------------|------|--------|
| 1 | IMG Agent Safety Rules v1 | `IMG_AGENT_SAFETY_RULES_v1.md` | ✅ Complete (15 rules) |
| 2 | Pilot Rollout Plan | `IMG_AGENT_SAFETY_RULES_PILOT_PLAN.md` | ✅ Complete (IMGLikeness target) |
| 3 | Minimal Install Shortlist | `IMG_AGENT_SAFETY_RULES_INSTALL_SHORTLIST.md` | ✅ Complete (4 phases, no installs yet) |

---

## Rule Pack Overview (15 Rules)

| # | Rule | Severity | Type |
|---|------|----------|------|
| 1 | Deployment Approval | STOP | Active |
| 2 | Localhost Review Default | WARN | Warning-only |
| 3 | No Big-Bang Edits | WARN | Warning-only |
| 4 | Homepage Architecture Lock | STOP | Active |
| 5 | Proposal/Legal/Lease Freeze | STOP | Active |
| 6 | No Unsupported Claims | STOP | Active |
| 7 | Word Ban ("node") | STOP | Active |
| 8 | Deployment Status Truth | WARN | Warning-only |
| 9 | Git/Vercel Safety | WARN | Warning-only |
| 10 | Dependency Safety | WARN | Warning-only |
| 11 | Database/Payments Safety | WARN | Warning-only |
| 12 | Completion Report | WARN | Warning-only |
| 13 | Stop/Abort | STOP | Active |
| 14 | Recon-Only Mode | STOP | Active |
| 15 | One Project Pilot | WARN | Warning-only |

**Active (STOP):** 7 rules — deployment, homepage, legal, claims, word ban, stop, recon  
**Warning-only:** 8 rules — localhost, scope, status truth, git, deps, DB, reports, pilot

---

## Pilot Plan Summary

- **Target:** IMGLikeness (recommended by O D; smaller, brand-sensitive, recent homepage work)
- **Duration:** One full work cycle
- **Success criteria:** Zero unapproved deploys, no big-bang edits, clean reports, localhost-first, no claim drift, easy rollback
- **Active rules enforced immediately:** 7 STOP rules
- **Warning rules flagged:** 8 WARN rules
- **Metrics tracked:** 7 weekly metrics
- **Expansion:** LikenessVerified → Porterful → Overstood → All

---

## Install Shortlist Summary

| Phase | Tools | Risk | Install Trigger |
|-------|-------|------|-----------------|
| 1 | ESLint custom rules + pre-commit hooks | Low | Pilot shows ≥3 violations/week |
| 2 | Vercel preview branches + GitHub branch protection | Medium | Phase 1 insufficient |
| 3 | Custom lint plugin + dependency audit | Low-Medium | Phase 2 insufficient |
| 4 | Structured logging | Low | Systematic issues persist |

**Do not install:** Full ECC, MCP servers, continuous learning, knowledge-ops, browser-QA default, complex approval workflows

---

## Recommendation

**Adopt now.**

Reasoning:
1. Rules are behavioral, not tooling — no install required to start
2. 7 STOP rules address the exact failure modes from recent incidents
3. IMGLikeness is the right pilot — small, brand-sensitive, recent homepage work
4. No friction from tooling — just discipline in prompts and checkpoints
5. Warning-only rules catch issues without blocking legitimate work

**Adoption path:**
1. O D approves rules → I enforce immediately on next IMGLikeness task
2. One work cycle on IMGLikeness → measure violations caught
3. If pilot succeeds → expand to LikenessVerified, then Porterful
4. If violations persist → install Phase 1 tools (ESLint + pre-commit)

**Risk of waiting:**
- Next IMGLikeness deploy may repeat recent failures
- Next homepage change may scope-creep without approval
- Next claim may slip into production

**Risk of adopting:**
- Minor friction on tasks (checking rules, structured reports)
- Slightly slower deploys (explicit approval required)
- These are acceptable costs for the protection gained

---

## Decision Required From O D

| Option | O D Says | What Happens |
|--------|----------|--------------|
| **Adopt now** | "Adopt rules" or "Pilot on IMGLikeness" | Rules enforced immediately on next IMGLikeness task |
| **Revise first** | "Revise rule [X]" or "Change pilot to [project]" | I adjust specific rule or pilot target |
| **Hold** | "Hold" or "Do nothing" | Rules stay drafted, no enforcement |

---

## Files Ready

All files saved in `~/Documents/porterful/`:
- `IMG_AGENT_SAFETY_RULES_v1.md` — 15 rules, enforcement, violation handling
- `IMG_AGENT_SAFETY_RULES_PILOT_PLAN.md` — IMGLikeness pilot, active vs warning, metrics
- `IMG_AGENT_SAFETY_RULES_INSTALL_SHORTLIST.md` — 4-phase install plan, do-not-install list
- `IMG_AGENT_SAFETY_RULES_EXECUTIVE_SUMMARY.md` — This file

---

## CONTEXT UPDATE REQUIRED

- **Files to update:** `CURRENT_STATE.md` — ECC guardrails drafted, awaiting adoption decision
- **New decision:** IMG adopts partial ECC discipline layer (pending O D approval)
- **New open loop:** Pilot execution awaiting O D keyword
- **Agent briefings affected:** Sentinel (enforcement), Codex (task prompts)
- **Next command O D can use:** "Adopt rules" / "Pilot on IMGLikeness" / "Revise rule [X]" / "Hold"
