# Backend Schema
## AI-Powered Automatic Block Planning — SIH 2026 (PS 26027)
**Database:** PostgreSQL (relational)

---

## 1. Schema Design Principles

- Every task, regardless of source system (TMS/SMMS/TDMS), is normalized into one `tasks` table with a `department` discriminator — this is what makes cross-department bundling possible in the first place.
- Constraint-relevant facts (power-off requirement, machine needs, safety class) live on the task itself so the solver can read them without cross-referencing multiple source-system schemas.
- Plans are versioned (`plans` + `plan_blocks`) rather than mutated in place, so a Planning Officer can compare a re-solved plan against the previously approved one, and so the audit trail (FR requirement) is preserved.
- Source-system origin is tracked (`source_system`, `source_ref`) even though data is synthetic in the prototype, so real-feed integration later is a data-mapping exercise, not a schema rewrite.

---

## 2. Core Tables

### 2.1 `departments`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| code | VARCHAR(10) UNIQUE | 'ENG', 'SNT', 'TRD' |
| name | VARCHAR(100) | 'Engineering', 'Signal & Telecom', 'Traction Distribution' |

### 2.2 `corridors`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| name | VARCHAR(150) | e.g. "Station A – Station B" |
| division | VARCHAR(100) | |
| start_km | NUMERIC(8,3) | |
| end_km | NUMERIC(8,3) | |
| line_count | INT | number of parallel lines, for adjacent-line constraint |
| electrified | BOOLEAN | gates whether OHE power-off constraint applies |

### 2.3 `tasks`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| department_id | FK → departments | |
| corridor_id | FK → corridors | |
| source_system | VARCHAR(20) | 'TMS' / 'SMMS' / 'TDMS' — integration-readiness field |
| source_ref | VARCHAR(100) | external record id in the source system |
| task_type | VARCHAR(100) | e.g. 'tamping', 'point_machine_repair', 'OHE_patching' |
| km_marker_start | NUMERIC(8,3) | |
| km_marker_end | NUMERIC(8,3) | |
| estimated_duration_minutes | INT | |
| requires_power_off | BOOLEAN | drives the core hard constraint |
| requires_machine_type | VARCHAR(50) NULLABLE | FK-like reference to `machines.machine_type` |
| safety_class | VARCHAR(20) | e.g. 'critical', 'high', 'routine' |
| last_maintained_date | DATE | |
| irpwm_periodicity_days | INT | statutory interval this task type is bound by |
| overdue_days | INT (computed) | derived: today − (last_maintained_date + periodicity) |
| status | VARCHAR(20) | 'pending', 'scheduled', 'completed', 'deferred' |
| created_at / updated_at | TIMESTAMP | |

### 2.4 `task_priority_scores`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| task_id | FK → tasks | |
| overdue_component | NUMERIC(6,2) | |
| safety_component | NUMERIC(6,2) | |
| degradation_component | NUMERIC(6,2) | |
| traffic_impact_component | NUMERIC(6,2) | |
| total_score | NUMERIC(6,2) | |
| computed_at | TIMESTAMP | recomputed whenever the source task changes |

*(Storing each component, not just the total, is what makes the score explainable in the UI — see UI/UX Design Brief §4.2.)*

### 2.5 `corridor_availability_windows`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| corridor_id | FK → corridors | |
| window_start | TIMESTAMP | |
| window_end | TIMESTAMP | |
| traffic_density | VARCHAR(20) | 'low' / 'medium' / 'high' — from WTT + goods forecast |
| source | VARCHAR(20) | 'COA' / 'WTT' / 'goods_forecast' |

### 2.6 `machines`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| machine_type | VARCHAR(50) | e.g. 'tamping_machine', 'tower_wagon' |
| identifier | VARCHAR(50) | asset tag |
| home_division | VARCHAR(100) | |

### 2.7 `machine_availability`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| machine_id | FK → machines | |
| available_from | TIMESTAMP | |
| available_to | TIMESTAMP | |

---

## 3. Plan & Block Tables

### 3.1 `plans`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| horizon_type | VARCHAR(10) | 'weekly' / 'monthly' |
| horizon_start | DATE | |
| horizon_end | DATE | |
| status | VARCHAR(20) | 'proposed', 'approved', 'superseded' |
| generated_at | TIMESTAMP | |
| solver_runtime_ms | INT | for performance monitoring / NFR3 |

### 3.2 `blocks`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| plan_id | FK → plans | |
| corridor_id | FK → corridors | |
| scheduled_start | TIMESTAMP | |
| scheduled_end | TIMESTAMP | |
| duration_minutes | INT (computed) | = duration of the longest bundled task, not the sum — reflects the core co-scheduling insight |
| power_off_required | BOOLEAN | true if any bundled task requires it |
| status | VARCHAR(20) | 'proposed', 'approved', 'overridden', 'rejected' |

### 3.3 `block_tasks` (join table — the bundling record)
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| block_id | FK → blocks | |
| task_id | FK → tasks | |

*(This table is the concrete evidence of co-scheduling: a `block_id` with multiple `task_id` rows spanning more than one `department_id` is a bundled block.)*

### 3.4 `block_justifications`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| block_id | FK → blocks | |
| constraint_type | VARCHAR(50) | e.g. 'power_off_dependency', 'adjacent_line_safety', 'machine_availability' |
| explanation_text | TEXT | human-readable reasoning surfaced in the UI's Block Detail view |

### 3.5 `plan_baseline_comparisons`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| plan_id | FK → plans | |
| baseline_blocks_count | INT | what an uncoordinated/manual approach would have taken |
| proposed_blocks_count | INT | |
| baseline_downtime_minutes | INT | |
| proposed_downtime_minutes | INT | |
| baseline_train_paths_lost | INT | |
| proposed_train_paths_lost | INT | |

*(This table backs the Dashboard's Proof Panel directly — see UI/UX Design Brief §4.1.)*

### 3.6 `approvals_audit`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| plan_id | FK → plans | |
| block_id | FK → blocks NULLABLE | null if action applies to whole plan |
| officer_id | FK → users | |
| action | VARCHAR(20) | 'approved', 'overridden', 'flagged' |
| notes | TEXT | |
| action_at | TIMESTAMP | |

---

## 4. Users & Access

### 4.1 `users`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| name | VARCHAR(150) | |
| department_id | FK → departments NULLABLE | null for Planning Officer / Viewer roles that span departments |
| role | VARCHAR(30) | 'dept_officer', 'coa_operator', 'planning_officer', 'viewer' |
| email | VARCHAR(150) UNIQUE | |

---

## 5. Entity Relationship Summary

```
departments 1───* tasks *───1 corridors
tasks 1───1 task_priority_scores
tasks *───* blocks   (via block_tasks)
plans 1───* blocks
blocks 1───* block_justifications
plans 1───1 plan_baseline_comparisons
plans 1───* approvals_audit
corridors 1───* corridor_availability_windows
machines 1───* machine_availability
tasks *───1 machines  (via requires_machine_type)
users 1───* approvals_audit
```

---

## 6. Notes on Integration-Readiness

`source_system` and `source_ref` on `tasks` (and equivalent fields that could be added to `corridor_availability_windows`) exist specifically so that, when real TMS/SMMS/TDMS/COA feeds become available, an ingestion adapter can populate these tables without altering the solver-facing schema — satisfying the extensibility requirement in the TRD (§7).
