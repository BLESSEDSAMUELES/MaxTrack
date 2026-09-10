"""
Unit & Integration Tests for MaxTrack CP-SAT Optimizer and Baseline Engine.
Validates the canonical worked-example (3 tasks bundled into 1 block of 4 hours).
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.app.engine.prioritizer import compute_priority_score
from backend.app.engine.baseline import simulate_manual_baseline
from backend.app.engine.optimizer import run_block_optimization

def test_prioritizer():
    # 8 days overdue, high safety, accelerated wear
    res = compute_priority_score(overdue_days=8, safety_class="high", degradation_trend=0.8, traffic_density="high")
    assert res["overdue_component"] == 32.0
    assert res["safety_component"] == 20.0
    assert res["degradation_component"] == 12.0
    assert res["traffic_impact_component"] == 15.0
    assert res["total_score"] == 79.0
    assert "8 days past IRPWM" in res["explanation"]
    print("[PASS] test_prioritizer passed!")

def test_canonical_worked_example_bundling():
    """
    Validates SIH PS 26027 core proof:
    - 3 tasks: Tamping (180m), OHE Patching (240m), Point Machine (120m)
    - Manual baseline: 3 blocks, 540 minutes (9 hrs), 21 train paths lost
    - MaxTrack: 1 block, 240 minutes (4 hrs), 7 train paths lost
    """
    tasks = [
        {
            "id": 1,
            "department_code": "ENG",
            "department_name": "Engineering",
            "task_type": "Track Tamping",
            "estimated_duration_minutes": 180,
            "requires_power_off": False,
            "requires_machine_type": "tamping_machine",
            "safety_class": "high",
            "priority_score": 79.0,
            "overdue_days": 8
        },
        {
            "id": 2,
            "department_code": "TRD",
            "department_name": "Traction Distribution",
            "task_type": "OHE Patching",
            "estimated_duration_minutes": 240,
            "requires_power_off": True,
            "requires_machine_type": "tower_wagon",
            "safety_class": "critical",
            "priority_score": 88.0,
            "overdue_days": 2
        },
        {
            "id": 3,
            "department_code": "SNT",
            "department_name": "Signal & Telecom",
            "task_type": "Point Machine Repair",
            "estimated_duration_minutes": 120,
            "requires_power_off": True,
            "requires_machine_type": None,
            "safety_class": "critical",
            "priority_score": 82.0,
            "overdue_days": 3
        }
    ]

    # Baseline verification
    baseline = simulate_manual_baseline(tasks)
    assert baseline["baseline_blocks_count"] == 3
    assert baseline["baseline_downtime_minutes"] == 540  # 180 + 240 + 120 = 540 min = 9 hrs
    assert baseline["baseline_train_paths_lost"] == 21   # ~21 paths
    print(f"[PASS] Baseline check passed: {baseline}")

    # Available COA window: 300 minutes (5 hours)
    windows = [
        {
            "id": 101,
            "window_start": "2026-09-10T01:00:00",
            "window_end": "2026-09-10T06:00:00",
            "duration_minutes": 300,
            "traffic_density": "low"
        }
    ]

    corridor_info = {
        "id": 1,
        "name": "Station A - Station B",
        "electrified": True
    }

    # Run CP-SAT solver
    result = run_block_optimization(tasks, windows, corridor_info)
    assert result["status"] in ["OPTIMAL", "FEASIBLE"]
    assert len(result["blocks"]) == 1, f"Expected exactly 1 bundled block, got {len(result['blocks'])}"
    
    block = result["blocks"][0]
    # Block duration MUST equal 240 min (the max of 180, 240, 120)
    assert block["duration_minutes"] == 240, f"Expected block duration 240 min, got {block['duration_minutes']}"
    assert block["power_off_required"] is True
    assert set(block["departments"]) == {"ENG", "TRD", "SNT"}
    assert len(block["tasks"]) == 3
    assert block["duration_math"]["minutes_saved"] == 300  # 540 - 240 = 300 mins saved
    assert len(result["unassigned_tasks"]) == 0
    print(f"[PASS] Solver bundling check passed! Block: {block['duration_math']['explanation']}")

if __name__ == "__main__":
    test_prioritizer()
    test_canonical_worked_example_bundling()
    print("ALL TESTS PASSED SUCCESSFULLY!")
