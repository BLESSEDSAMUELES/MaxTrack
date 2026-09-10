# Project Requirement Document (PRD)
## AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations
**Smart India Hackathon 2026 — Problem Statement ID: 26027**
**Category:** Software | **Theme:** Transportation & Logistics | **Organisation:** Ministry of Railways

---

## 1. Purpose

This document defines what the system must do, for whom, and why — independent of implementation detail. It is the reference for scope decisions during the hackathon build and for evaluating whether a delivered feature actually solves the stated problem.

---

## 2. Problem Statement

Indian Railways periodically withdraws track sections from traffic to perform maintenance ("blocks"). Three departments — **Engineering**, **Signal & Telecommunication (S&T)**, and **Traction Distribution (TRD)** — each raise block requests independently through the BDMS system, with no shared visibility into one another's plans or true corridor availability.

Consequence: the same corridor is shut multiple times on separate days for separate departments, when a single coordinated shutdown would suffice. Maintenance itself is not the problem — the *lack of coordination* in planning it is.

**Goal:** Increase asset (corridor) availability for train operations, without reducing the volume or quality of maintenance performed, by coordinating multi-department work into fewer, better-timed blocks.

---

## 3. Objectives

| # | Objective | Success Signal |
|---|---|---|
| O1 | Unify maintenance demand across Engineering, S&T, and TRD into one data view | All three departments' pending tasks visible in a single system |
| O2 | Prioritize tasks transparently by urgency and safety impact | Every priority score is explainable to a Railway officer |
| O3 | Bundle multi-department work into shared blocks wherever safe | Reduction in total block count vs. manual baseline |
| O4 | Respect all hard operational constraints (esp. OHE power-off) | Zero constraint violations in generated plans |
| O5 | Produce weekly and monthly block schedules | Schedules regenerate automatically when new defects/timetable changes arrive |
| O6 | Prove the value of the approach quantitatively | Dashboard shows plan vs. manual-baseline comparison (blocks, downtime, train paths) |

---

## 4. Stakeholders & Users

| Stakeholder | Role in the system |
|---|---|
| **Section/Divisional Engineer (Engineering)** | Logs/reviews track defects and tamping/renewal needs; reviews bundled plans |
| **S&T Maintenance Officer** | Logs signal/point-machine faults; reviews bundled plans |
| **Traction Distribution Officer** | Logs OHE/contact-wire issues; owns the power-off constraint |
| **Divisional Control / COA operator** | Supplies real corridor availability; validates traffic impact |
| **Planning/Nodal Officer (primary approver)** | Reviews the system's proposed block plan, approves or overrides it — retains final authority |
| **Railway Board / Senior Management (dashboard viewer)** | Views asset-availability KPIs and plan-vs-baseline proof |

The system is **decision-support**, not autonomous control — every stage assumes a human officer can inspect, question, and override the output.

---

## 5. Scope

### 5.1 In Scope (Hackathon Prototype)
- Ingesting synthetic datasets representing TMS, SMMS, TDMS, COA, and WTT/goods-forecast data
- Explainable prioritization scoring per task
- Constraint-based optimization that bundles cross-department tasks into shared blocks
- Weekly and monthly block plan generation
- Dashboard showing: pending tasks, proposed blocks, asset health, and a plan-vs-manual-baseline comparison
- A worked example / demo scenario proving the co-scheduling benefit

### 5.2 Out of Scope (Hackathon Prototype)
- Live integration with real TMS/SMMS/TDMS/COA/BDMS systems (data is synthetic, but modelled to be integration-ready)
- Physical/hardware sensors or IoT — this is a software-only solution
- Full national/multi-zone rollout — prototype targets a single division/corridor
- Automated approval — the system proposes, a human approves
- Predictive/ML failure forecasting (may be a future extension; core is OR-based scheduling, not ML)

---

## 6. Functional Requirements

| ID | Requirement |
|---|---|
| FR1 | System shall ingest maintenance task records from each department (task type, location/km marker, estimated duration, overdue status, safety class) |
| FR2 | System shall ingest corridor availability windows from COA and traffic density from the WTT/goods forecast |
| FR3 | System shall compute an explainable priority score per task from overdue days (vs. IRPWM periodicity), safety criticality, degradation trend, and traffic impact |
| FR4 | System shall identify tasks that can be legally and safely bundled into a single block, honoring the OHE power-off dependency as a hard constraint |
| FR5 | System shall generate an optimized block schedule (weekly operational + monthly strategic) that minimizes total blocks and train-path loss |
| FR6 | System shall regenerate plans when new defects are logged or the timetable changes |
| FR7 | System shall display a dashboard of asset health, upcoming blocks, and pending tasks by department |
| FR8 | System shall show a quantified comparison of the proposed plan against a simulated "manual/uncoordinated" baseline (blocks taken, downtime hours, train paths lost) |
| FR9 | System shall allow a planning officer to view the justification (constraint + priority reasoning) behind any scheduled block |
| FR10 | System shall allow manual override/rejection of a proposed block plan by an authorized officer |

---

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR1 | **Explainability** — every priority ranking and scheduling decision must be traceable to stated inputs; no black-box outputs |
| NFR2 | **Correctness** — generated plans must never violate a modelled hard constraint (esp. power-off dependency, adjacent-line safety, minimum block duration) |
| NFR3 | **Performance** — a weekly plan for a division-scale dataset should generate within a few seconds to low minutes on commodity CPU hardware |
| NFR4 | **Extensibility** — the constraint model must accept new constraint types without a redesign, to support real data feeds later |
| NFR5 | **Usability** — dashboard must be understandable by a non-technical Railway officer with no ML/OR background |
| NFR6 | **Data defensibility** — synthetic data parameters must be traceable to published norms (IRPWM, RDSO), not invented figures |
| NFR7 | **Portability** — prototype must run on a laptop or basic server; no specialized hardware |

---

## 8. Constraints & Assumptions

**Constraints**
- Real Railways data (TMS, SMMS, TDMS, COA, BDMS) is not publicly accessible → synthetic data is used, grounded in IRPWM/RDSO norms.
- The problem is fundamentally an **operations-research / constraint-scheduling problem**, not a machine-learning prediction problem — the intelligence lies in constraint modelling, not a predictive model.
- Officers retain final authority; the system cannot auto-commit a block plan.

**Assumptions**
- The synthetic dataset is representative enough of real task/corridor patterns to demonstrate the bundling benefit credibly.
- A single division/corridor is sufficient scope to prove the concept before wider rollout.
- Departments are willing to log data into a shared system (adoption risk, addressed via decision-support framing).

---

## 9. Success Metrics (for demo/evaluation)

| Metric | Manual Baseline (worked example) | Target with Proposed System |
|---|---|---|
| Blocks taken (example corridor) | 3 | 1 |
| Corridor downtime | ~9 hours | ~4 hours |
| Train paths lost | ~21 | ~7 |
| Weeks to clear all pending work | 3 | 1 |

These figures come from the report's worked example (10 km corridor, Station A–B) and should be reproduced live in the prototype demo as the central proof point.

---

## 10. Risks (Product-Level)

| Risk | Mitigation |
|---|---|
| Departments resist a central planner | Position strictly as decision-support; officer retains control |
| Synthetic data unconvincing to evaluators | Ground every parameter in a cited IRPWM/RDSO norm |
| Scope creep toward ML/predictive features | Keep core framed as OR/constraint-programming; ML limited to explainable scoring only |
| National-scale rollout perceived as unrealistic for a hackathon | Explicitly frame prototype as single-division proof with a stated expansion path |
