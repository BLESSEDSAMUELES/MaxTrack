"""
MaxTrack LightGBM Model Training & Testing Verification Script
Validates the full AI/ML pipeline end-to-end:
1. Dataset ingestion across TMS, SMMS, TDMS (22,000+ records)
2. LightGBM model training (ACI regressor + 3 duration quantile regressors)
3. Test metrics verification (R², MAE, RMSE thresholds)
4. Inference correctness on representative sample tasks
5. Duration quantile monotonicity (Q10 <= Q50 <= Q90)
6. Shadow bundling algorithm validation
"""

import sys
import os
import json
import traceback
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
MODELS_DIR = BASE_DIR / "models"

# Ensure project root is on sys.path
sys.path.insert(0, str(PROJECT_ROOT))

class TestResult:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.results = []

    def check(self, name, condition, detail=""):
        status = "PASS" if condition else "FAIL"
        self.results.append((name, status, detail))
        if condition:
            self.passed += 1
        else:
            self.failed += 1
        icon = "[PASS]" if condition else "[FAIL]"
        print(f"  {icon} {name}: {status}  {detail}")

    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*70}")
        print(f"  RESULTS: {self.passed}/{total} passed, {self.failed} failed")
        print(f"{'='*70}")
        return self.failed == 0


def test_training_pipeline(results: TestResult):
    """Test 1: Verify the training pipeline runs and produces valid metrics."""
    print("\n" + "="*70)
    print("  TEST 1: LightGBM Training Pipeline")
    print("="*70)

    from core.train_engine import load_and_harmonize_datasets, train_and_evaluate

    # 1a. Dataset loading
    print("\n  [1a] Loading and harmonizing datasets...")
    X, y_aci, y_dur, dept_stats = load_and_harmonize_datasets()

    results.check(
        "Dataset loaded",
        len(X) > 0,
        f"{len(X)} total records"
    )
    results.check(
        "Multi-department coverage",
        dept_stats["tms_records"] > 0 and dept_stats["smms_records"] > 0 and dept_stats["tdms_records"] > 0,
        f"TMS={dept_stats['tms_records']}, SMMS={dept_stats['smms_records']}, TDMS={dept_stats['tdms_records']}"
    )
    results.check(
        "Dataset size >= 20,000 records",
        dept_stats["total_records"] >= 20000,
        f"Total: {dept_stats['total_records']}"
    )
    results.check(
        "Feature count matches specification",
        X.shape[1] == 9,
        f"Features: {X.shape[1]} (expected 9)"
    )
    results.check(
        "ACI target range valid [15, 100]",
        float(y_aci.min()) >= 14.0 and float(y_aci.max()) <= 101.0,
        f"Range: [{y_aci.min():.1f}, {y_aci.max():.1f}]"
    )

    # 1b. Full training
    print("\n  [1b] Running full training pipeline...")
    metrics = train_and_evaluate()

    results.check(
        "Training completed",
        metrics.get("status") == "TRAINED",
        f"Status: {metrics.get('status')}"
    )

    # 1c. Model files saved
    print("\n  [1c] Verifying model artifacts...")
    model_files = ["lightgbm_aci.joblib", "lightgbm_q10.joblib", "lightgbm_q50.joblib", "lightgbm_q90.joblib"]
    for mf in model_files:
        path = MODELS_DIR / mf
        results.check(
            f"Model file exists: {mf}",
            path.exists(),
            f"Size: {path.stat().st_size:,} bytes" if path.exists() else "MISSING"
        )

    metrics_file = MODELS_DIR / "model_metrics.json"
    results.check(
        "Metrics JSON saved",
        metrics_file.exists(),
        f"Size: {metrics_file.stat().st_size:,} bytes" if metrics_file.exists() else "MISSING"
    )

    return metrics


def test_model_quality(results: TestResult, metrics: dict):
    """Test 2: Verify model quality meets minimum thresholds."""
    print("\n" + "="*70)
    print("  TEST 2: Model Quality Thresholds")
    print("="*70)

    aci_metrics = metrics.get("aci_metrics", {})
    dur_metrics = metrics.get("duration_quantile_metrics", {})

    # ACI Model Quality
    aci_r2 = aci_metrics.get("r2_score", 0)
    aci_mae = aci_metrics.get("mae", 999)
    aci_rmse = aci_metrics.get("rmse", 999)

    results.check(
        "ACI R² > 0.95",
        aci_r2 > 0.95,
        f"R² = {aci_r2:.4f}"
    )
    results.check(
        "ACI MAE < 3.0",
        aci_mae < 3.0,
        f"MAE = {aci_mae:.2f}"
    )
    results.check(
        "ACI RMSE < 5.0",
        aci_rmse < 5.0,
        f"RMSE = {aci_rmse:.2f}"
    )

    # Duration Quantile Model Quality
    q50_r2 = dur_metrics.get("q50_r2_score", 0)
    q50_mae = dur_metrics.get("q50_mae_mins", 999)

    results.check(
        "Duration Q50 R² > 0.70",
        q50_r2 > 0.70,
        f"R² = {q50_r2:.4f}"
    )
    results.check(
        "Duration Q50 MAE < 40 minutes",
        q50_mae < 40,
        f"MAE = {q50_mae:.1f} mins"
    )

    # Feature importances
    fi = metrics.get("feature_importances", [])
    results.check(
        "Feature importances extracted",
        len(fi) == 9,
        f"Count: {len(fi)}"
    )
    if fi:
        top_feature = fi[0]["feature"]
        results.check(
            "Top feature is safety_score",
            top_feature == "safety_score",
            f"Top feature: {top_feature} ({fi[0]['percentage']}%)"
        )


