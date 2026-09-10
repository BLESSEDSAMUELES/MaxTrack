from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey, Text, create_engine
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from backend.app.config import DATABASE_URL

Base = declarative_base()

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(10), unique=True, nullable=False)  # ENG, SNT, TRD
    name = Column(String(100), nullable=False)
    color = Column(String(20), default="#0ea5e9")  # UI color hex

    tasks = relationship("Task", back_populates="department")


class Corridor(Base):
    __tablename__ = "corridors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False)  # e.g., "Station A – Station B"
    division = Column(String(100), default="Delhi Division")
    start_km = Column(Float, nullable=False)
    end_km = Column(Float, nullable=False)
    line_count = Column(Integer, default=2)
    electrified = Column(Boolean, default=True)

    tasks = relationship("Task", back_populates="corridor")
    windows = relationship("CorridorAvailabilityWindow", back_populates="corridor")
    blocks = relationship("Block", back_populates="corridor")


class Machine(Base):
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, autoincrement=True)
    machine_type = Column(String(50), nullable=False)  # 'tamping_machine', 'tower_wagon'
    identifier = Column(String(50), nullable=False)    # asset tag e.g. 'CSM-964'
    home_division = Column(String(100), default="Delhi Division")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    corridor_id = Column(Integer, ForeignKey("corridors.id"), nullable=False)
    source_system = Column(String(20), default="TMS")  # TMS / SMMS / TDMS
    source_ref = Column(String(100), nullable=True)
    task_type = Column(String(100), nullable=False)    # e.g., 'tamping', 'point_machine_repair', 'OHE_patching'
    km_marker_start = Column(Float, nullable=False)
    km_marker_end = Column(Float, nullable=False)
    estimated_duration_minutes = Column(Integer, nullable=False)
    requires_power_off = Column(Boolean, default=False)
    requires_machine_type = Column(String(50), nullable=True)
    safety_class = Column(String(20), default="high")  # 'critical', 'high', 'routine'
    last_maintained_date = Column(Date, nullable=True)
    irpwm_periodicity_days = Column(Integer, default=90)
    overdue_days = Column(Integer, default=0)
    status = Column(String(20), default="pending")     # 'pending', 'scheduled', 'completed', 'deferred'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    department = relationship("Department", back_populates="tasks")
    corridor = relationship("Corridor", back_populates="tasks")
    priority_score = relationship("TaskPriorityScore", back_populates="task", uselist=False, cascade="all, delete-orphan")
    block_tasks = relationship("BlockTask", back_populates="task")


class TaskPriorityScore(Base):
    __tablename__ = "task_priority_scores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), unique=True, nullable=False)
    overdue_component = Column(Float, default=0.0)
    safety_component = Column(Float, default=0.0)
    degradation_component = Column(Float, default=0.0)
    traffic_impact_component = Column(Float, default=0.0)
    total_score = Column(Float, default=0.0)
    explanation = Column(Text, nullable=True)
    computed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    task = relationship("Task", back_populates="priority_score")


class CorridorAvailabilityWindow(Base):
    __tablename__ = "corridor_availability_windows"

    id = Column(Integer, primary_key=True, autoincrement=True)
    corridor_id = Column(Integer, ForeignKey("corridors.id"), nullable=False)
    window_start = Column(DateTime, nullable=False)
    window_end = Column(DateTime, nullable=False)
    traffic_density = Column(String(20), default="low")  # 'low', 'medium', 'high'
    source = Column(String(20), default="COA")

    corridor = relationship("Corridor", back_populates="windows")


class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, autoincrement=True)
    horizon_type = Column(String(10), default="weekly")  # 'weekly', 'monthly'
    horizon_start = Column(DateTime, nullable=False)
    horizon_end = Column(DateTime, nullable=False)
    status = Column(String(20), default="proposed")       # 'proposed', 'approved', 'superseded'
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    solver_runtime_ms = Column(Integer, default=0)

    blocks = relationship("Block", back_populates="plan", cascade="all, delete-orphan")
    baseline_comparison = relationship("PlanBaselineComparison", back_populates="plan", uselist=False, cascade="all, delete-orphan")
    audits = relationship("ApprovalsAudit", back_populates="plan")


class Block(Base):
    __tablename__ = "blocks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False)
    corridor_id = Column(Integer, ForeignKey("corridors.id"), nullable=False)
    scheduled_start = Column(DateTime, nullable=False)
    scheduled_end = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    power_off_required = Column(Boolean, default=False)
    status = Column(String(20), default="proposed")       # 'proposed', 'approved', 'overridden', 'rejected'

    plan = relationship("Plan", back_populates="blocks")
    corridor = relationship("Corridor", back_populates="blocks")
    block_tasks = relationship("BlockTask", back_populates="block", cascade="all, delete-orphan")
    justifications = relationship("BlockJustification", back_populates="block", cascade="all, delete-orphan")


class BlockTask(Base):
    __tablename__ = "block_tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    block_id = Column(Integer, ForeignKey("blocks.id"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)

    block = relationship("Block", back_populates="block_tasks")
    task = relationship("Task", back_populates="block_tasks")


class BlockJustification(Base):
    __tablename__ = "block_justifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    block_id = Column(Integer, ForeignKey("blocks.id"), nullable=False)
    constraint_type = Column(String(50), nullable=False)
    explanation_text = Column(Text, nullable=False)

    block = relationship("Block", back_populates="justifications")


class PlanBaselineComparison(Base):
    __tablename__ = "plan_baseline_comparisons"

    id = Column(Integer, primary_key=True, autoincrement=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), unique=True, nullable=False)
    baseline_blocks_count = Column(Integer, nullable=False)
    proposed_blocks_count = Column(Integer, nullable=False)
    baseline_downtime_minutes = Column(Integer, nullable=False)
    proposed_downtime_minutes = Column(Integer, nullable=False)
    baseline_train_paths_lost = Column(Integer, nullable=False)
    proposed_train_paths_lost = Column(Integer, nullable=False)

    plan = relationship("Plan", back_populates="baseline_comparison")


class ApprovalsAudit(Base):
    __tablename__ = "approvals_audit"

    id = Column(Integer, primary_key=True, autoincrement=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False)
    block_id = Column(Integer, ForeignKey("blocks.id"), nullable=True)
    officer_name = Column(String(150), default="Rakesh Sharma (Nodal Planning Officer)")
    role = Column(String(50), default="planning_officer")
    action = Column(String(20), nullable=False)           # 'approved', 'overridden', 'flagged'
    notes = Column(Text, nullable=True)
    action_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    plan = relationship("Plan", back_populates="audits")


# Engine and session initialization
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
