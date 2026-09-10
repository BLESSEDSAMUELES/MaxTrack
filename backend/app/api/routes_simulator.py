from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.models.entities import (
    get_db, Task, Corridor, Plan, Block, CorridorAvailabilityWindow
)
from backend.app.schemas.api_schemas import DashboardStatsSchema
from backend.app.api.routes_plans import get_latest_plan, build_baseline_schema, build_block_schema
from backend.app.engine.baseline import simulate_manual_baseline
from backend.app.engine.optimizer import run_block_optimization

router = APIRouter(prefix="/api", tags=["Simulator & Dashboard"])

@router.get("/dashboard/stats", response_model=DashboardStatsSchema)
def get_dashboard_stats(db: Session = Depends(get_db)):
    corridor = db.query(Corridor).first()
    pending_tasks = db.query(Task).filter(Task.status == "pending").all()
    overdue_count = sum(1 for t in pending_tasks if t.overdue_days > 0)
    critical_count = sum(1 for t in pending_tasks if t.safety_class == "critical")

    # Get latest plan
    latest_plan_data = get_latest_plan(corridor_id=corridor.id if corridor else 1, db=db)
    
    proof_panel = latest_plan_data.get("baseline_comparison")
    recent_blocks = latest_plan_data.get("blocks", [])

    return {
        "total_pending_tasks": len(pending_tasks),
        "overdue_tasks_count": overdue_count,
        "critical_safety_count": critical_count,
        "active_plan_id": latest_plan_data.get("id"),
        "corridor_name": corridor.name if corridor else "Station A - Station B",
        "division": corridor.division if corridor else "Delhi Division",
        "proof_panel": proof_panel,
        "recent_blocks": recent_blocks
    }

@router.post("/simulator/what-if")
def run_what_if_simulation(
    scenario_payload: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Interactive 'What-If' testbed endpoint:
    Allows user to test adding an emergency defect or toggling machine failure.
    Runs both the uncoordinated baseline simulator and CP-SAT solver live in < 1.5 seconds.
    """
    corridor_id = scenario_payload.get("corridor_id", 1)
    tasks = scenario_payload.get("tasks", [])
    
    # If no tasks provided in payload, fetch active tasks from DB
    if not tasks:
        db_tasks = db.query(Task).filter(Task.corridor_id == corridor_id).all()
        for t in db_tasks:
            tasks.append({
                "id": t.id,
                "department_code": t.department.code,
                "department_name": t.department.name,
                "task_type": t.task_type,
                "estimated_duration_minutes": t.estimated_duration_minutes,
                "requires_power_off": t.requires_power_off,
                "requires_machine_type": t.requires_machine_type,
                "safety_class": t.safety_class,
                "priority_score": t.priority_score.total_score if t.priority_score else 50.0,
                "overdue_days": t.overdue_days,
                "km_marker_start": t.km_marker_start,
                "km_marker_end": t.km_marker_end
            })

    # Optional injected emergency task
    injected_defect = scenario_payload.get("injected_defect")
    if injected_defect:
        tasks.append(injected_defect)

    # Windows
    windows_db = db.query(CorridorAvailabilityWindow).filter(
        CorridorAvailabilityWindow.corridor_id == corridor_id
    ).all()
    windows = []
    for w in windows_db:
        windows.append({
            "id": w.id,
            "window_start": w.window_start.isoformat(),
            "window_end": w.window_end.isoformat(),
            "duration_minutes": int((w.window_end - w.window_start).total_seconds() / 60),
            "traffic_density": w.traffic_density
        })

    # Run baseline
    baseline = simulate_manual_baseline(tasks)

    # Run optimizer
    corridor_info = {"id": corridor_id, "name": "Station A - Station B", "electrified": True}
    solver_res = run_block_optimization(tasks, windows, corridor_info, time_limit_seconds=5)

    # Compute comparison
    opt_downtime = sum(b["duration_minutes"] for b in solver_res["blocks"])
    opt_blocks = len(solver_res["blocks"])
    opt_paths = round((opt_downtime / 60.0) * 1.75)

    downtime_saved = max(0, baseline["baseline_downtime_minutes"] - opt_downtime)
    paths_saved = max(0, baseline["baseline_train_paths_lost"] - opt_paths)
    recovery_pct = round((downtime_saved / max(1, baseline["baseline_downtime_minutes"])) * 100.0, 1)

    return {
        "scenario": scenario_payload.get("scenario_name", "Custom What-If Run"),
        "solver_status": solver_res["status"],
        "solver_runtime_ms": solver_res["solver_runtime_ms"],
        "baseline": baseline,
        "optimized": {
            "blocks_count": opt_blocks,
            "downtime_minutes": opt_downtime,
            "train_paths_lost": opt_paths,
            "downtime_saved_minutes": downtime_saved,
            "train_paths_recovered": paths_saved,
            "capacity_recovery_percentage": recovery_pct
        },
        "blocks": solver_res["blocks"],
        "unassigned_tasks": solver_res["unassigned_tasks"]
    }
