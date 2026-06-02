# IMG Agent Safety Rules — Minimal Install Shortlist

**Status:** Draft  
**Date:** 2026-06-02  
**Posture:** Partial ECC adoption  
**Constraint:** No installs yet. Planning only.

---

## Philosophy

Install nothing until pilot proves need.

These are candidates for install, not commitments.

**Starting posture:**
- Partial ECC adoption (discipline layer only)
- Security profile: only if needed
- Project-flow-ops: enabled
- Knowledge-ops: disabled
- Browser-QA: only when useful
- Continuous-learning: disabled
- MCP surface: disabled unless explicitly approved

---

## Install Shortlist

### Phase 1: High Priority (Install if pilot shows violations)

| # | Tool | Purpose | Risk Level | Approval Required |
|---|------|---------|------------|-------------------|
| 1 | **ESLint custom rules** | Enforce no-big-bang, homepage lock, claim-check | Low | O D |
| 2 | **Pre-commit hooks** | Block commits with protected values, unverified claims | Low | O D |

**Why Phase 1:** These catch violations at code-time, before deploy. Low risk, high value.

### Phase 2: Medium Priority (Install if Phase 1 insufficient)

| # | Tool | Purpose | Risk Level | Approval Required |
|---|------|---------|------------|-------------------|
| 3 | **Vercel preview branches** | Force localhost review before prod deploy | Medium | O D |
| 4 | **GitHub branch protection** | Require review before main merge | Medium | O D |
| 5 | **Custom lint plugin** | Scan for forbidden claims in JSX/strings | Medium | O D |

**Why Phase 2:** These catch violations at CI/CD time. Medium risk (may slow workflow).

### Phase 3: Low Priority (Install if systematic issues persist)

| # | Tool | Purpose | Risk Level | Approval Required |
|---|------|---------|------------|-------------------|
| 6 | **Dependency audit** | `npm audit` + bundle size check on install | Low | O D |
| 7 | **Structured logging** | Enforce status report format | Low | O D |

**Why Phase 3:** Nice-to-have. Only if violations slip through Phases 1-2.

---

## Do Not Install

| Tool / Feature | Why Not |
|----------------|---------|
| **Full ECC framework** | Too heavy. IMG needs partial discipline only. |
| **Claude Code / Cursor hooks** | Not needed yet. Rules are behavioral, not tool-bound. |
| **New CI/CD pipeline** | Vercel + GitHub already sufficient. |
| **New project management tool** | Rules are process, not tooling. |
| **Complex approval workflow** | O D keyword approval is simpler and faster. |
| **MCP servers** | Disabled unless explicitly approved. Surface area too large. |
| **Continuous learning / memory** | Disabled. No autonomous improvement loops. |
| **Security profile (full)** | Only if needed. Partial posture sufficient. |
| **Knowledge-ops** | Disabled. No external knowledge ingestion. |
| **Browser-QA automation** | Only when useful. Not a default install. |

---

## Install Order

If pilot succeeds and violations are caught:

```
Week 2: Phase 1 — ESLint custom rules + pre-commit hooks
Week 3: Phase 2 — Vercel preview branches + GitHub branch protection
Week 4: Phase 3 — Custom lint plugin + dependency audit
Week 5+: Phase 4 — Structured logging (if needed)
```

---

## Risk Assessment

| Tool | Risk | Mitigation |
|------|------|------------|
| ESLint custom rules | Low | Can be disabled quickly; doesn't affect runtime |
| Pre-commit hooks | Low | Can be bypassed with `--no-verify` if needed |
| Vercel preview branches | Medium | May add deploy step; can skip if urgent |
| GitHub branch protection | Medium | Requires PR review; may slow hotfixes |
| Custom lint plugin | Medium | False positives possible; needs tuning |
| Dependency audit | Low | Runs post-install; doesn't block workflow |
| Structured logging | Low | Passive; doesn't block development |

---

## Approval Process

### Before Any Install
1. Pilot must show ≥3 violations/week
2. O D says "install [tool]"
3. Sentinel documents: why needed, what it does, risk level
4. Install in pilot project only (IMGLikeness)
5. Monitor for 1 week
6. If friction acceptable → expand to next project

### After Install
- Report weekly: violations caught, false positives, workflow impact
- O D decides: keep, adjust, or remove

---

## Summary Table

| Phase | Tools | Trigger | Risk | Status |
|-------|-------|---------|------|--------|
| 1 | ESLint + pre-commit | Pilot shows violations | Low | Not installed |
| 2 | Preview branches + branch protection | Phase 1 insufficient | Medium | Not installed |
| 3 | Custom lint + dependency audit | Phase 2 insufficient | Low-Medium | Not installed |
| 4 | Structured logging | Systematic issues persist | Low | Not installed |

| Do Not Install | Full ECC, MCP, continuous learning, knowledge-ops, browser-QA default | N/A | N/A | Not installed |

---

## CONTEXT UPDATE REQUIRED

- **Files to update:** `CURRENT_STATE.md` — Minimal install shortlist drafted with phases
- **New decision:** Partial ECC adoption, no full install, no MCP, no continuous learning
- **Next command O D can use:** "Approve pilot on IMGLikeness" or "Add [tool] to Phase 1"
