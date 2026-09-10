# Implementation Plan
## AI-Powered Automatic Block Planning — SIH 2026 (PS 26027)

---

## 1. Approach

Build in five phases that mirror the system's own five processing stages (data integration → prioritization → optimization → plan generation → dashboard/proof), so that a working end-to-end (if simplified) demo exists as early as possible, and each phase adds fidelity rather than new unconnected parts. This "thin slice first" approach is critical for a hackathon timeline.

---

## 2. Phased Plan

### Phase 0 — Setup & Data Foundations
**Goal:** Environment ready, schema live, synthetic data defined.
- Set up Python environment, PostgreSQL instance, repo structure (backend / solver / frontend).
- Implement the schema from the Backend Schema document.
- Define synthetic dataset generation for one demo corridor (e.g., the report's Station A–B worked example) with:
  - IRPWM-grounded periodicities per task type
  - RDSO-grounded safety classes
  - A handful of realistic pending tasks across Engineering / S&T / TRD
- **Exit criteria:** database seeded with the worked-example corridor and its three tasks (tamping, OHE patching, point-machine repair).

### Phase 1 — Prioritization Layer
**Goal:** Every task has an explainable priority score.
- Implement scoring function: overdue days (vs IRPWM), safety class, degradation trend, traffic impact → weighted or rule-based score.
- Store per-component breakdown in `task_priority_scores`.
- Unit-test against the worked example (e.g., confirm the 8-days-overdue Engineering task and 2-days-overdue TRD task score sensibly relative to the 3-days-due S&T task).
- **Exit criteria:** task list, sorted by score, matches sensible urgency ordering with visible component breakdown.

### Phase 2 — Constraint Model & Optimizer (Core Engine)
**Goal:** CP-SAT model that reproduces the worked-example bundling result.
- Integrate Google OR-Tools CP-SAT.
- Model hard constraints in priority order of implementation:
  1. OHE power-off dependency (the single most important constraint)
  2. Minimum viable block duration
  3. Statutory (IRPWM) deadlines
  4. Adjacent-line safety
  5. Shared machine availability
  6. Traffic windows as soft/penalized constraint
- Objective: minimize total blocks + total train-path displacement.
- Validate: run the solver against the seeded worked example and confirm it produces **1 bundled 4-hour block** instead of 3 separate blocks — this is the core proof-of-concept milestone.
- **Exit criteria:** solver output on the demo corridor matches the report's stated result (3 blocks/9 hrs/21 paths → 1 block/4 hrs/7 paths).

### Phase 3 — Plan Generation & Justification
**Goal:** Solver output becomes a structured, explainable plan.
- Persist solver output into `plans`, `blocks`, `block_tasks`.
- Generate `block_justifications` text from the constraints that were active for each block (e.g., auto-compose "TRD power-off enabled concurrent Engineering + S&T work").
- Compute and persist `plan_baseline_comparisons` (simulate the uncoordinated/manual approach for the same task set as the comparison baseline).
- Implement weekly vs. monthly horizon generation.
- **Exit criteria:** a `GET plan` API returns a full plan with per-block justification and a baseline comparison object.

### Phase 4 — Backend API & Approval Workflow
**Goal:** Officers can review, approve, and override.
- Build REST endpoints: task CRUD, trigger plan generation, fetch plan/block detail, approve/override/flag actions, dashboard summary endpoint.
- Implement `approvals_audit` logging on every approve/override/flag action.
- Implement re-solve-on-override logic (partial re-optimization around a fixed/rejected block).
- **Exit criteria:** an officer can approve a plan via API and see it reflected as `status = 'approved'`.

### Phase 5 — Dashboard (Frontend)
**Goal:** Non-technical officer can use the system end-to-end.
- Build React dashboard per the UI/UX Design Brief:
  - Dashboard home (KPIs + Proof Panel)
  - Task Pool with score breakdown
  - Proposed Plan calendar view with Block Detail + justification
  - Approve/Override controls
- Wire to backend API from Phase 4.
- **Exit criteria:** full click-through demo — log a task, see it prioritized, generate a plan, inspect a bundled block's reasoning, approve it, see the Proof Panel update.

### Phase 6 — Demo Polish & Pitch Readiness
**Goal:** The worked example is a compelling, reproducible live demo.
- Script the demo around the report's own worked example (10 km corridor, three tasks, three departments) so judges see the exact before/after numbers reproduced live, not just claimed.
- Prepare fallback static screenshots/recording in case of live-demo risk.
- Prepare answers for the three flagged risks: data availability, departmental adoption, scale — each already has a stated mitigation (see PRD §10) and should be ready as talking points.
- **Exit criteria:** a rehearsed, timed demo that reproduces the "3 blocks → 1 block" proof point live.

---

## 3. Suggested Team Split (typical 6-person hackathon team)

| Role | Owns |
|---|---|
| Backend/Data Lead | Phase 0, schema, synthetic data generation |
| Optimization Lead | Phase 1–2, CP-SAT constraint model (highest-risk, start earliest) |
| Backend/API Lead | Phase 3–4, plan persistence, approval workflow |
| Frontend Lead ×2 | Phase 5, dashboard build against UI/UX brief |
| Presentation/Research Lead | IRPWM/RDSO sourcing for data defensibility, Phase 6 pitch narrative |

The **Optimization Lead's track (Phase 1–2) is the critical path** — it should start immediately and in parallel with Phase 0's data setup, since every later phase depends on the solver producing a correct, explainable result.

---

## 4. Milestone Checklist

- [ ] Schema deployed, worked-example corridor seeded
- [ ] Priority scores computed and explainable for all seeded tasks
- [ ] CP-SAT solver reproduces the report's 3→1 block result on the worked example
- [ ] Plan + block justifications persisted and retrievable via API
- [ ] Approve/override workflow functional with audit logging
- [ ] Dashboard shows Proof Panel with live-computed (not hardcoded) baseline comparison
- [ ] End-to-end demo rehearsed against the worked example

---

## 5. Risk-Ordered Build Priority

Given hackathon time constraints, if something must be cut, cut in this order (last item cut first):
1. Monthly strategic view (weekly is sufficient to prove the concept)
2. Machine-availability constraint (lower priority than power-off dependency)
3. Override/re-solve workflow (approve-only flow still proves the concept)
4. Traffic-window soft constraint (nice-to-have refinement)

**Never cut:** the OHE power-off hard constraint and the plan-vs-baseline Proof Panel — these two elements are what make the report's central argument (and the demo's central "aha") land.
