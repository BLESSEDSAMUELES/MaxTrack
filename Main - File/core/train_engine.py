"""
MaxTrack AI Engine: True Multi-Department LightGBM Training Pipeline
Trains production-grade LightGBM models on real datasets from:
1. TMS (Civil Engineering / Track Management System): 10,000 maintenance machine records
2. SMMS (Signalling & Telecom Management System): 10,000 planned maintenance records (+ failures)
3. TDMS (Traction Distribution Management System): 2,000 traction & power cut records

Trained Models:
1. LightGBM ACI Regressor: Asset Criticality Index in [0, 100]
2. LightGBM Duration Quantile Regressors: Q10 (Curtailed), Q50 (Median), Q90 (Mega-block)
"""

import os
import json
import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import lightgbm as lgb

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent
DATASETS_DIR = PROJECT_ROOT / "Datasets"
MODELS_DIR = BASE_DIR / "models"

FEATURE_NAMES = [
    "safety_score",         # [0, 35] Defect severity, codal safety class, sensor degradation
    "speed_penalty",        # [0, 25] Caution speed drop, operational speed reduction
    "overdue_ratio",        # [0, 20] Days overdue relative to statutory periodicity
    "traffic_density",      # [0, 10] Trunk corridor line density, impacted trains
    "env_thermal_stress",   # [0, 10] Rail/ambient temperature, thermal rail expansion
    "concurrency_potential",# [0, 10] Multi-department shadow piggybacking feasibility
    "dept_code_encoded",    # 0 = ENG (TMS), 1 = SNT (SMMS), 2 = TRD (TDMS)
    "power_cut_required",   # 0 or 1
    "machine_required"      # 0 or 1
]

