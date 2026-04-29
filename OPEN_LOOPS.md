# OPEN_LOOPS.md — Porterful Ecosystem

**Last updated: 2026-04-29 16:15 CDT**

---

## Resolved Incidents

### ✅ INCIDENT-001: Device Kernel Panic
- **Status:** CLOSED
- **Declared:** 2026-04-29 15:58 CDT
- **Closed:** 2026-04-29 16:15 CDT
- **Cause:** Hardware memory parity error (AMCC1 PLANE1 DIR_PAR_ERR)
- **Impact:** NONE — all production systems operational
- **Files:** `INCIDENT_SYSTEM_SHUTDOWN_2026-04-29.md`, `MAC_MINI_DEVICE_INCIDENT_REPORT_2026-04-29.md`

---

## Active Open Loops

### 🟡 Album-Order Navigation
- **Status:** OPEN
- **Issue:** Route exists at `/dashboard/artist/album-order` but no link on dashboard
- **Fix:** Add "Edit Public View" button to artist dashboard header
- **Assigned:** Sentinel (awaiting Od's go-ahead)

### 🟡 Track Preview Controls UX
- **Status:** OPEN
- **Issue:** Playback Access controls present but minimally labeled
- **Fix:** Add helper text, tooltips, section description
- **Assigned:** Sentinel (awaiting Od's go-ahead)

### 🟡 Artist Dashboard Route Cleanup
- **Status:** OPEN
- **Issue:** `/dashboard/dashboard/artist` duplicate route exists
- **Fix:** Remove or redirect legacy route
- **Assigned:** Sentinel (awaiting Od's go-ahead)

---

## Paused Work

- ⏸️ Porterful rights declaration gate — ON HOLD (Od testing)
- ⏸️ New feature development — ON HOLD (awaiting Od's signal)
- ⏸️ UX fixes (album-order, preview controls) — ON HOLD (awaiting Od's signal)

---

## Ready to Resume (when Od gives go-ahead)

1. Add "Edit Public View" / "Reorder Albums" button to artist dashboard
2. Add Playback Access helper text and tooltips
3. Clean up duplicate dashboard routes
4. Porterful rights declaration gate (when Od finishes testing)

---

## Monitoring

- **Mac mini hardware:** Watch for recurrence of kernel panics
- **Action if recurrence:** Run Apple Diagnostics (Restart + hold D)
