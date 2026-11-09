# Hospital OPD Predictive Queue & Standby State Machine Pipeline

> Bayesian no-show probability scoring, dynamic capacity allocation, and instant standby promotion on patient no-show.

**Domain:** Healthcare & Resource Scheduling  
**Architecture Pattern:** Typed Stage-based Pipeline DAG with Sagas & State Machine  

---

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


---

## 🛠️ Getting Started

### Prerequisites
- Node.js >= 22.0.0
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/systemflow-s1-hospital-opd.git
cd systemflow-s1-hospital-opd

# Install dependencies
npm install
```

### Running Tests & Typechecks

```bash
# Run the complete test suite (includes race condition & concurrency tests)
npm test

# Build production TypeScript output
npm run build

# Run typechecker
npm run typecheck
```

---

## 🏛️ Pipeline DAG Architecture

All pipeline stages are type-safe and execute in ordered succession. If any stage throws a transient error, compensating saga rollbacks run in reverse order to ensure 100% data consistency.

```
src/
├── core/                  # Embedded zero-dependency Pipeline Engine & Saga Rollback
│   ├── pipeline.ts
│   ├── types.ts
│   ├── logger.ts
│   └── errors.ts
├── stages/                # Modular pipeline stages
├── pipeline.ts            # Stage assembly & DAG orchestrator
├── types.ts               # Domain interfaces & state contracts
└── index.ts               # Public library API export
```

---

## 🚀 GitHub Actions CI

Every commit and pull request runs automated build, typecheck, and vitest race condition tests via `.github/workflows/ci.yml`.

## 📄 License
MIT