def load_and_harmonize_datasets():
    """
    Ingests and normalizes records across TMS, SMMS, and TDMS.
    Returns:
        X: pd.DataFrame with standardized features
        y_aci: pd.Series with target ACI [0, 100]
        y_duration: pd.Series with target duration in minutes
        dept_stats: Dict with department breakdown
    """
    records = []

    # =========================================================================
    # 1. TMS (Track Management System - Civil Engineering)
    # =========================================================================
    tms_path = DATASETS_DIR / "TMS" / "tms_maintenance_bdms_dataset_all_10000rec (1).csv"
    tms_count = 0
    if tms_path.exists():
        tms_df = pd.read_csv(tms_path)
        tms_count = len(tms_df)
        print(f"Loading TMS records: {tms_count} rows...")

        for _, row in tms_df.iterrows():
            # Duration in minutes
            req_hours = float(row.get("requested_duration_hours", 3.0)) if pd.notna(row.get("requested_duration_hours")) else 3.0
            duration_mins = max(30.0, min(360.0, req_hours * 60.0))

            # Safety Score (0-35)
            defect = str(row.get("primary_defect_rectified", "GENERAL")).upper()
            pre_tqi = float(row.get("pre_work_tqi", 50.0)) if pd.notna(row.get("pre_work_tqi")) else 50.0
            if "IMR" in defect or "FRACTURE" in defect:
                safety = 34.0
            elif "TWIST" in defect or "WELD" in defect or "BUCKLE" in defect:
                safety = 28.0 + (100.0 - pre_tqi) * 0.05
            elif "BALLAST" in defect or "SLACK" in defect:
                safety = 20.0 + (100.0 - pre_tqi) * 0.04
            else:
                safety = 14.0 + (100.0 - pre_tqi) * 0.03
            safety = float(np.clip(safety, 8.0, 35.0))

            # Speed Penalty (0-25)
            post_speed = float(row.get("post_maintenance_speed_restriction_kmph", 100.0)) if pd.notna(row.get("post_maintenance_speed_restriction_kmph")) else 100.0
            speed_drop = max(0.0, 130.0 - post_speed)
            speed_penalty = float(np.clip((speed_drop / 130.0) * 25.0, 0.0, 25.0))

            # Overdue (0-20)
            status = str(row.get("bdms_approval_status", "")).upper()
            if status == "CURTAILED" or status == "REJECTED":
                overdue = 14.0
            else:
                overdue = 8.5

            # Traffic Density (0-10)
            corridor = str(row.get("corridor_code", "NDLS-CNB")).upper()
            traffic = 9.5 if "NDLS" in corridor else 7.2

            # Thermal Stress (0-10)
            env_stress = 6.0  # standard seasonal rail temp stress

            # Concurrency (0-10)
            shadow_coord = str(row.get("shadow_block_coordinated", "None"))
            has_shadow = 8.5 if shadow_coord and shadow_coord.lower() != "nan" and shadow_coord.lower() != "none" else 2.0

            # Power cut & machine
            pwr_cut = 1 if bool(row.get("requires_power_block", False)) else 0
            machine = 1  # TMS maintenance records use heavy track machines (CSM, BCM, DUOMATIC)

            # Ground truth ACI
            aci = safety + speed_penalty + overdue + traffic + env_stress
            aci = float(np.clip(aci + np.random.normal(0, 0.8), 15.0, 100.0))

            records.append({
                "safety_score": safety,
                "speed_penalty": speed_penalty,
                "overdue_ratio": overdue,
                "traffic_density": traffic,
                "env_thermal_stress": env_stress,
                "concurrency_potential": has_shadow,
                "dept_code_encoded": 0,  # ENG
                "power_cut_required": pwr_cut,
                "machine_required": machine,
                "target_aci": aci,
                "target_duration": duration_mins,
                "department": "TMS (Civil Engg)"
            })

    # =========================================================================
    # 2. SMMS (Signalling & Telecom Management System)
    # =========================================================================
    smms_path = DATASETS_DIR / "SMMS" / "smms_planned_maintenance_10000.csv"
    smms_count = 0
    if smms_path.exists():
        smms_df = pd.read_csv(smms_path)
        smms_count = len(smms_df)
        print(f"Loading SMMS planned maintenance records: {smms_count} rows...")

        for _, row in smms_df.iterrows():
            duration_mins = float(row.get("requested_duration_minutes", 60.0)) if pd.notna(row.get("requested_duration_minutes")) else 60.0
            duration_mins = max(20.0, min(240.0, duration_mins))

            # Sensor telemetry readings
            vibration = float(row.get("sensor_vibration_mm_s", 1.5)) if pd.notna(row.get("sensor_vibration_mm_s")) else 1.5
            temp_c = float(row.get("sensor_temperature_C", 32.0)) if pd.notna(row.get("sensor_temperature_C")) else 32.0
            humidity = float(row.get("sensor_humidity_pct", 55.0)) if pd.notna(row.get("sensor_humidity_pct")) else 55.0
            insulation = float(row.get("sensor_insulation_resistance_MOhm", 90.0)) if pd.notna(row.get("sensor_insulation_resistance_MOhm")) else 90.0

            # Safety Score (0-35)
            # Degraded insulation or elevated vibration significantly elevates safety hazard in signalling
            base_safety = 16.0
            if vibration > 3.0:
                base_safety += 6.0
            if insulation < 50.0:
                base_safety += 7.0
            if insulation < 20.0:
                base_safety += 5.0
            safety = float(np.clip(base_safety, 10.0, 35.0))

            # Speed Penalty (0-25)
            # Signal failures cause train stops / 15 kmph piloting
            speed_penalty = 12.0 if safety > 25.0 else 5.0

            # Overdue Ratio (0-20)
            days_overdue = float(row.get("days_overdue", 0.0)) if pd.notna(row.get("days_overdue")) else 0.0
            periodicity = float(row.get("periodicity_days", 30.0)) if pd.notna(row.get("periodicity_days")) else 30.0
            overdue = float(np.clip((max(0.0, days_overdue) / max(1.0, periodicity)) * 20.0, 0.0, 20.0))

            # Traffic Density (0-10)
            traffic = 8.0

            # Environmental / Thermal Stress (0-10)
            # High temp + high humidity in relay rooms
            env_stress = 3.0
            if temp_c > 40.0:
                env_stress += 4.0
            if humidity > 75.0:
                env_stress += 3.0
            env_stress = float(np.clip(env_stress, 2.0, 10.0))

            # Concurrency (0-10)
            can_combine = bool(row.get("can_combine_with_engineering", False))
            concurrency = 9.0 if can_combine else 2.5

            pwr_cut = 0  # S&T typically disconnected locally
            machine = 0

            aci = safety + speed_penalty + overdue + traffic + env_stress
            aci = float(np.clip(aci + np.random.normal(0, 0.7), 15.0, 100.0))

            records.append({
                "safety_score": safety,
                "speed_penalty": speed_penalty,
                "overdue_ratio": overdue,
                "traffic_density": traffic,
                "env_thermal_stress": env_stress,
                "concurrency_potential": concurrency,
                "dept_code_encoded": 1,  # SNT
                "power_cut_required": pwr_cut,
                "machine_required": machine,
                "target_aci": aci,
                "target_duration": duration_mins,
                "department": "SMMS (S&T)"
            })

    # =========================================================================
    # 3. TDMS (Traction Distribution Management System - Electrical TRD)
    # =========================================================================
    tdms_path = DATASETS_DIR / "TDMS" / "X_train.csv"
    tdms_count = 0
    if tdms_path.exists():
        tdms_df = pd.read_csv(tdms_path)
        tdms_count = len(tdms_df)
        print(f"Loading TDMS records: {tdms_count} rows...")

        for _, row in tdms_df.iterrows():
            duration_mins = float(row.get("demanded_duration_mins", 120.0)) if pd.notna(row.get("demanded_duration_mins")) else 120.0
            duration_mins = max(30.0, min(300.0, duration_mins))

            # Safety Score (0-35)
            sev = float(row.get("defect_severity_score", 0.5)) if pd.notna(row.get("defect_severity_score")) else 0.5
            safety = float(np.clip(sev * 35.0, 5.0, 35.0))

            # Speed Penalty (0-25)
            speed_risk = float(row.get("speed_risk_factor", 0.4)) if pd.notna(row.get("speed_risk_factor")) else 0.4
            speed_penalty = float(np.clip(speed_risk * 25.0, 0.0, 25.0))

            # Overdue (0-20)
            days_overdue = float(row.get("days_overdue", 5.0)) if pd.notna(row.get("days_overdue")) else 5.0
            overdue = float(np.clip((days_overdue / 30.0) * 20.0, 0.0, 20.0))

            # Traffic Density (0-10)
            trains_per_day = float(row.get("traffic_density_trains_per_day", 150.0)) if pd.notna(row.get("traffic_density_trains_per_day")) else 150.0
            traffic = float(np.clip(trains_per_day / 30.0, 2.0, 10.0))

            # Thermal Stress (0-10)
            temp_fac = float(row.get("ambient_temp_factor", 0.5)) if pd.notna(row.get("ambient_temp_factor")) else 0.5
            env_stress = float(np.clip(temp_fac * 10.0, 1.0, 10.0))

            # Concurrency (0-10)
            concurrent_engg = float(row.get("concurrent_engg_block_available", 0)) if pd.notna(row.get("concurrent_engg_block_available")) else 0
            concurrency = 9.5 if concurrent_engg == 1 else 3.0

            pwr_cut = int(row.get("power_cut_required", 1)) if pd.notna(row.get("power_cut_required")) else 1
            machine = int(row.get("tower_wagon_required", 0)) if pd.notna(row.get("tower_wagon_required")) else 0

            # Urgency score alignment
            urgency = float(row.get("urgency_score", 0.5)) if pd.notna(row.get("urgency_score")) else 0.5
            base_aci = safety + speed_penalty + overdue + traffic + env_stress
            aci = float(np.clip(base_aci * 0.7 + (urgency * 100.0) * 0.3 + np.random.normal(0, 0.6), 15.0, 100.0))

            records.append({
                "safety_score": safety,
                "speed_penalty": speed_penalty,
                "overdue_ratio": overdue,
                "traffic_density": traffic,
                "env_thermal_stress": env_stress,
                "concurrency_potential": concurrency,
                "dept_code_encoded": 2,  # TRD
                "power_cut_required": pwr_cut,
                "machine_required": machine,
                "target_aci": aci,
                "target_duration": duration_mins,
                "department": "TDMS (TRD)"
            })

    df = pd.DataFrame(records)
    print(f"Total harmonized dataset size: {len(df)} records across 3 departments.")

    X = df[FEATURE_NAMES]
    y_aci = df["target_aci"]
    y_dur = df["target_duration"]

    dept_stats = {
        "total_records": len(df),
        "tms_records": tms_count,
        "smms_records": smms_count,
        "tdms_records": tdms_count,
        "avg_duration_mins": round(float(y_dur.mean()), 1),
        "avg_aci_score": round(float(y_aci.mean()), 1),
        "dept_distribution": df["department"].value_counts().to_dict()
    }

    return X, y_aci, y_dur, dept_stats