def test_inference(results: TestResult):
    """Test 3: Verify model inference on representative tasks from each department."""
    print("\n" + "="*70)
    print("  TEST 3: LightGBM Inference Correctness")
    print("="*70)

    from core.ml_engine import Brain1MLEngine
    engine = Brain1MLEngine()

    # Representative tasks from each department
    test_tasks = [
        {
            "name": "ENG Critical Track Tamping",
            "department": "ENG",
            "task_type": "Track Tamping",
            "safety_class": "critical",
            "days_overdue": 8,
            "codal_interval_days": 90,
            "caution_order_speed": 30,
            "rail_temp_c": 42.0,
            "corridor_code": "NDLS-CNB",
            "duration_minutes": 180,
            "expected_aci_min": 60.0
        },
        {
            "name": "SNT Point Machine Overhaul",
            "department": "SNT",
            "task_type": "Point Machine Overhaul",
            "safety_class": "critical",
            "days_overdue": 4,
            "codal_interval_days": 60,
            "caution_order_speed": 130,
            "sensor_vibration_mms": 9.4,
            "insulation_mohm": 42.0,
            "corridor_code": "NDLS-CNB",
            "duration_minutes": 90,
            "requires_power_off": True,
            "expected_aci_min": 40.0
        },
        {
            "name": "TRD OHE Contact Wire Regulation",
            "department": "TRD",
            "task_type": "OHE Contact Wire Regulation",
            "safety_class": "critical",
            "days_overdue": 6,
            "codal_interval_days": 45,
            "caution_order_speed": 130,
            "corridor_code": "NDLS-CNB",
            "duration_minutes": 120,
            "requires_power_off": True,
            "expected_aci_min": 50.0
        },
        {
            "name": "ENG Low Priority Routine",
            "department": "ENG",
            "task_type": "Routine Inspection",
            "safety_class": "normal",
            "days_overdue": 0,
            "codal_interval_days": 180,
            "caution_order_speed": 130,
            "rail_temp_c": 35.0,
            "corridor_code": "NDLS-CNB",
            "duration_minutes": 60,
            "expected_aci_min": 15.0,
            "expected_aci_max": 55.0
        }
    ]

    for task_data in test_tasks:
        task_name = task_data.pop("name")
        expected_min = task_data.pop("expected_aci_min", 15.0)
        expected_max = task_data.pop("expected_aci_max", 100.0)

        result = engine.compute_task_aci(task_data)
        aci = result["aci_score"]
        q = result["duration_quantiles"]

        print(f"\n  Task: {task_name}")

        results.check(
            f"  ACI in valid range [{expected_min}, {expected_max}]",
            expected_min <= aci <= expected_max,
            f"ACI = {aci}"
        )
        results.check(
            f"  Duration Q10 <= Q50",
            q["q10_curtailed"] <= q["q50_sanctioned"],
            f"Q10={q['q10_curtailed']}m, Q50={q['q50_sanctioned']}m"
        )
        results.check(
            f"  Duration Q50 <= Q90",
            q["q50_sanctioned"] <= q["q90_megablock"],
            f"Q50={q['q50_sanctioned']}m, Q90={q['q90_megablock']}m"
        )
        results.check(
            f"  Explanation string generated",
            len(result["explanation"]) > 20,
            f"Length: {len(result['explanation'])} chars"
        )

    # Test predict_custom endpoint
    print("\n  Testing predict_custom (Evaluator Sandbox)...")
    custom_result = engine.predict_custom({
        "department": "ENG",
        "safety_score": 30.0,
        "speed_penalty": 15.0,
        "overdue_ratio": 12.0,
        "traffic_density": 9.0,
        "env_thermal_stress": 7.0,
        "concurrency_potential": 8.0,
        "power_cut_required": 0,
        "machine_required": 1
    })

    results.check(
        "Custom predict returns ACI",
        15.0 <= custom_result["predicted_aci"] <= 100.0,
        f"ACI = {custom_result['predicted_aci']}"
    )
    results.check(
        "Custom predict returns quantiles",
        "duration_quantiles" in custom_result,
        f"Q50 = {custom_result['duration_quantiles']['q50_sanctioned_mins']}m"
    )
    results.check(
        "Model type is LightGBM",
        "LightGBM" in custom_result.get("model_type", ""),
        f"Type: {custom_result.get('model_type')}"
    )


