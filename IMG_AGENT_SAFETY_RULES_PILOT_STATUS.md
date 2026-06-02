# IMG Agent Safety Rules — Pilot Status

**Date:** 2026-06-02  
**Status:** ✅ ADOPTED — Behavioral rules active on IMGLikeness  
**Install:** None. No config changes. No code changes.

---

## Active Rules (STOP — Enforced Immediately)

| # | Rule | Trigger | Action On Violation |
|---|------|---------|---------------------|
| 1 | Deployment Approval | Attempt deploy without O D keyword | STOP, ask for explicit approval |
| 4 | Homepage Architecture Lock | Structural homepage changes without approval | STOP, ask O D |
| 5 | Proposal/Legal/Lease Freeze | Protected value changes without approval | STOP, report diff, wait |
| 6 | No Unsupported Claims | Forbidden claim added to user-facing copy | STOP, flag, suggest safe alternative |
| 7 | Word Ban ("node") | "node" used for IMG x Likeness positioning | STOP, replace with approved term |
| 13 | Stop/Abort | O D says stop/pause/wait | STOP all actions immediately |
| 14 | Recon-Only Mode | O D says recon/research/audit only | STOP all edits/deploys |

## Warning Rules (WARN — Flagged, Reported, Work Continues)

| # | Rule | Trigger | Action On Violation |
|---|------|---------|---------------------|
| 2 | Localhost Review Default | Screenshots requested before localhost check | WARN, offer localhost first |
| 3 | No Big-Bang Edits | >2 major areas touched in one task | WARN, ask for plan |
| 8 | Deployment Status Truth | "deployed" used without verification | WARN, require exact label |
| 9 | Git/Vercel Safety | Deploy report missing SHA/URL | WARN, request missing info |
| 10 | Dependency Safety | Package change without justification | WARN, ask for reason |
| 11 | Database/Payments Safety | DB change without migration details | WARN, request details |
| 12 | Completion Report | Vague or incomplete report | WARN, ask for structured format |
| 15 | One Project Pilot | Rules applied to non-pilot project | WARN, remind pilot is IMGLikeness |

## What Happens Next

1. **Next IMGLikeness task** → Sentinel applies pre-flight checklist
2. **During task** → STOP/WARN rules enforced in real time
3. **After task** → Structured completion report
4. **End of work cycle** → Pilot report:
   - Which rules triggered
   - Which rules prevented issues
   - Which rules need revision
   - Recommendation: continue / expand / limit

## Files

- Master rules: `~/Documents/porterful/IMG_AGENT_SAFETY_RULES_v1.md`
- IMGLikeness reference: `~/Documents/imglikeness/IMG_AGENT_SAFETY_RULES_v1.md`
- Pilot plan: `~/Documents/porterful/IMG_AGENT_SAFETY_RULES_PILOT_PLAN.md`
- Install shortlist: `~/Documents/porterful/IMG_AGENT_SAFETY_RULES_INSTALL_SHORTLIST.md`
- This status: `~/Documents/porterful/IMG_AGENT_SAFETY_RULES_PILOT_STATUS.md`

## Current State Updated

`~/Documents/archtext/context/CURRENT_STATE.md` updated with:
- ECC discipline layer adopted
- Pilot active on IMGLikeness
- No install performed
- No config changes performed
- Next work cycle must follow STOP/WARN rules

---

**Adopted by O D Porter on 2026-06-02**