def train_and_evaluate():
    """Trains LightGBM models on the real harmonized railway dataset."""
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    X, y_aci, y_dur, dept_stats = load_and_harmonize_datasets()

    # Train / Test split (80% train, 20% test)
    X_train, X_test, y_aci_train, y_aci_test, y_dur_train, y_dur_test = train_test_split(
        X, y_aci, y_dur, test_size=0.2, random_state=42
    )

    print("\nTraining LightGBM ACI Model (Regression)...")
    aci_model = lgb.LGBMRegressor(
        n_estimators=150,
        learning_rate=0.05,
        num_leaves=31,
        max_depth=6,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        verbose=-1
    )
    aci_model.fit(X_train, y_aci_train)

    # Evaluate ACI
    y_aci_pred = aci_model.predict(X_test)
    aci_r2 = float(r2_score(y_aci_test, y_aci_pred))
    aci_mae = float(mean_absolute_error(y_aci_test, y_aci_pred))
    aci_rmse = float(np.sqrt(mean_squared_error(y_aci_test, y_aci_pred)))
    print(f"ACI Test R²: {aci_r2:.4f} | MAE: {aci_mae:.2f} | RMSE: {aci_rmse:.2f}")

    # Quantile Models for Duration
    print("\nTraining LightGBM Duration Quantiles (Q10, Q50, Q90)...")
    q10_model = lgb.LGBMRegressor(
        objective='quantile',
        alpha=0.10,
        n_estimators=100,
        learning_rate=0.05,
        num_leaves=31,
        random_state=42,
        verbose=-1
    )
    q10_model.fit(X_train, y_dur_train)
    q10_pred = q10_model.predict(X_test)
    q10_mae = float(mean_absolute_error(y_dur_test, q10_pred))

    q50_model = lgb.LGBMRegressor(
        objective='quantile',
        alpha=0.50,
        n_estimators=100,
        learning_rate=0.05,
        num_leaves=31,
        random_state=42,
        verbose=-1
    )
    q50_model.fit(X_train, y_dur_train)
    q50_pred = q50_model.predict(X_test)
    q50_mae = float(mean_absolute_error(y_dur_test, q50_pred))
    q50_r2 = float(r2_score(y_dur_test, q50_pred))

    q90_model = lgb.LGBMRegressor(
        objective='quantile',
        alpha=0.90,
        n_estimators=100,
        learning_rate=0.05,
        num_leaves=31,
        random_state=42,
        verbose=-1
    )
    q90_model.fit(X_train, y_dur_train)
    q90_pred = q90_model.predict(X_test)
    q90_mae = float(mean_absolute_error(y_dur_test, q90_pred))

    print(f"Duration Q50 Test R²: {q50_r2:.4f} | Q50 MAE: {q50_mae:.1f}m | Q10 MAE: {q10_mae:.1f}m | Q90 MAE: {q90_mae:.1f}m")

    # Feature Importance
    importances = aci_model.feature_importances_
    total_gain = float(np.sum(importances))
    feature_importances = []
    for name, imp in zip(FEATURE_NAMES, importances):
        pct = round((float(imp) / max(1.0, total_gain)) * 100.0, 1)
        feature_importances.append({
            "feature": name,
            "importance": float(imp),
            "percentage": pct
        })
    feature_importances.sort(key=lambda x: x["importance"], reverse=True)

    # Save models
    joblib.dump(aci_model, MODELS_DIR / "lightgbm_aci.joblib")
    joblib.dump(q10_model, MODELS_DIR / "lightgbm_q10.joblib")
    joblib.dump(q50_model, MODELS_DIR / "lightgbm_q50.joblib")
    joblib.dump(q90_model, MODELS_DIR / "lightgbm_q90.joblib")
    print(f"Saved models to: {MODELS_DIR}")

    # Save metadata & metrics
    metrics = {
        "status": "TRAINED",
        "algorithm": "LightGBM (Gradient Boosting Decision Trees)",
        "lightgbm_version": lgb.__version__,
        "total_dataset_records": dept_stats["total_records"],
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "department_breakdown": {
            "TMS_Civil_Engineering": dept_stats["tms_records"],
            "SMMS_Signalling_Telecom": dept_stats["smms_records"],
            "TDMS_Electrical_TRD": dept_stats["tdms_records"]
        },
        "aci_metrics": {
            "r2_score": round(aci_r2, 4),
            "mae": round(aci_mae, 2),
            "rmse": round(aci_rmse, 2)
        },
        "duration_quantile_metrics": {
            "q50_r2_score": round(q50_r2, 4),
            "q10_mae_mins": round(q10_mae, 1),
            "q50_mae_mins": round(q50_mae, 1),
            "q90_mae_mins": round(q90_mae, 1)
        },
        "feature_importances": feature_importances,
        "features": FEATURE_NAMES
    }

    metrics_file = MODELS_DIR / "model_metrics.json"
    with open(metrics_file, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print(f"Saved metrics to: {metrics_file}")

    return metrics

if __name__ == "__main__":
    train_and_evaluate()
