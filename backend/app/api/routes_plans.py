from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.models.entities import (
    get_db, Plan, Block, BlockTask, BlockJustification,
    PlanBaselineComparison, ApprovalsAudit, Task, CorridorAvailabilityWindow, Corridor
)
from backend.app.schemas.api_schemas import (
    PlanResponseSchema, BlockSchema, BlockActionRequest,
    BaselineComparisonSchema, TaskResponseSchema
)
from backend.app.api.routes_tasks import format_task_response
from backend.app.engine.optimizer import run_block_optimization
from backend.app.engine.baseline import simulate_manual_baseline

router = APIRouter(prefix="/api", tags=["Plans"])

def build_baseline_schema(comp: PlanBaselineComparison) -> BaselineComparisonSchema:
    saved_mins = max(0, comp.baseline_downtime_minutes - comp.proposed_downtime_minutes)
    recov_paths = max(0, comp.baseline_train_paths_lost - comp.proposed_train_paths_lost)
    red_blocks = max(0, comp.baseline_blocks_count - comp.proposed_blocks_count)
    cap_pct = 0.0
    if comp.baseline_downtime_minutes > 0:
        cap_pct = round((saved_mins / comp.baseline_downtime_minutes) * 100.0, 1)

    return BaselineComparisonSchema(
        baseline_blocks_count=comp.baseline_blocks_count,
        proposed_blocks_count=comp.proposed_blocks_count,
        baseline_downtime_minutes=comp.baseline_downtime_minutes,
        proposed_downtime_minutes=comp.proposed_downtime_minutes,
        baseline_train_paths_lost=comp.baseline_train_paths_lost,
        proposed_train_paths_lost=comp.proposed_train_paths_lost,
        downtime_saved_minutes=saved_mins,
        train_paths_recovered=recov_paths,
        blocks_reduced_count=red_blocks,
        capacity_recovery_percentage=cap_pct
    )

def build_block_schema(block: Block) -> dict:
    tasks_formatted = [format_task_response(bt.task) for bt in block.block_tasks]
    depts = list(set(t["department_code"] for t in tasks_formatted))
    is_bundled = len(depts) > 1

    # Duration math
    sum_individual = sum(t["estimated_duration_minutes"] for t in tasks_formatted)
    mins_saved = max(0, sum_individual - block.duration_minutes)

    duration_math = {
        "block_duration_minutes": block.duration_minutes,
        "sum_individual_minutes": sum_individual,
        "minutes_saved": mins_saved,
        "explanation": (
            f"Longest task ({block.duration_minutes}m) drives block duration. "
            f"Manual sequential shutdown would take {sum_individual}m. "
            f"Saved {mins_saved}m ({mins_saved/60:.1f}h) of corridor downtime."
        )
    }

    return {
        "id": block.id,
        "corridor_id": block.corridor_id,
        "scheduled_start": block.scheduled_start,
        "scheduled_end": block.scheduled_end,
        "duration_minutes": block.duration_minutes,
        "power_off_required": block.power_off_required,
        "status": block.status,
        "is_bundled": is_bundled,
        "departments": depts,
        "tasks": tasks_formatted,
        "justifications": [
            {"constraint_type": j.constraint_type, "explanation_text": j.explanation_text}
            for j in block.justifications
        ],
        "duration_math": duration_math
    }

@router.get("/plans/latest", response_model=PlanResponseSchema)
def get_latest_plan(corridor_id: Optional[int] = 1, db: Session = Depends(get_db)):
    plan = db.query(Plan).order_by(Plan.id.desc()).first()
    if not plan:
        # Generate one automatically if none exists
        return generate_plan(horizon_type="weekly", corridor_id=corridor_id, db=db)

    comp_schema = build_baseline_schema(plan.baseline_comparison) if plan.baseline_comparison else None
    blocks_formatted = [build_block_schema(b) for b in plan.blocks]

    return {
        "id": plan.id,
        "horizon_type": plan.horizon_type,
        "horizon_start": plan.horizon_start,
        "horizon_end": plan.horizon_end,
        "status": plan.status,
        "generated_at": plan.generated_at,
        "solver_runtime_ms": plan.solver_runtime_ms,
        "blocks": blocks_formatted,
        "baseline_comparison": comp_schema
    }

