# Technical Requirement Document (TRD)
## AI-Powered Automatic Block Planning — SIH 2026 (PS 26027)

---

## 1. System Overview

The system ingests maintenance and corridor data from five conceptual source systems, scores tasks for priority, and passes them to a constraint solver that produces bundled block schedules. It is a **classical operations-research system**: a resource-constrained scheduling problem with time windows (NP-hard class), not a machine-learning prediction system. ML/scoring is limited to an explainable prioritization layer.

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Application / solver integration | **Python** | First-class OR-Tools bindings, fast prototyping |
| Optimization engine | **Google OR-Tools CP-SAT** | Constraint-programming solver: handles hard constraints natively, soft constraints as weighted penalties, provably optimal/near-optimal, CPU-only |
| Data layer | **PostgreSQL** (relational) | Unified store for tasks, corridors, windows, blocks — relational integrity fits well-defined entities |
| API layer | Python web framework (e.g. FastAPI) | Serves dashboard, exposes plan-generation and override endpoints |
| Dashboard / frontend | **React** | Web dashboard for visualization, plan review, and override |
| Prioritization scoring | Transparent rule-based scoring, or a gradient-boosted model with exposable feature contributions | Must remain explainable — a black-box score is a non-starter for adoption |

All components run on commodity CPU hardware; no GPU or specialized hardware required.

---

## 3. Source Systems Modelled (Synthetic in Prototype)

| System | Owner | Data Modelled |
|---|---|---|
| **TMS** (Track Management System) | Engineering | Track defects, geometry scores, overdue tamping/renewal tasks |
| **SMMS** (Signalling Maintenance & Management System) | S&T | Signal gear faults, point machine records, overdue inspections |
| **TDMS** (Traction Distribution Management System) | Traction | OHE condition, contact wire wear, power-off requirements |
| **COA** (Control Office Application) | Divisional Control | Real-time train running, true corridor availability windows |
| **BDMS** (Block & Disconnection Management System) | All three departments | The existing manual request workflow — reference only, not replaced in prototype |
| **WTT** (Working Time Table) + goods forecast | — | Passenger and freight traffic density, used to steer blocks to low-traffic windows |

Synthetic datasets stand in for all five; parameters are grounded in IRPWM (periodicities) and RDSO (maintenance norms) so every figure is defensible.

---

## 4. Processing Pipeline (Five Stages)

```
Stage 1: Data Integration
   TMS + SMMS + TDMS + COA + WTT  →  unified task/window store

Stage 2: Prioritization
   Each task scored on: overdue days (vs IRPWM), safety class,
   degradation trend, traffic impact  →  explainable priority score

Stage 3: Optimization (core engine)
   CP-SAT solver: bundle multi-department tasks into shared blocks,
   enforce hard constraints, minimize block count & train displacement

Stage 4: Plan Generation
   Weekly operational schedule + monthly strategic view,
   regenerated on new defects / timetable changes

Stage 5: Proof & Dashboard
   Live asset health, upcoming blocks, plan-vs-manual-baseline comparison
```

---

## 5. Constraint Model (Solver Requirements)

This is the technical core of the system. The solver must model:

| Constraint | Type | Detail |
|---|---|---|
| **OHE power-off dependency** | Hard | On electrified sections, most track/signal work requires the overhead line de-energized first. A Traction power-off is a *prerequisite* for other departments' work in that window, and simultaneously creates the safety envelope inside which they can work. **This is the single most important modelled detail** — it is what makes bundling both necessary and possible. |
| **Adjacent-line safety** | Hard | Work on one line can restrict operations on the adjacent line; solver must account for this when scheduling parallel-track work. |
| **Shared machine availability** | Hard | Tamping machines, tower wagons, etc. are scarce, shared across divisions, and have their own schedules/locations. |
| **Minimum viable block duration** | Hard | A block must cover travel-to-site, setup, work, testing, and clearance — solver must not propose blocks shorter than this floor. |
| **Statutory periodicity (IRPWM)** | Hard deadline | Overdue tasks (relative to IRPWM-mandated intervals) receive highest priority and cannot be deferred indefinitely. |
| **Traffic windows (WTT + goods forecast)** | Soft | Blocks are steered toward low-traffic windows; violations are penalized, not forbidden, since some maintenance is unavoidable in higher-traffic windows. |
| **Objective function** | — | Minimize (a) total number of blocks taken, and (b) total train-path/displacement impact, subject to all hard constraints and IRPWM deadlines being met. |

**Key modelling principle:** because parallel tasks inside one shared block run concurrently rather than sequentially, a bundled block's duration is the **longest single task inside it**, not the sum of all tasks — this is the mathematical basis of the recovered capacity.

---

## 6. Prioritization Model

- **Inputs:** overdue days (relative to IRPWM periodicity), safety criticality class, degradation trend, traffic/operational impact.
- **Output:** a single explainable priority score per task, with each contributing factor visible/attributable.
- **Requirement:** any ranking must be justifiable to a Railway officer on demand (NFR1 in PRD) — rules out opaque deep-learning scoring for this layer. A transparent rule-based model or a gradient-boosted model with exposed feature attributions are both acceptable; the exposed reasoning is the requirement, not the specific algorithm.

---

## 7. Integration Readiness (Beyond Hackathon Scope)

The data and constraint model should be designed so that, when real system access becomes available, the synthetic-data adapters can be swapped for live TMS/SMMS/TDMS/COA/BDMS feeds **without redesigning the solver or schema** — i.e., source systems are abstracted behind a common task/window ingestion interface.

---

## 8. Non-Functional / Technical Constraints

| Area | Requirement |
|---|---|
| Compute | Runs on CPU only; laptop or basic server sufficient for prototype scale |
| Solve time | Weekly plan for a division-scale task set should solve in seconds to low minutes |
| Explainability | Both the priority scorer and the solver's constraint reasoning must be inspectable per decision |
| Extensibility | New constraint types (beyond the six listed) must be addable to the CP-SAT model without a schema rewrite |
| Data provenance | Every synthetic parameter must map to a cited IRPWM/RDSO source or public train-timing data |

---

## 9. Out of Scope (Technical)

- No live system integration (BDMS, TMS, etc. remain synthetic in the prototype)
- No physical/IoT sensor layer
- No autonomous execution — solver output is a **proposal**, requiring human approval before becoming an operational block request
- No predictive/forecasting ML model for defect prediction (future extension, not core scope)
