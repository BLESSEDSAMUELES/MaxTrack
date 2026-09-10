# UI/UX Design Brief
## AI-Powered Automatic Block Planning — SIH 2026 (PS 26027)

---

## 1. Design Goal

The primary audience is a **non-technical Railway officer**, not a data scientist. The interface must make an operations-research output (a solver's bundled schedule) feel like a trustworthy, inspectable operational plan — not a black box. Every screen should answer, at a glance: *what is being proposed, why, and what does it save us?*

---

## 2. Design Principles

1. **Explainability over cleverness.** Every score, ranking, and scheduling decision must have a visible "why" — a tooltip, an expandable panel, or an inline reason string. No unexplained numbers.
2. **Proof before polish.** The plan-vs-baseline comparison (blocks, hours, train paths saved) is the single most important visual on the product — it should be impossible to miss on the dashboard.
3. **Officer stays in control.** Approve/override actions must be prominent and unambiguous; the system should never look like it has already acted on its own.
4. **Departmental clarity, unified view.** Engineering/S&T/TRD tasks should be visually distinguishable (consistent color-coding per department) even when bundled together in one block.
5. **Calm, operational tone.** This is safety-adjacent infrastructure software — avoid playful or "consumer app" styling; favor a clean, dense, high-trust data-console aesthetic (think control-room dashboard, not a shopping app).

---

## 3. Information Architecture

```
Dashboard (home)
├── Asset Health Overview
├── Upcoming Approved Blocks (calendar)
├── Proof Panel (plan vs. baseline)
│
Task Pool
├── Filter by department / corridor / priority
├── Task detail (score breakdown)
│
Plan Generation
├── Horizon selector (weekly / monthly)
├── Proposed Plan (block calendar)
│   └── Block Detail (bundled tasks, constraint reasoning)
├── Approve / Override controls
│
Corridor & Constraints (admin/COA view)
├── Corridor availability windows
├── Machine availability
```

---

## 4. Key Screens

### 4.1 Dashboard
- **Top band:** three to four KPI cards — blocks this month, corridor downtime, train paths recovered, tasks overdue.
- **Center:** upcoming approved blocks on a calendar/timeline, color-coded by department, with bundled blocks visually marked (e.g., a stacked/multi-color bar) to make co-scheduling visible at a glance.
- **Side/lower panel:** the "Proof Panel" — a before/after comparison (manual baseline vs. proposed system) using the worked-example metrics (3 blocks → 1; 9 hrs → 4 hrs; 21 paths lost → 7). This should be a persistent, prominent widget, not buried in a report.

### 4.2 Task Pool
- Table/list view, sortable by priority score, filterable by department and corridor.
- Each row shows: task, location (km marker), overdue status (visually flagged if overdue, e.g., red/amber), safety class, priority score.
- Clicking a task expands a **score breakdown**: overdue days, safety class, degradation trend, traffic impact — each shown as a labeled contribution, not just a final number.

### 4.3 Proposed Plan / Block Calendar
- Calendar or Gantt-style view of proposed blocks across the horizon (week/month).
- Each block is a single visual unit that, when it bundles multiple departments, shows a segmented color bar (e.g., split fill: Engineering blue / S&T green / TRD orange) so the co-scheduling is visually self-evident.
- Clicking a block opens **Block Detail**:
  - List of bundled tasks with owning department
  - Constraint reasoning in plain language (e.g., "Traction power-off required for OHE patching enables Engineering tamping and S&T point-machine work in the same window")
  - Duration logic note (block length = longest task, not sum) — a small explainer, since this is the core "aha" of the whole system
- Approve / Flag Concern / Override controls sit directly on this screen, not hidden in a separate menu.

### 4.4 Corridor & Constraints (secondary/admin view)
- Simple table/timeline of corridor availability windows (from COA) and traffic density (from WTT/goods forecast).
- Machine availability (tamping machines, tower wagons) shown as a shared resource calendar, since scarcity here is a hard constraint.

---

## 5. Visual & Interaction Language

| Element | Guidance |
|---|---|
| **Color coding** | Fixed per-department colors used consistently across every screen (e.g., Engineering / S&T / TRD each get one color) — this is the single most load-bearing visual convention in the app, since bundling is the whole point |
| **Status flags** | Overdue = red/amber, on-schedule = neutral, safety-critical = a distinct icon/badge, not just color (accessibility) |
| **Typography** | Clear, dense, tabular-friendly (data-heavy screens); avoid decorative fonts |
| **Explainability affordances** | Consistent pattern across the app — an info icon or expandable row that always reveals "why" behind any score or decision |
| **Approval actions** | Distinct, high-contrast buttons (Approve / Override) — never ambiguous with informational UI |
| **Empty/loading states** | Since solves may take a few seconds, show a clear "generating plan…" state rather than a blank screen |

---

## 6. Personas (for design reference)

- **Priya, Divisional Engineer:** Logs defects between site visits, wants fast entry, doesn't want to interpret a solver — wants to trust the system flagged the right urgency.
- **Rakesh, Planning/Nodal Officer:** The primary decision-maker; needs the "why" behind every proposed block before he'll put his name on an approval.
- **Divisional Manager (Viewer):** Wants a 10-second glance at the dashboard to see whether the new system is actually saving corridor time — the Proof Panel is built for this person.

---

## 7. Accessibility & Trust Notes

- Never rely on color alone to convey overdue/safety status — pair with icon or label.
- Keep the "why" panel copy in plain operational language, not solver/ML jargon (no "objective function," no "penalty weight" in officer-facing text — translate into railway terms like "recovered train paths" and "power-off window").
- Every number shown (priority score, downtime hours, train paths) should be traceable on click to its source data — reinforces the "data defensibility" requirement from the PRD.
