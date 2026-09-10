"""
Explainable Prioritization Engine for MaxTrack (SIH 2026 PS 26027).
Computes an inspectable, additive priority score (0-100) for maintenance tasks
based on statutory IRPWM overdue days, safety criticality, degradation trend,
and corridor traffic impact.
"""

from typing import Dict, Any

def compute_priority_score(
    overdue_days: int,
    safety_class: str,
    degradation_trend: float = 0.5,  # 0.0 to 1.0 (e.g. TGI or wire wear index)
    traffic_density: str = "medium"  # 'low', 'medium', 'high'
) -> Dict[str, Any]:
    """
    Computes priority score and constituent components.
    Total = Overdue (max 40) + Safety (max 30) + Degradation (max 15) + Traffic (max 15).
    """
    # 1. Overdue Component (Max 40 points)
    # 4 points per overdue day, capped at 40
    if overdue_days <= 0:
        overdue_pts = 0.0
    else:
        overdue_pts = min(40.0, float(overdue_days) * 4.0)

    # 2. Safety Class Component (Max 30 points)
    safety_lower = (safety_class or "routine").lower().strip()
    if safety_lower in ["critical", "emergency"]:
        safety_pts = 30.0
    elif safety_lower == "high":
        safety_pts = 20.0
    else:
        safety_pts = 10.0

    # 3. Degradation Component (Max 15 points)
    # degradation_trend in [0, 1] scaled to 15
    deg_norm = max(0.0, min(1.0, float(degradation_trend)))
    deg_pts = round(deg_norm * 15.0, 1)

    # 4. Traffic Impact Component (Max 15 points)
    density_lower = (traffic_density or "medium").lower().strip()
    if density_lower == "high":
        traffic_pts = 15.0
    elif density_lower == "medium":
        traffic_pts = 10.0
    else:
        traffic_pts = 5.0

    total_score = round(overdue_pts + safety_pts + deg_pts + traffic_pts, 1)

    # Human-readable justification string
    parts = []
    if overdue_days > 0:
        parts.append(f"{overdue_days} days past IRPWM interval (+{overdue_pts:.0f} pts)")
    else:
        parts.append(f"Within statutory interval (+{overdue_pts:.0f} pts)")

    parts.append(f"{safety_class.capitalize()} safety class (+{safety_pts:.0f} pts)")
    parts.append(f"Wear trend index {deg_norm:.2f} (+{deg_pts:.1f} pts)")
    parts.append(f"{density_lower.capitalize()} traffic corridor (+{traffic_pts:.0f} pts)")

    explanation = f"Score {total_score}/100: " + "; ".join(parts) + "."

    return {
        "overdue_component": overdue_pts,
        "safety_component": safety_pts,
        "degradation_component": deg_pts,
        "traffic_impact_component": traffic_pts,
        "total_score": total_score,
        "explanation": explanation
    }
