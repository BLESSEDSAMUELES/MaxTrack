from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.app.models.entities import get_db, Task, Department, Corridor, TaskPriorityScore
from backend.app.schemas.api_schemas import TaskResponseSchema, TaskCreateSchema, DepartmentSchema
from backend.app.engine.prioritizer import compute_priority_score

router = APIRouter(prefix="/api", tags=["Tasks"])

def format_task_response(task: Task) -> dict:
    dept = task.department
    p_score = task.priority_score
    score_dict = None
    if p_score:
        score_dict = {
            "overdue_component": p_score.overdue_component,
            "safety_component": p_score.safety_component,
            "degradation_component": p_score.degradation_component,
            "traffic_impact_component": p_score.traffic_impact_component,
            "total_score": p_score.total_score,
            "explanation": p_score.explanation
        }

    return {
        "id": task.id,
        "department_id": task.department_id,
        "department_code": dept.code if dept else "ENG",
        "department_name": dept.name if dept else "Engineering",
        "corridor_id": task.corridor_id,
        "source_system": task.source_system,
        "source_ref": task.source_ref,
        "task_type": task.task_type,
        "km_marker_start": task.km_marker_start,
        "km_marker_end": task.km_marker_end,
        "estimated_duration_minutes": task.estimated_duration_minutes,
        "requires_power_off": task.requires_power_off,
        "requires_machine_type": task.requires_machine_type,
        "safety_class": task.safety_class,
        "last_maintained_date": task.last_maintained_date,
        "irpwm_periodicity_days": task.irpwm_periodicity_days,
        "overdue_days": task.overdue_days,
        "status": task.status,
        "priority_score": score_dict
    }

@APIRouter().get("/departments", response_model=List[DepartmentSchema])
@router.get("/departments", response_model=List[DepartmentSchema])
def get_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()

@router.get("/tasks", response_model=List[TaskResponseSchema])
def get_tasks(
    department_code: Optional[str] = Query(None, description="Filter by ENG, SNT, TRD"),
    status: Optional[str] = Query(None, description="Filter by pending, scheduled, completed"),
    corridor_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Task)
    if department_code:
        query = query.join(Department).filter(Department.code == department_code.upper())
    if status:
        query = query.filter(Task.status == status)
    if corridor_id:
        query = query.filter(Task.corridor_id == corridor_id)

    tasks = query.all()
    # Sort by priority score descending
    tasks.sort(
        key=lambda t: (t.priority_score.total_score if t.priority_score else 0),
        reverse=True
    )

    return [format_task_response(t) for t in tasks]

@router.post("/tasks", response_model=TaskResponseSchema)
def create_task(task_in: TaskCreateSchema, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == task_in.department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    new_task = Task(
        department_id=task_in.department_id,
        corridor_id=task_in.corridor_id,
        source_system=task_in.source_system,
        source_ref=task_in.source_ref or f"{dept.code}-DEFECT-{datetime.now().strftime('%M%S')}",
        task_type=task_in.task_type,
        km_marker_start=task_in.km_marker_start,
        km_marker_end=task_in.km_marker_end,
        estimated_duration_minutes=task_in.estimated_duration_minutes,
        requires_power_off=task_in.requires_power_off,
        requires_machine_type=task_in.requires_machine_type,
        safety_class=task_in.safety_class,
        irpwm_periodicity_days=task_in.irpwm_periodicity_days,
        overdue_days=task_in.overdue_days,
        status="pending"
    )
    db.add(new_task)
    db.flush()

    # Compute priority score
    score_res = compute_priority_score(
        overdue_days=task_in.overdue_days,
        safety_class=task_in.safety_class,
        degradation_trend=task_in.degradation_trend,
        traffic_density="high" if task_in.km_marker_start < 15.0 else "medium"
    )

    p_score = TaskPriorityScore(
        task_id=new_task.id,
        overdue_component=score_res["overdue_component"],
        safety_component=score_res["safety_component"],
        degradation_component=score_res["degradation_component"],
        traffic_impact_component=score_res["traffic_impact_component"],
        total_score=score_res["total_score"],
        explanation=score_res["explanation"]
    )
    db.add(p_score)
    db.commit()
    db.refresh(new_task)

    return format_task_response(new_task)
