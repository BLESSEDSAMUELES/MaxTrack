from typing import List, Optional, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, Field

class DepartmentSchema(BaseModel):
    id: int
    code: str
    name: str
    color: str

    class Config:
        from_attributes = True

class CorridorSchema(BaseModel):
    id: int
    name: str
    division: str
    start_km: float
    end_km: float
    line_count: int
    electrified: bool

    class Config:
        from_attributes = True

class PriorityScoreBreakdown(BaseModel):
    overdue_component: float
    safety_component: float
    degradation_component: float
    traffic_impact_component: float
    total_score: float
    explanation: Optional[str] = None

    class Config:
        from_attributes = True

class TaskResponseSchema(BaseModel):
    id: int
    department_id: int
    department_code: Optional[str] = None
    department_name: Optional[str] = None
    corridor_id: int
    source_system: str
    source_ref: Optional[str] = None
    task_type: str
    km_marker_start: float
    km_marker_end: float
    estimated_duration_minutes: int
    requires_power_off: bool
    requires_machine_type: Optional[str] = None
    safety_class: str
    last_maintained_date: Optional[date] = None
    irpwm_periodicity_days: int
    overdue_days: int
    status: str
    priority_score: Optional[PriorityScoreBreakdown] = None

    class Config:
        from_attributes = True

class TaskCreateSchema(BaseModel):
    department_id: int
    corridor_id: int
    task_type: str
    km_marker_start: float
    km_marker_end: float
    estimated_duration_minutes: int = 120
    requires_power_off: bool = False
    requires_machine_type: Optional[str] = None
    safety_class: str = "high"
    irpwm_periodicity_days: int = 90
    overdue_days: int = 0
    degradation_trend: float = 0.5
    source_system: str = "TMS"
    source_ref: Optional[str] = None

class BlockJustificationSchema(BaseModel):
    constraint_type: str
    explanation_text: str

    class Config:
        from_attributes = True

class BlockSchema(BaseModel):
    id: int
    corridor_id: int
    scheduled_start: datetime
    scheduled_end: datetime
    duration_minutes: int
    power_off_required: bool
    status: str
    is_bundled: bool = False
    departments: List[str] = []
    tasks: List[TaskResponseSchema] = []
    justifications: List[BlockJustificationSchema] = []
    duration_math: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class BaselineComparisonSchema(BaseModel):
    baseline_blocks_count: int
    proposed_blocks_count: int
    baseline_downtime_minutes: int
    proposed_downtime_minutes: int
    baseline_train_paths_lost: int
    proposed_train_paths_lost: int
    downtime_saved_minutes: int
    train_paths_recovered: int
    blocks_reduced_count: int
    capacity_recovery_percentage: float

class PlanResponseSchema(BaseModel):
    id: int
    horizon_type: str
    horizon_start: datetime
    horizon_end: datetime
    status: str
    generated_at: datetime
    solver_runtime_ms: int
    blocks: List[BlockSchema] = []
    baseline_comparison: Optional[BaselineComparisonSchema] = None

    class Config:
        from_attributes = True

class BlockActionRequest(BaseModel):
    action: str = Field(..., description="'approved', 'overridden', 'flagged', 'rejected'")
    officer_name: str = "Rakesh Sharma (Nodal Planning Officer)"
    role: str = "planning_officer"
    notes: Optional[str] = None

class DashboardStatsSchema(BaseModel):
    total_pending_tasks: int
    overdue_tasks_count: int
    critical_safety_count: int
    active_plan_id: Optional[int] = None
    corridor_name: str
    division: str
    proof_panel: BaselineComparisonSchema
    recent_blocks: List[BlockSchema] = []
