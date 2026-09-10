# App Flow Document
## AI-Powered Automatic Block Planning — SIH 2026 (PS 26027)

---

## 1. Actors

| Actor | Primary goal in the app |
|---|---|
| **Engineering Officer** | Log/verify track defects; review bundled blocks affecting their tasks |
| **S&T Officer** | Log/verify signal faults; review bundled blocks affecting their tasks |
| **Traction (TRD) Officer** | Log/verify OHE issues; confirm power-off windows |
| **Divisional Control (COA) operator** | Confirm true corridor availability windows |
| **Planning/Nodal Officer** | Reviews the generated plan, inspects justification, approves or overrides |
| **Viewer (Senior Management)** | Views dashboard KPIs and plan-vs-baseline proof, read-only |

---

## 2. High-Level Flow

```
[Data Ingestion] → [Prioritization] → [Optimization] → [Plan Review] → [Approval/Override] → [Dashboard/Proof]
```

---

## 3. Detailed Flow by Stage

### 3.1 Data Ingestion Flow
1. Department officer (Engineering / S&T / TRD) logs in.
2. Officer lands on **"My Pending Tasks"** view, filtered to their department.
3. Officer adds/edits a task: location (km marker), task type, estimated duration, overdue status (auto-computed from IRPWM periodicity + last-maintained date), safety class.
4. On save, task enters the **unified task pool** (visible cross-department to Planning Officer only, not to other departments by default — avoids overwhelming individual officers with others' data).
5. COA operator separately updates/confirms corridor availability windows and flags any traffic-sensitive periods (via WTT/goods forecast sync).

### 3.2 Prioritization Flow (automatic, background)
1. On any new/updated task, the system recomputes that task's **priority score**.
2. Score and its contributing factors (overdue days, safety class, degradation trend, traffic impact) are stored alongside the task.
3. Task list re-sorts by priority automatically; no manual step required.

### 3.3 Optimization Flow (triggered)
1. Planning Officer clicks **"Generate Plan"** (weekly or monthly horizon selector).
2. System passes the current prioritized task pool + corridor windows + constraint set to the CP-SAT solver.
3. Solver returns a candidate block plan: which tasks are bundled into which blocks, on which corridor, in which window.
4. System computes the **manual-baseline comparison** in parallel (what the same tasks would have cost as separate, uncoordinated blocks).
5. Planning Officer is shown the proposed plan + comparison.

### 3.4 Plan Review Flow
1. Planning Officer views the proposed plan as a **block calendar** (weekly) and a **strategic view** (monthly).
2. Officer clicks into any single block to see:
   - Which tasks/departments are bundled in it
   - Why (constraint reasoning — e.g. "TRD power-off enables Engineering + S&T to work concurrently")
   - Priority score justification for each included task
3. Officer can flag a concern (e.g., "machine unavailable this week") which feeds back as an added constraint for the next solve.

### 3.5 Approval / Override Flow
1. Officer either:
   - **Approves** the plan → block plan is marked confirmed, becomes the operational reference for the week/month.
   - **Overrides** a specific block (e.g., reschedule, split, reject) → system re-solves the remainder of the plan around the override.
2. All approvals/overrides are logged with officer identity and timestamp (audit trail for adoption trust).

### 3.6 Dashboard / Proof Flow
1. Any user (including read-only Viewer) lands on the **Dashboard** by default.
2. Dashboard shows:
   - Asset health summary (by department / corridor)
   - Upcoming approved blocks (calendar view)
   - Plan vs. manual-baseline metrics: blocks taken, downtime hours, train paths lost, weeks-to-clear
   - The worked corridor example as a standing "proof" panel for demo purposes
3. Regeneration trigger: whenever a new defect is logged or the WTT/timetable changes, the dashboard flags **"Plan may be outdated — regenerate?"** rather than silently auto-committing a new plan.

---

## 4. Screen-Level Flow Map

```
Login
  │
  ├── Department Officer path
  │     └── My Pending Tasks → Add/Edit Task → (auto) Priority recompute
  │
  ├── COA Operator path
  │     └── Corridor Availability → Update Windows
  │
  └── Planning Officer path
        └── Dashboard (home)
              ├── Task Pool (all departments, prioritized)
              ├── Generate Plan (weekly/monthly)
              │      └── Proposed Plan View
              │             ├── Block Detail (constraint + priority justification)
              │             ├── Flag Concern → re-solve
              │             └── Approve / Override
              ├── Approved Block Calendar
              └── Proof Panel (plan vs. baseline comparison)
```

---

## 5. Key Interaction Principle

At every decision point where the system proposes something (a priority order, a bundled block, a full plan), the flow provides a **"why"** affordance before asking for approval. The system never auto-commits — Stage 5 (approval) is always a distinct, explicit human action, consistent with the decision-support positioning in the PRD.
