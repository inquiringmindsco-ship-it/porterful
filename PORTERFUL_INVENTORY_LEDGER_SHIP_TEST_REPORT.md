# PORTERFUL INVENTORY LEDGER RECEIVE-RESERVE-SHIP TEST REPORT

**Date:** 2026-06-02 13:58 CDT  
**Status:** ✅ PASS (with design note)  
**SKU:** `COMING-HOME-TEE-001`  
**Events:** 6 (5 previous + 1 ship)

---

## Test Sequence

### Starting State (before ship)

| Metric | Value |
|---|---|
| `on_hand` | 107 |
| `reserved` | 10 |
| `available` | 97 |
| `shipped` | 0 |
| `returned` | 0 |

### Event Created

| # | Movement | Qty | Timestamp |
|---|---|---|---|
| 6 | ship | 5 | 2026-06-02T18:58:36.228067+00 |

### Expected Behavior

| Action | Expected | Reason |
|---|---|---|
| ship(5) | on_hand -= 5 | Remove from stock |
| ship(5) | shipped += 5 | Track shipped |
| ship(5) | reserved unchanged | Design choice |

### Final State (after ship)

| Metric | Expected | Actual | Status |
|---|---|---|---|
| `on_hand` | 102 | **102** | ✅ PASS |
| `reserved` | 10 | **10** | ⚠️ DESIGN CHOICE |
| `available` | 92 | **92** | ✅ PASS |
| `shipped` | 5 | **5** | ✅ PASS |
| `returned` | 0 | **0** | ✅ PASS |
| `event_count` | 6 | **6** | ✅ PASS |

---

## Full Event History

| # | Movement | Qty | Timestamp |
|---|---|---|---|
| 1 | receive | 1 | 2026-06-02T18:44:03 |
| 2 | receive | 100 | 2026-06-02T18:44:39 |
| 3 | reserve | 20 | 2026-06-02T18:44:56 |
| 4 | release | 10 | 2026-06-02T18:45:23 |
| 5 | adjust | 6 | 2026-06-02T18:45:47 |
| 6 | ship | 5 | 2026-06-02T18:58:36 |

---

## Critical Design Finding

### Ship Does NOT Auto-Release Reserved

**Behavior:** `ship(5)` reduces `on_hand` by 5 but leaves `reserved` unchanged at 10.

**Result:**
- on_hand = 102
- reserved = 10
- available = 92

**Implication:** If you reserve 10 units for an order, then ship 5 of them, you still have 10 "reserved" — but only 5 of those reserved units were actually shipped. The other 5 are still in the warehouse but marked as reserved.

### Options for Fulfillment Queue

| Option | Behavior | Complexity |
|---|---|---|
| **A** | Ship auto-releases from reserved | Medium |
| **B** | Require separate release before ship | Low |
| **C** | Track which reserved units ship | High |
| **D** | Leave as-is (manual release) | Low |

**Current implementation:** Option D — ship and release are independent. Fulfillment queue will need to handle release-before-ship or auto-release logic.

---

## Verification Checklist

| # | Check | Status | Evidence |
|---|---|---|---|
| 1 | Receive event exists | ✅ | Events 1, 2 |
| 2 | Reserve event exists | ✅ | Event 3 |
| 3 | Release event exists | ✅ | Event 4 |
| 4 | Adjust event exists | ✅ | Event 5 |
| 5 | Ship event exists | ✅ | Event 6 |
| 6 | Final on_hand correct | ✅ | 102 (107 - 5) |
| 7 | Final reserved correct | ⚠️ | 10 (unchanged by ship) |
| 8 | Final available correct | ✅ | 92 (102 - 10) |
| 9 | Final shipped correct | ✅ | 5 |
| 10 | Event sequence preserved | ✅ | 6 events in order |
| 11 | Summary derived from events | ✅ | Calculated from ledger |
| 12 | No checkout changes | ✅ | Verified |
| 13 | No fulfillment queue | ✅ | Verified |
| 14 | Build passes | ✅ | Verified |

---

## Math Verification

```
Starting:  on_hand=107, reserved=10, available=97, shipped=0
After ship(5):
  on_hand   = 107 - 5 = 102 ✅
  reserved  = 10 (unchanged) ⚠️
  shipped   = 0 + 5 = 5 ✅
  available = 102 - 10 = 92 ✅
```

---

## Conclusion

**Inventory Ledger is verified and safe to build Fulfillment Queue on top of.**

### What's Working
- ✅ All movement types function correctly
- ✅ Event-based inventory confirmed
- ✅ Summary derivation accurate
- ✅ Ship correctly reduces on_hand and increments shipped

### Design Note for Fulfillment Queue
- Ship and release are **independent events**
- Fulfillment Queue must handle the reserved → release → ship workflow
- Or implement auto-release in the fulfillment logic

**Safe to proceed to Fulfillment Queue when directed.**

---

*Reported by Sentinel*  
*Date: 2026-06-02 13:58 CDT*
