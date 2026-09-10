"""
Deterministic Manual Baseline Simulator for MaxTrack.
Simulates the uncoordinated legacy approach where Engineering, S&T, and TRD
each request isolated track blocks independently through BDMS without cross-department bundling.
"""

from typing import List, Dict, Any
import math
from backend.app.config import MIN_VIABLE_BLOCK_DURATION_MINUTES

def simulate_manual_baseline(tasks: List[Dict[str, Any]]) -> Dict[str, int]:
    """
    Given a list of maintenance tasks, computes:
    - baseline_blocks_count: Each task is scheduled in its own isolated block.
    - baseline_downtime_minutes: Sum of individual block durations.
    - baseline_train_paths_lost: Train paths displaced due to sequential corridor closures.
    """
    if not tasks:
        return {
            "baseline_blocks_count": 0,
            "baseline_downtime_minutes": 0,
            "baseline_train_paths_lost": 0
        }

    total_blocks = len(tasks)
    total_downtime_minutes = 0
    total_paths_lost = 0

    # In Indian Railways double-track corridor (e.g. Station A-B),
    # typical headway is 25-30 minutes per train path during operational traffic.
    # Therefore, 1 hour of corridor block displaces approximately 2.3 train paths.
    TRAIN_PATHS_PER_HOUR = 2.333

    for task in tasks:
        dur = task.get("estimated_duration_minutes", 120)
        # Each manual block has a minimum floor of setup/clearance
        block_dur = max(dur, MIN_VIABLE_BLOCK_DURATION_MINUTES)
        total_downtime_minutes += block_dur

    # In Indian Railways double-track corridor (e.g. Station A-B),
    # 9 hours of downtime corresponds to ~21 train paths lost (2.333 paths/hr)
    total_hours = total_downtime_minutes / 60.0
    total_paths_lost = round(total_hours * TRAIN_PATHS_PER_HOUR)

    return {
        "baseline_blocks_count": total_blocks,
        "baseline_downtime_minutes": total_downtime_minutes,
        "baseline_train_paths_lost": total_paths_lost
    }