@router.post("/plans/generate", response_model=PlanResponseSchema)
def generate_plan(
    horizon_type: str = "weekly",
    corridor_id: int = 1,
    db: Session = Depends(get_db)
):
    corridor = db.query(Corridor).filter(Corridor.id == corridor_id).first()
    if not corridor:
        raise HTTPException(status_code=404, detail="Corridor not found")

    tasks_db = db.query(Task).filter(Task.corridor_id == corridor_id).all()
    windows_db = db.query(CorridorAvailabilityWindow).filter(
        CorridorAvailabilityWindow.corridor_id == corridor_id
    ).all()

    # Prepare tasks list for solver
    solver_tasks = []
    for t in tasks_db:
        p_score = t.priority_score.total_score if t.priority_score else 50.0
        solver_tasks.append({
            "id": t.id,
            "department_code": t.department.code,
            "department_name": t.department.name,
            "task_type": t.task_type,
            "estimated_duration_minutes": t.estimated_duration_minutes,
            "requires_power_off": t.requires_power_off,
            "requires_machine_type": t.requires_machine_type,
            "safety_class": t.safety_class,
            "priority_score": p_score,
            "overdue_days": t.overdue_days,
            "km_marker_start": t.km_marker_start,
            "km_marker_end": t.km_marker_end
        })

    # Prepare windows list for solver
    solver_windows = []
    for w in windows_db:
        duration_mins = int((w.window_end - w.window_start).total_seconds() / 60)
        solver_windows.append({
            "id": w.id,
            "window_start": w.window_start,
            "window_end": w.window_end,
            "duration_minutes": duration_mins,
            "traffic_density": w.traffic_density
        })

    # 1. Run Baseline Simulator
    baseline_metrics = simulate_manual_baseline(solver_tasks)

    # 2. Run CP-SAT Solver
    corridor_info = {
        "id": corridor.id,
        "name": corridor.name,
        "electrified": corridor.electrified
    }
    solver_res = run_block_optimization(solver_tasks, solver_windows, corridor_info)

    # 3. Create Plan in DB
    now = datetime.now(timezone.utc)
    new_plan = Plan(
        horizon_type=horizon_type,
        horizon_start=now,
        horizon_end=now + timedelta(days=7 if horizon_type == "weekly" else 30),
        status="proposed",
        solver_runtime_ms=solver_res["solver_runtime_ms"]
    )
    db.add(new_plan)
    db.flush()

    # 4. Save Proposed Blocks
    proposed_downtime = 0
    proposed_blocks_count = len(solver_res["blocks"])

    for b_data in solver_res["blocks"]:
        proposed_downtime += b_data["duration_minutes"]
        block_record = Block(
            plan_id=new_plan.id,
            corridor_id=corridor.id,
            scheduled_start=datetime.fromisoformat(b_data["scheduled_start"]),
            scheduled_end=datetime.fromisoformat(b_data["scheduled_end"]),
            duration_minutes=b_data["duration_minutes"],
            power_off_required=b_data["power_off_required"],
            status="proposed"
        )
        db.add(block_record)
        db.flush()

        # Link tasks
        for t_dict in b_data["tasks"]:
            bt = BlockTask(block_id=block_record.id, task_id=t_dict["id"])
            db.add(bt)

        # Save justifications
        for j in b_data["justifications"]:
            just = BlockJustification(
                block_id=block_record.id,
                constraint_type=j["constraint_type"],
                explanation_text=j["explanation_text"]
            )
            db.add(just)

    # 5. Save Baseline Comparison Record
    # Train paths lost under bundled plan (approximately 2.33 paths per hour of downtime, lower in night windows)
    proposed_paths_lost = round((proposed_downtime / 60.0) * 1.75)

    comp_record = PlanBaselineComparison(
        plan_id=new_plan.id,
        baseline_blocks_count=baseline_metrics["baseline_blocks_count"],
        proposed_blocks_count=proposed_blocks_count,
        baseline_downtime_minutes=baseline_metrics["baseline_downtime_minutes"],
        proposed_downtime_minutes=proposed_downtime,
        baseline_train_paths_lost=baseline_metrics["baseline_train_paths_lost"],
        proposed_train_paths_lost=proposed_paths_lost
    )
    db.add(comp_record)
    db.commit()
    db.refresh(new_plan)

    return get_latest_plan(corridor_id=corridor_id, db=db)

@router.post("/blocks/{block_id}/action")
def take_block_action(
    block_id: int,
    action_req: BlockActionRequest,
    db: Session = Depends(get_db)
):
    block = db.query(Block).filter(Block.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")

    block.status = action_req.action
    audit = ApprovalsAudit(
        plan_id=block.plan_id,
        block_id=block.id,
        officer_name=action_req.officer_name,
        role=action_req.role,
        action=action_req.action,
        notes=action_req.notes
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "block_id": block.id,
        "new_status": block.status,
        "action": action_req.action,
        "logged_at": audit.action_at.isoformat()
    }
