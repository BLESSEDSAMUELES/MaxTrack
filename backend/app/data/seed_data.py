"""
Database Seeding Script for MaxTrack.
Populates standard IRPWM/RDSO reference data, the Station A - Station B corridor,
and the canonical worked-example tasks along with 7-day COA availability windows.
"""

from datetime import datetime, timedelta, date, timezone
from sqlalchemy.orm import Session
from backend.app.models.entities import (
    Department, Corridor, Machine, Task, TaskPriorityScore,
    CorridorAvailabilityWindow, init_db, SessionLocal
)
from backend.app.engine.prioritizer import compute_priority_score

def seed_database(db: Session = None):
    close_db = False
    if db is None:
        init_db()
        db = SessionLocal()
        close_db = True

    try:
        # Check if already seeded
        if db.query(Department).count() > 0:
            print("Database already seeded. Skipping initial seed.")
            return

        print("Seeding MaxTrack database with IRPWM/RDSO norms & Station A-B worked example...")

        # 1. Departments
        eng = Department(code="ENG", name="Engineering (Civil/P-Way)", color="#0284c7")
        snt = Department(code="SNT", name="Signal & Telecommunication", color="#059669")
        trd = Department(code="TRD", name="Traction Distribution (OHE)", color="#d97706")
        db.add_all([eng, snt, trd])
        db.flush()

        # 2. Corridor (Station A - Station B)
        corridor = Corridor(
            name="Station A – Station B (Main Line)",
            division="Delhi Division (Northern Railway)",
            start_km=10.0,
            end_km=20.0,
            line_count=2,
            electrified=True
        )
        db.add(corridor)
        db.flush()

        # 3. Machines
        m_tamper = Machine(
            machine_type="tamping_machine",
            identifier="CSM-964 (Duomatic Plasser Tamper)",
            home_division="Delhi Division"
        )
        m_tower = Machine(
            machine_type="tower_wagon",
            identifier="TW-402 (8-Wheeler OHE Inspection Car)",
            home_division="Delhi Division"
        )
        db.add_all([m_tamper, m_tower])
        db.flush()

        # 4. 7-Day COA Availability Windows (starting tomorrow)
        now = datetime.now(timezone.utc)
        base_date = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        
        windows = [
            # Day 1: Night Window 01:00 - 06:00 (5 hours, 300 mins) - Ideal for bundling!
            CorridorAvailabilityWindow(
                corridor_id=corridor.id,
                window_start=base_date.replace(hour=1, minute=0),
                window_end=base_date.replace(hour=6, minute=0),
                traffic_density="low",
                source="COA / WTT"
            ),
            # Day 2: Night Window 01:30 - 05:30 (4 hours, 240 mins)
            CorridorAvailabilityWindow(
                corridor_id=corridor.id,
                window_start=(base_date + timedelta(days=1)).replace(hour=1, minute=30),
                window_end=(base_date + timedelta(days=1)).replace(hour=5, minute=30),
                traffic_density="low",
                source="COA / WTT"
            ),
            # Day 3: Midday Window 12:00 - 15:00 (3 hours, 180 mins)
            CorridorAvailabilityWindow(
                corridor_id=corridor.id,
                window_start=(base_date + timedelta(days=2)).replace(hour=12, minute=0),
                window_end=(base_date + timedelta(days=2)).replace(hour=15, minute=0),
                traffic_density="medium",
                source="COA / WTT"
            ),
            # Day 4: Night Window 01:00 - 05:30 (4.5 hours, 270 mins)
            CorridorAvailabilityWindow(
                corridor_id=corridor.id,
                window_start=(base_date + timedelta(days=3)).replace(hour=1, minute=0),
                window_end=(base_date + timedelta(days=3)).replace(hour=5, minute=30),
                traffic_density="low",
                source="COA / WTT"
            ),
            # Day 5: Night Window 02:00 - 06:00 (4 hours, 240 mins)
            CorridorAvailabilityWindow(
                corridor_id=corridor.id,
                window_start=(base_date + timedelta(days=4)).replace(hour=2, minute=0),
                window_end=(base_date + timedelta(days=4)).replace(hour=6, minute=0),
                traffic_density="low",
                source="COA / WTT"
            ),
            # Day 6: Afternoon Window 13:00 - 16:30 (3.5 hours, 210 mins)
            CorridorAvailabilityWindow(
                corridor_id=corridor.id,
                window_start=(base_date + timedelta(days=5)).replace(hour=13, minute=0),
                window_end=(base_date + timedelta(days=5)).replace(hour=16, minute=30),
                traffic_density="medium",
                source="COA / WTT"
            ),
            # Day 7: Night Window 00:30 - 05:30 (5 hours, 300 mins)
            CorridorAvailabilityWindow(
                corridor_id=corridor.id,
                window_start=(base_date + timedelta(days=6)).replace(hour=0, minute=30),
                window_end=(base_date + timedelta(days=6)).replace(hour=5, minute=30),
                traffic_density="low",
                source="COA / WTT"
            ),
        ]
        db.add_all(windows)
        db.flush()

        # 5. Maintenance Tasks
        # Canonical Worked-Example Tasks (Tamping, OHE Patching, Point Machine Repair)
        tasks_data = [
            {
                "department_id": eng.id,
                "task_type": "Track Tamping & Cross-Level Alignment",
                "source_system": "TMS",
                "source_ref": "TMS-DL-2026-881",
                "km_marker_start": 12.0,
                "km_marker_end": 15.0,
                "estimated_duration_minutes": 180,  # 3 hours
                "requires_power_off": False,
                "requires_machine_type": "tamping_machine",
                "safety_class": "high",
                "last_maintained_date": date.today() - timedelta(days=98),
                "irpwm_periodicity_days": 90,
                "overdue_days": 8,
                "degradation_trend": 0.85
            },
            {
                "department_id": trd.id,
                "task_type": "OHE Cantilever & Contact Wire Patching",
                "source_system": "TDMS",
                "source_ref": "TDMS-OHE-4029",
                "km_marker_start": 13.0,
                "km_marker_end": 14.2,
                "estimated_duration_minutes": 240,  # 4 hours
                "requires_power_off": True,         # Anchor constraint
                "requires_machine_type": "tower_wagon",
                "safety_class": "critical",
                "last_maintained_date": date.today() - timedelta(days=32),
                "irpwm_periodicity_days": 30,
                "overdue_days": 2,
                "degradation_trend": 0.92
            },
            {
                "department_id": snt.id,
                "task_type": "Point Machine Overhaul & Track Circuit Tuning",
                "source_system": "SMMS",
                "source_ref": "SMMS-SIG-1044",
                "km_marker_start": 12.5,
                "km_marker_end": 12.8,
                "estimated_duration_minutes": 120,  # 2 hours
                "requires_power_off": True,         # Adjacent to 25kV bonded equipment
                "requires_machine_type": None,
                "safety_class": "critical",
                "last_maintained_date": date.today() - timedelta(days=63),
                "irpwm_periodicity_days": 60,
                "overdue_days": 3,
                "degradation_trend": 0.78
            },
            # Additional tasks for multi-day schedule
            {
                "department_id": eng.id,
                "task_type": "Rail Joint Ultrasonic Flaw Detection (USFD)",
                "source_system": "TMS",
                "source_ref": "TMS-USFD-512",
                "km_marker_start": 16.0,
                "km_marker_end": 18.5,
                "estimated_duration_minutes": 150,
                "requires_power_off": False,
                "requires_machine_type": None,
                "safety_class": "routine",
                "last_maintained_date": date.today() - timedelta(days=40),
                "irpwm_periodicity_days": 45,
                "overdue_days": 0,
                "degradation_trend": 0.35
            },
            {
                "department_id": snt.id,
                "task_type": "Axle Counter Sensor Calibration",
                "source_system": "SMMS",
                "source_ref": "SMMS-AXL-789",
                "km_marker_start": 17.5,
                "km_marker_end": 18.0,
                "estimated_duration_minutes": 90,
                "requires_power_off": False,
                "requires_machine_type": None,
                "safety_class": "high",
                "last_maintained_date": date.today() - timedelta(days=34),
                "irpwm_periodicity_days": 30,
                "overdue_days": 4,
                "degradation_trend": 0.65
            },
            {
                "department_id": trd.id,
                "task_type": "OHE Insulator High-Pressure Washing & Dropper Check",
                "source_system": "TDMS",
                "source_ref": "TDMS-INS-302",
                "km_marker_start": 17.0,
                "km_marker_end": 19.0,
                "estimated_duration_minutes": 180,
                "requires_power_off": True,
                "requires_machine_type": "tower_wagon",
                "safety_class": "high",
                "last_maintained_date": date.today() - timedelta(days=31),
                "irpwm_periodicity_days": 30,
                "overdue_days": 1,
                "degradation_trend": 0.60
            }
        ]

        for item in tasks_data:
            deg = item.pop("degradation_trend", 0.5)
            task = Task(
                corridor_id=corridor.id,
                status="pending",
                **item
            )
            db.add(task)
            db.flush()

            # Compute and persist priority score
            score_res = compute_priority_score(
                overdue_days=task.overdue_days,
                safety_class=task.safety_class,
                degradation_trend=deg,
                traffic_density="high" if task.km_marker_start < 15.0 else "medium"
            )

            p_score = TaskPriorityScore(
                task_id=task.id,
                overdue_component=score_res["overdue_component"],
                safety_component=score_res["safety_component"],
                degradation_component=score_res["degradation_component"],
                traffic_impact_component=score_res["traffic_impact_component"],
                total_score=score_res["total_score"],
                explanation=score_res["explanation"]
            )
            db.add(p_score)

        db.commit()
        print(f"Successfully seeded {len(tasks_data)} tasks, 7 windows, and 1 corridor.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        if close_db:
            db.close()

if __name__ == "__main__":
    seed_database()
