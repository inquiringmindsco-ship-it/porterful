# COORDINATION PROTOCOL — Porterful Audio Experience

**Version:** 1.0  
**Effective:** 2026-04-29  
**Applies to:** ChatGPT, Sentinel, Codex, User

---

## Roles & Responsibilities

### ChatGPT — Product Designer & UX Strategist
- Defines user-facing features and experience flow
- Writes aesthetic direction ("Kenwood feel", "Winamp nostalgia")
- Specifies control layouts, presets, interaction patterns
- Provides visual references and analogies
- **Does NOT write production code**
- **Does NOT make architecture decisions**
- **Does NOT define file structure**

### Sentinel — Architect & Integration Guardian
- Reviews all specs for technical feasibility
- Defines feature flags and rollout gating
- Enforces integration guardrails (no player rewrites, no new audio engines)
- Catches cross-browser issues, Safari limits, performance problems
- Writes infrastructure code (flags, hooks, types)
- Approves or rejects Codex implementations
- **Does NOT implement features**
- **Does NOT override user decisions**

### Codex — Implementer
- Writes production code ONLY against approved specs
- Follows file structure and patterns defined by Sentinel
- Tests on mobile Safari before claiming done
- Never adds features not in the spec
- Never modifies feature flag defaults
- **Does NOT design features**
- **Does NOT decide priority order**
- **Does NOT modify the spec during implementation**

### User (Od) — Decision Maker
- Approves or rejects spec scope
- Sets priority order
- Provides aesthetic direction ("I want Kenwood vibes")
- Accepts or rejects completed work
- **Can override any role's decision**

---

## Workflow

### 1. User Has Idea
User describes feature in natural language. Example: "I want a Kenwood-style visualizer and EQ."

### 2. ChatGPT Designs
- Writes user-facing spec (UX flow, controls, modes)
- Provides analogies and references
- Defines what the feature IS and IS NOT
- **Output:** Design rationale + UX requirements (plain text)

### 3. Sentinel Architects
- Reads ChatGPT's design rationale
- Adds technical constraints, flag names, file structure
- Defines integration points (what must not break)
- Writes SPEC.md with exact acceptance criteria
- **Output:** `SPEC-{feature}.md` with architecture section

### 4. User Approves
- Reviews SPEC.md
- Approves scope, or requests changes
- **Blocking step** — no implementation until approved

### 5. Sentinel Prepares Infrastructure
- Adds feature flags to `src/lib/features.ts`
- Creates skeleton files, types, and interfaces
- Defines hook signatures
- **Output:** Commit-ready infrastructure PR

### 6. Codex Implements
- Reads SPEC.md completely before writing code
- Implements ONLY what the spec describes
- Uses feature flags to gate all new UI
- Follows existing code patterns
- **Output:** Feature PR against infrastructure branch

### 7. Sentinel Reviews
- Checks: no player regressions, flag-gated, mobile tested
- Approves, requests changes, or rejects
- **Blocking step** — no merge until approved

### 8. User Accepts
- Tests on staging (with feature flag enabled)
- Accepts or requests changes
- **Blocking step** — no production flag flip until accepted

### 9. Sentinel Enables
- Flips feature flag to `true` in production
- Monitors for 48h before announcing

---

## Communication Rules

| Situation | Who Speaks First | Who Decides |
|-----------|-----------------|-------------|
| "Should we add X?" | ChatGPT (design rationale) | User |
| "How do we build X?" | Sentinel (architecture options) | User picks, Sentinel defines |
| "X is implemented" | Codex (PR description) | Sentinel reviews, User accepts |
| "X broke Y" | Sentinel (impact analysis) | User prioritizes fix order |
| "Can we ship X early?" | Sentinel (risk assessment) | User decides |
| "X looks wrong" | ChatGPT (aesthetic feedback) | User decides |

---

## Forbidden Actions

### ChatGPT Must NOT:
- Tell Codex what files to create
- Override Sentinel's architectural decisions
- Add scope after spec is approved

### Sentinel Must NOT:
- Reject a user decision
- Implement features directly
- Approve Codex work without reviewing

### Codex Must NOT:
- Implement features without approved SPEC.md
- Modify feature flag defaults
- Rewrite existing components without Sentinel approval
- Skip mobile Safari testing
- Add "nice to have" not in spec

### User Must NOT:
- Ask Codex to implement without spec
- Change priority mid-implementation without review

---

## Current Status

| Phase | Status | Owner | Next Action |
|-------|--------|-------|-------------|
| Phase 1: Stabilize Player | 🔧 ACTIVE | Codex | Fix bugs per priority list |
| Phase 2: Visualizer | 📋 BACKLOG | ChatGPT + Sentinel | Awaiting Phase 1 |
| Phase 3: EQ | 📋 BACKLOG | ChatGPT + Sentinel | Awaiting Phase 2 |
| Phase 4: Loudness | 📋 BACKLOG | ChatGPT + Sentinel | Awaiting Phase 3 |
| Phase 5: Lossless | 📋 BACKLOG | ChatGPT + Sentinel | Awaiting Phase 4 |

---

## Active Specs

| Spec | Status | Location |
|------|--------|----------|
| Visualizer | Draft, awaiting user review | `SPEC-visualizer.md` |
| EQ v1 | Draft, awaiting user review | `SPEC-eq.md` |
| Loudness | Not started | — |
| Lossless | Not started | — |

---

## Key Documents

| Document | Purpose | Owner |
|----------|---------|-------|
| `BACKLOG-audio-experience.md` | Roadmap and phase tracking | Sentinel |
| `SPEC-visualizer.md` | Visualizer specification | Sentinel |
| `SPEC-eq.md` | EQ specification | Sentinel |
| `src/lib/features.ts` | Feature flags | Sentinel |
| `src/lib/audio-context.tsx` | Audio engine | Codex (modify with Sentinel approval) |

---

## Escalation

If roles disagree:
1. ChatGPT and Sentinel debate in comments on the SPEC
2. If unresolved, User decides
3. User decision is final
4. Document decision in `BACKLOG-audio-experience.md` Decision Log

---

**Protocol established:** 2026-04-29  
**Next review:** After Phase 1 completion
