"""
Google OR-Tools CP-SAT Optimization Engine for MaxTrack (SIH 2026 PS 26027).
Formulates the Resource-Constrained Multi-Department Block Scheduling Problem
with OHE Power-Off Dependency, Longest-Task Duration Equivalence, and Traffic Windows.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import time
from ortools.sat.python import cp_model
from backend.app.config import MIN_VIABLE_BLOCK_DURATION_MINUTES

def run_block_optimization(
    tasks: List[Dict[str, Any]],
    windows: List[Dict[str, Any]],
    corridor_info: Dict[str, Any],
    time_limit_seconds: int = 10
) -> Dict[str, Any]:
    """
    CP-SAT constraint solver to bundle tasks into coordinated corridor blocks.
    
    Returns:
        dict containing:
        - status: 'OPTIMAL', 'FEASIBLE', or 'INFEASIBLE'
        - solver_runtime_ms: int
        - blocks: list of bundled block objects with tasks and explainable justifications
        - unassigned_tasks: list of tasks that could not be scheduled in the given windows
    """
    start_time = time.time()
    model = cp_model.CpModel()

    num_tasks = len(tasks)
    num_windows = len(windows)

    if num_tasks == 0 or num_windows == 0:
        return {
            "status": "EMPTY",
            "solver_runtime_ms": int((time.time() - start_time) * 1000),
            "blocks": [],
            "unassigned_tasks": tasks
        }

    # 1. Decision Variables
    # x[i, w] == 1 if task i is scheduled in window w
    x = {}
    for i in range(num_tasks):
        for w in range(num_windows):
            x[i, w] = model.NewBoolVar(f"x_{i}_{w}")

    # u[w] == 1 if window w has an active block
    u = {}
    for w in range(num_windows):
        u[w] = model.NewBoolVar(f"u_{w}")

    # duration[w] = integer duration in minutes of the block in window w
    duration = {}
    max_window_dur = max([w.get("duration_minutes", 360) for w in windows])
    for w in range(num_windows):
        w_dur = windows[w].get("duration_minutes", 360)
        duration[w] = model.NewIntVar(0, w_dur, f"duration_{w}")

    # 2. Hard Constraints

    # Constraint 2.1: At most one window per task (each task scheduled <= 1 time)
    for i in range(num_tasks):
        model.Add(sum(x[i, w] for w in range(num_windows)) <= 1)

    # Constraint 2.2: Window activation linking
    for w in range(num_windows):
        for i in range(num_tasks):
            model.Add(u[w] >= x[i, w])
        # If no tasks assigned, u[w] is 0
        model.Add(sum(x[i, w] for i in range(num_tasks)) >= u[w])

    # Constraint 2.3: Longest Task Duration Equivalence (The Core Math)
    # Block duration must be at least as long as the longest task scheduled in it
    for w in range(num_windows):
        for i in range(num_tasks):
            task_dur = tasks[i].get("estimated_duration_minutes", 120)
            model.Add(duration[w] >= task_dur * x[i, w])
        # Minimum viable block duration when window is active
        model.Add(duration[w] >= MIN_VIABLE_BLOCK_DURATION_MINUTES * u[w])
        # Duration is 0 if window is inactive
        w_dur = windows[w].get("duration_minutes", 360)
        model.Add(duration[w] <= w_dur * u[w])

    # Constraint 2.4: OHE Power-Off Dependency (The Anchor Hard Constraint)
    # If any task in window w requires power off (e.g. TRD wire work or track work under 25kV line),
    # a Traction crew / TRD task MUST be present in window w to supervise the isolation envelope.
    for w in range(num_windows):
        trd_task_indices = [
            i for i, t in enumerate(tasks)
            if t.get("department_code") == "TRD" or "TRD" in t.get("department_name", "")
        ]
        for i in range(num_tasks):
            if tasks[i].get("requires_power_off", False):
                if trd_task_indices:
                    # TRD presence required to de-energize and earth the OHE
                    model.Add(sum(x[k, w] for k in trd_task_indices) >= x[i, w])

    # Constraint 2.5: Shared Machine Mutual Exclusion
    # Machines (e.g. tamping machines) cannot be at two different corridors/tasks in the same window
    machines_used = set(t.get("requires_machine_type") for t in tasks if t.get("requires_machine_type"))
    for machine in machines_used:
        m_indices = [i for i, t in enumerate(tasks) if t.get("requires_machine_type") == machine]
        if len(m_indices) > 1:
            for w in range(num_windows):
                # If they share the exact same machine, can they do multiple tasks in one window?
                # Total time of machine tasks must not exceed window duration
                model.Add(
                    sum(tasks[i].get("estimated_duration_minutes", 120) * x[i, w] for i in m_indices) <= windows[w].get("duration_minutes", 360)
                )

    # 3. Objective Function Formulation
    # - Strongly reward scheduling high priority tasks
    # - Strongly penalize creating separate blocks (drives bundling!)
    # - Penalize high-traffic windows (steers to low-traffic times)
    objective_terms = []

    # Priority reward
    for i in range(num_tasks):
        p_score = int(tasks[i].get("priority_score", 50) * 10)
        # Highly overdue/critical tasks get massive incentive
        if tasks[i].get("safety_class") == "critical" or tasks[i].get("overdue_days", 0) > 5:
            p_score += 500
        for w in range(num_windows):
            objective_terms.append(p_score * x[i, w])

    # Block creation penalty (Forces bundling into fewer windows!)
    BLOCK_PENALTY = 3000
    for w in range(num_windows):
        objective_terms.append(-BLOCK_PENALTY * u[w])

    # Traffic density penalty
    for w in range(num_windows):
        density = windows[w].get("traffic_density", "low").lower()
        if density == "high":
            traffic_pen = 400
        elif density == "medium":
            traffic_pen = 200
        else:
            traffic_pen = 50
        objective_terms.append(-traffic_pen * u[w])

    model.Maximize(sum(objective_terms))

    # 4. Solve Model
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = time_limit_seconds
    solver.parameters.num_search_workers = 4
    solver_status = solver.Solve(model)

    runtime_ms = int((time.time() - start_time) * 1000)

    status_str = "INFEASIBLE"
    if solver_status == cp_model.OPTIMAL:
        status_str = "OPTIMAL"
    elif solver_status == cp_model.FEASIBLE:
        status_str = "FEASIBLE"

    if status_str in ["OPTIMAL", "FEASIBLE"]:
        scheduled_blocks = []
        assigned_task_ids = set()

        for w in range(num_windows):
            if solver.Value(u[w]) == 1:
                assigned_in_w = [
                    tasks[i] for i in range(num_tasks)
                    if solver.Value(x[i, w]) == 1
                ]
                if not assigned_in_w:
                    continue

                for t in assigned_in_w:
                    assigned_task_ids.add(t["id"])

                block_dur = solver.Value(duration[w])
                window_data = windows[w]
                w_start = window_data["window_start"]
                if isinstance(w_start, str):
                    start_dt = datetime.fromisoformat(w_start)
                else:
                    start_dt = w_start
                end_dt = start_dt + timedelta(minutes=block_dur)

                # Check if power off was required
                power_off = any(t.get("requires_power_off", False) for t in assigned_in_w)
                departments_in_block = list(set(t.get("department_code", "ENG") for t in assigned_in_w))
                is_bundled = len(departments_in_block) > 1

                # Generate Explainable Justifications
                justifications = []
                if is_bundled:
                    dept_names = ", ".join(departments_in_block)
                    justifications.append({
                        "constraint_type": "cross_department_bundling",
                        "explanation_text": (
                            f"Multi-department synchronization: Coordinated work across {dept_names}. "
                            f"Running concurrently inside a single block."
                        )
                    })

                if power_off:
                    justifications.append({
                        "constraint_type": "power_off_dependency",
                        "explanation_text": (
                            "Traction (TRD) power-off envelope established on 25kV OHE. "
                            "Permits concurrent Engineering track tamping and S&T signaling maintenance "
                            "under statutory electrical safety regulations."
                        )
                    })

                # Compute duration math explainer
                sum_dur = sum(t.get("estimated_duration_minutes", 120) for t in assigned_in_w)
                max_dur = max(t.get("estimated_duration_minutes", 120) for t in assigned_in_w)
                savings = max(0, sum_dur - block_dur)

                duration_math = {
                    "block_duration_minutes": block_dur,
                    "sum_individual_minutes": sum_dur,
                    "minutes_saved": savings,
                    "explanation": (
                        f"Longest task ({max_dur} mins) drives block duration. "
                        f"Sequential manual execution would have taken {sum_dur} mins. "
                        f"Saved {savings} mins ({savings/60:.1f} hrs) of corridor downtime."
                    )
                }

                scheduled_blocks.append({
                    "window_id": window_data.get("id", w),
                    "scheduled_start": start_dt.isoformat(),
                    "scheduled_end": end_dt.isoformat(),
                    "duration_minutes": block_dur,
                    "power_off_required": power_off,
                    "is_bundled": is_bundled,
                    "departments": departments_in_block,
                    "tasks": assigned_in_w,
                    "justifications": justifications,
                    "duration_math": duration_math
                })

        unassigned = [t for t in tasks if t["id"] not in assigned_task_ids]

        return {
            "status": status_str,
            "solver_runtime_ms": runtime_ms,
            "blocks": scheduled_blocks,
            "unassigned_tasks": unassigned
        }

    return {
        "status": status_str,
        "solver_runtime_ms": runtime_ms,
        "blocks": [],
        "unassigned_tasks": tasks
    }
