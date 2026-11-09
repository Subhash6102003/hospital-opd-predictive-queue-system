# S1 — Hospital OPD Predictive Queue & State Machine

## Problem

Indian public hospitals face up to 40% outpatient no-show rates.
If a doctor has 20 slots and 8 people don't show up, turning away patients as "fully booked" leaves doctor hours wasted while sick patients are sent home.

## Solution Architecture: Predictive Scoring + Priority Standby State Machine

```
Patient Booking Request
         ↓
[1. Predictive Scoring]  → Computes P(no-show) from patient history & travel distance
         ↓
[2. Dynamic Allocation]  → Allocates BOOKED_PRIMARY (up to doctor capacity) or STANDBY_QUEUED
         ↓
[3. Real-time Transition Machine]
    ├── Patient arrives  → CHECKED_IN → COMPLETED
    └── Patient misses   → NO_SHOW → Immediately promotes next STANDBY_QUEUED to primary!
```

### Guarantees
- Doctor schedule utilization remains near 100% without predatory double-booking.
- Real-time standby promotion guarantees waiting room patients receive vacated slots immediately.