def test_bundling_algorithm(results: TestResult):
    """Test 4: Verify shadow bundling produces fewer blocks than individual scheduling."""
    print("\n" + "="*70)
    print("  TEST 4: Shadow Bundling Algorithm")
    print("="*70)

    from core.ml_engine import Brain1MLEngine
    engine = Brain1MLEngine()

    # Simulate the worked example: 3 departments, same corridor section
    test_tasks = [
        {
            "id": "TEST-ENG-01",
            "department": "ENG",
            "corridor_code": "NDLS-CNB",
            "line": "UP_MAIN",
            "task_type": "Track Tamping",
            "km_start": 285.2,
            "km_end": 287.4,
            "elementary_section": "ES-24B",
            "requires_power_off": False,
            "duration_minutes": 180,
            "safety_class": "critical",
            "days_overdue": 8,
            "codal_interval_days": 90,
            "caution_order_speed": 30,
            "rail_temp_c": 42.0
        },
        {
            "id": "TEST-SNT-01",
            "department": "SNT",
            "corridor_code": "NDLS-CNB",
            "line": "UP_MAIN",
            "task_type": "Point Machine Overhaul",
            "km_start": 286.0,
            "km_end": 286.3,
            "elementary_section": "ES-24B",
            "requires_power_off": True,
            "duration_minutes": 90,
            "safety_class": "critical",
            "days_overdue": 4,
            "codal_interval_days": 60,
            "sensor_vibration_mms": 9.4,
            "insulation_mohm": 42.0
        },
        {
            "id": "TEST-TRD-01",
            "department": "TRD",
            "corridor_code": "NDLS-CNB",
            "line": "UP_MAIN",
            "task_type": "OHE Contact Wire Regulation",
            "km_start": 285.0,
            "km_end": 287.5,
            "elementary_section": "ES-24B",
            "requires_power_off": True,
            "duration_minutes": 120,
            "safety_class": "critical",
            "days_overdue": 6,
            "codal_interval_days": 45,
            "caution_order_speed": 130
        }
    ]

    bundles = engine.bundle_shadow_requisitions(test_tasks)

    total_input_tasks = len(test_tasks)
    total_bundles = len(bundles)
    bundled_any = any(b["is_bundled"] for b in bundles)

    results.check(
        "Bundling reduces block count",
        total_bundles < total_input_tasks,
        f"Input tasks: {total_input_tasks}, Output bundles: {total_bundles}"
    )
    results.check(
        "At least one bundle has multiple departments",
        bundled_any,
        "Cross-department piggybacking detected" if bundled_any else "No bundling occurred"
    )

    if bundles:
        first = bundles[0]
        results.check(
            "Bundle duration < sum of individual durations",
            first["duration_minutes"] < first.get("sum_individual_minutes", first["duration_minutes"] + 1),
            f"Bundle: {first['duration_minutes']}m vs Sum: {first.get('sum_individual_minutes', 'N/A')}m"
        )
        results.check(
            "Downtime saved is positive",
            first.get("downtime_saved_minutes", 0) > 0,
            f"Saved: {first.get('downtime_saved_minutes', 0)} minutes"
        )
        results.check(
            "Justification text generated",
            len(first.get("justification", "")) > 20,
            f"Justification length: {len(first.get('justification', ''))} chars"
        )
        results.check(
            "Power-off correctly flagged for bundled TRD task",
            first.get("power_off_required", False),
            "25kV power-off required" if first.get("power_off_required") else "Power-off NOT flagged"
        )


def main():
    print("\n" + "="*70)
    print("  MaxTrack LightGBM AI Pipeline — Verification Suite")
    print("  Ministry of Railways · SIH 2026 · PS 26027")
    print("="*70)

    results = TestResult()

    try:
        metrics = test_training_pipeline(results)
        test_model_quality(results, metrics)
        test_inference(results)
        test_bundling_algorithm(results)
    except Exception as e:
        print(f"\n  [FATAL ERROR] {e}")
        traceback.print_exc()
        results.check("Pipeline execution", False, str(e))

    all_passed = results.summary()

    if all_passed:
        print("\n  >>> ALL TESTS PASSED -- LightGBM pipeline verified!")
    else:
        print(f"\n  >>> WARNING: {results.failed} test(s) failed -- review above for details.")

    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
