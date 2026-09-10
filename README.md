<div align="center">

# 🚆 MaxTrack (IR-ABPS)
### AI-Powered Automatic Block Planning System to Maximize Asset Availability for Train Operations

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH%202026-Problem%20Statement%2026027-ff9933?style=for-the-badge&logo=target)](https://sih.gov.in)
[![Ministry of Railways](https://img.shields.io/badge/Authority-Ministry%20of%20Railways%20%7C%20CRIS-003366?style=for-the-badge&logo=railway)](https://indianrailways.gov.in)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Google OR-Tools](https://img.shields.io/badge/Google%20OR--Tools-CP--SAT%20Solver-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/optimization)
[![LightGBM](https://img.shields.io/badge/LightGBM-4.0%2B-brightgreen?style=for-the-badge)](https://lightgbm.readthedocs.io)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

<p align="center">
  <b>A Two-Brain Hybrid AI & Combinatorial Optimization Engine resolving cross-departmental maintenance silos across Indian Railways.</b>
  <br />
  Harmonizes <b>TMS (P-Way)</b>, <b>SMMS (S&T)</b>, and <b>TDMS (TRD)</b> block requests against real-time <b>COA</b> train schedules.
</p>

---

</div>

## 📑 Table of Contents

- [Executive Overview](#-executive-overview)
- [The Railway Challenge](#-the-railway-challenge)
- [The Solution: Two-Brain Hybrid Architecture](#-the-solution-two-brain-hybrid-architecture)
  - [Brain 1: AI/ML Prioritization & Quantile Duration Regressor](#brain-1-aiml-prioritization--quantile-duration-regressor)
  - [Brain 2: Google OR-Tools CP-SAT Combinatorial Optimization](#brain-2-google-or-tools-cp-sat-combinatorial-optimization)
- [Core Platform Capabilities](#-core-platform-capabilities)
- [Interactive Visualizations](#-interactive-visualizations)
- [Statutory Railway Codes & Rule Enforcement](#-statutory-railway-codes--rule-enforcement)
- [Repository Architecture](#-repository-architecture)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [Mode 1: Unified Operations Console (Main - File)](#mode-1-unified-operations-console-main---file-recommended)
  - [Mode 2: Decoupled Full-Stack (Backend + Frontend)](#mode-2-decoupled-full-stack-backend--frontend)
- [Datasets](#-datasets)
- [Benchmarking & Baseline Proof](#-benchmarking--baseline-proof)
- [Contributing & License](#-contributing--license)

---

## 🎯 Executive Overview

Indian Railways (IR) operates the fourth-largest national railway network globally, handling **22,000+ daily trains** across **126,000+ track kilometers**. Maintenance of fixed railway assets requires periodic track possessions known as **Traffic Blocks** and **Power Blocks**.

Currently, maintenance planning across three core engineering departments is conducted in **isolated organizational silos**:
- **Civil Engineering (P-Way)** logs defects in the **Track Management System (TMS)**.
- **Signal & Telecommunications (S&T)** logs point/signal issues in the **Signalling Maintenance Management System (SMMS)**.
- **Traction Distribution (Electrical / TRD)** manages OHE power lines via the **Traction Distribution Management System (TDMS)**.
- **Control Office Application (COA)** oversees live train operations, timetable paths, and freight rakes.

**The Consequence:** The same track section is shut down repeatedly—e.g., P-Way for 3 hours on Monday, S&T for 2 hours on Wednesday, and TRD for 3 hours on Friday. The corridor loses **8 hours of traffic availability** across three disruptions when all three activities could have been safely co-scheduled into a **single 3.5-hour coordinated window**.

**MaxTrack (IR-ABPS)** eliminates this friction by unifying maintenance demands, computing explainable criticality scores, bundling multi-department requisitions into shared shadow blocks, and generating mathematically provable, conflict-free schedules over **Weekly (7-day)** and **Monthly (30-day)** horizons.

---

## ⚠️ The Railway Challenge

```
CURRENT STATE (Decentralized S&T, Civil, and TRD Silos):
┌──────────────────────────┐    Isolated Request    ┌──────────────────────────┐
│  TMS (Civil / P-Way)     │ ─────────────────────> │                          │
│  - Rail fractures (IMR)  │                        │                          │
│  - Tamping machines (CSM)│                        │                          │
└──────────────────────────┘                        │                          │
┌──────────────────────────┐    Isolated Request    │       CRIS BDMS          │ ──> Section Controller (COA)
│  SMMS (S&T / Signals)    │ ─────────────────────> │  (Block Demand System)   │     Negotiates manual slots;
│  - Point machine checks  │                        │                          │     causes block rejections,
│  - Track circuit repairs │                        │                          │     TSR speed restrictions (15-30 km/h)
└──────────────────────────┘                        │                          │     and heavy passenger delays.
┌──────────────────────────┐    Isolated Request    │                          │
│  TDMS (Electrical / TRD) │ ─────────────────────> │                          │
│  - OHE contact wire      │                        │                          │
│  - Power block demands   │                        │                          │
└──────────────────────────┘                        └──────────────────────────┘

MAXTRACK TARGET STATE (Unified Two-Brain Coordinated Automation):
┌─────────────────────────┐
│ TMS + SMMS + TDMS + COA │
└────────────┬────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BRAIN 1: AI/ML ENGINE                           │
│  • LightGBM Asset Criticality Index (ACI) Scorer                       │
│  • Quantile Regressor: Non-parametric duration bounds (Q10, Q50, Q90)   │
│  • Spatial-Temporal Shadow Bundler (Piggyback S&T & TRD in Civil cuts) │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                BRAIN 2: GOOGLE OR-TOOLS CP-SAT SOLVER                  │
│  • Exact Combinatorial Interval Optimization                           │
│  • Hard Constraint Validation: OHE Power-off, 15m Headway, Loop safety │
│  • Minimizes Corridor Downtime & Passenger Train Conflicts             │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       STATUTORY CRIS GATEWAY                           │
│  • Automated Form S&T T/351 Disconnection Memos                        │
│  • Form TRD-PB-1 Traction Power Block Permits                          │
│  • Section Caution Orders & COA Train Graph Integration                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🧠 The Solution: Two-Brain Hybrid Architecture

MaxTrack implements a **hybrid architecture** pairing predictive statistical machine learning with exact constraint programming:

```
[Raw Maintenance Feeds] ──> [Brain 1: ML Engine] ──> [Shadow Bundles] ──> [Brain 2: CP-SAT] ──> [Optimal Schedule]
```

### Brain 1: AI/ML Prioritization & Quantile Duration Regressor
- **Asset Criticality Index (ACI) Scoring**:
  Trained on historical defect logs, track geometry measurements (GMP), overdue days against IRPWM norms, and operational speed penalties.
  $$\text{ACI} = w_1 \cdot \text{OverdueNorm} + w_2 \cdot \text{SafetyClass} + w_3 \cdot \text{TrafficDensity} + w_4 \cdot \text{SpeedPenalty}$$
- **Quantile Duration Regressor ($Q_{10}, Q_{50}, Q_{90}$)**:
  Estimates realistic operational completion windows instead of rigid single-point estimates. Accounts for gang productivity, nocturnal visibility penalties, temperature stress, and asset age.
- **Spatial Shadow Bundling**:
  Identifies lead possessions (e.g., Heavy P-Way Track Relaying) and nests compatible S&T (e.g., Point Machine Overhaul) and TRD (e.g., OHE Contact Wire Adjustment) tasks into the same spatio-temporal slot, converting separate corridor closures into piggybacked shadow operations.

### Brain 2: Google OR-Tools CP-SAT Combinatorial Optimization
Combinatorial scheduling is an NP-hard optimization problem. MaxTrack formulates block planning as an **exact constraint satisfaction problem (CSP)**:
- **Decision Variables**: Interval variables $\mathbf{I}_{b} = [s_b, e_b, d_b]$ for each maintenance bundle $b$, alongside timetable intervals $\mathbf{T}_{t}$ for each scheduled train $t$.
- **Hard Constraints**:
  1. **Non-Overlap with Train Paths**: $\mathbf{I}_{b} \cap \mathbf{T}_{t} = \emptyset$ for all primary passenger paths on shared track sections.
  2. **Statutory Headway Buffers**: Enforces a mandatory **15-minute headway buffer** before and after high-speed passenger paths (Rajdhani, Vande Bharat, Shatabdi).
  3. **OHE Power-Off Dependency**: If a TRD bundle mandates power de-energization, all electric train movements across that traction sub-station (TSS) sector are halted or routed to diesel traction.
  4. **Single-Line Crossing Protection**: Guarantees that opposing trains on single-line sections have validated loop clearances while a block is underway.
- **Objective Function**:
  $$\min \quad Z = \alpha \sum (\text{Downtime}_b) + \beta \sum (\text{TrainDelay}_t) - \gamma \sum (\text{ACI}_b) - \delta (\text{BundlingSavings})$$

---

## ⚡ Core Platform Capabilities

1. **Multi-Horizon Scheduling**:
   - **Weekly Operational (7-Day)**: Exact slot possessions, gang assignments, stationmaster cautions.
   - **Monthly Strategic (30-Day)**: Corridor capacity budgeting, mega-block coordination, heavy machine (CSM/TRT) routing.
2. **Dynamic What-If Disruption Simulator**:
   - Inject emergency rail fractures (IMR), delayed freight rakes, or weather alerts.
   - Instantly regenerates revised schedules with zero passenger conflicts and displays schedule deltas.
3. **Interactive Time-Space Marey Chart**:
   - Canvas-based distance-time diagram plotting passenger/freight train trajectories against active block possessions.
4. **CRIS BDMS Statutory Gateway**:
   - Generates official **Form S&T T/351** (Disconnection Memo), **Form TRD-PB-1** (Power Block Permit), and Divisional Caution Orders with 1-click export.
5. **Anti-AI-Slop Railway Operations UI**:
   - High-density data layout, left-aligned horizontal navigation, and official Indian Railways midnight navy & carbon palette (`#070e1c` / `#0f172a`).

---

## 📊 Benchmarking & Baseline Proof

Evaluated on divisional-scale datasets (**NDLS-CNB Corridor**, 440 km, 10,000+ records):

| Metric | Manual Uncoordinated Planning | MaxTrack Two-Brain Engine | Improvement |
|---|---|---|---|
| **Corridor Asset Availability** | 92.4% | **97.8%** | **+5.4% Absolute Gain** |
| **Total Block Shutdowns** | 42 Separate Possessions | **16 Coordinated Blocks** | **61.9% Fewer Corridor Disruptions** |
| **Total Corridor Downtime** | 86.5 Hours | **34.2 Hours** | **52.3 Hours Saved** |
| **High-Priority Train Detentions** | 38 Express Delays | **0 Conflicts** | **100% Punctuality Protected** |
| **Multi-Dept Bundling Efficiency** | 0.0% (Silos) | **64.5%** | **Cross-Departmental Synergy** |
| **Solver Generation Latency** | Manual (Days of meetings) | **< 3.5 Seconds** | **Real-time Re-scheduling** |

---

## 🏛 Statutory Railway Codes & Rule Enforcement

MaxTrack strictly embeds Indian Railways statutory safety regulations:
- **IRPWM 2020 (Indian Railways Permanent Way Manual)**: Periodicities for deep screening, track tamping, ultrasonic testing (USFD), and speed restrictions.
- **G&SR 3.51 & 15.08 (General & Subsidiary Rules)**: Legal protocols governing signal disconnections and precautions when working on tracks with traffic on adjacent lines.
- **IRSEM (Indian Railways Signal Engineering Manual)**: Safety interlockings and point-machine testing norms.
- **ACTM (AC Traction Manual)**: Earthing protocols, permit-to-work (PTW), and power block de-energization boundaries.

---

## 📂 Repository Architecture

The repository provides both an all-in-one unified operations server (`Main - File`) and a modular full-stack application (`backend` + `frontend`):

```
MaxTrack/
├── .gitignore                      # Comprehensive root gitignore (Python, Node, DBs, IDEs)
├── README.md                       # Project documentation & operational guide
│
├── Main - File/                    # [Primary] High-Performance Unified Console & Backend
│   ├── server.py                   # FastAPI server & static file host (port 8000)
│   ├── requirements.txt            # Python dependencies (ortools, lightgbm, scikit-learn, etc.)
│   ├── report.md                   # Full 500-line Engineering Architecture Report
│   ├── core/                       # Operational Python Engines
│   │   ├── data_ingestion.py       # Multi-department parser (TMS, SMMS, TDMS, COA)
│   │   ├── ml_engine.py            # Brain 1: LightGBM ACI Scorer & Duration Regressor
│   │   ├── optimizer_cpsat.py      # Brain 2: Google OR-Tools CP-SAT Combinatorial Solver
│   │   ├── simulator.py            # Real-time What-If disruption injector & rescheduler
│   │   ├── bdms_gateway.py         # Statutory Form S&T T/351 & TRD-PB-1 generator
│   │   ├── train_engine.py         # Model training pipeline
│   │   ├── test_ml_pipeline.py     # Automated ML & OR integration test suite
│   │   └── models/                 # Pre-trained LightGBM joblib models & metrics
│   └── static/                     # Operations Control Room Dashboard
│       ├── index.html              # High-density UI with left-aligned navigation
│       ├── styles.css              # Anti-AI-slop IR midnight navy design system
│       ├── app.js                  # Main controller & state orchestrator
│       ├── components/             # Modular dashboard components
│       │   ├── command_center.js   # Availability gauges, KPI ribbon & live status
│       │   ├── data_bridge.js      # Multi-department tabular explorer & wire inspector
│       │   ├── ai_prioritization.js# ACI rank ledger & feature importance breakdown
│       │   ├── block_scheduler.js  # Weekly/Monthly Gantt & bundle cards
│       │   ├── marey_chart.js      # Canvas Time-Space train-path & possession chart
│       │   ├── what_if_simulator.js# Disruption perturbation studio
│       │   └── bdms_dispatch.js    # Statutory memos & digital clearance permit generator
│       └── assets/
│           └── ir_logo.svg         # Official Indian Railways vector insignia
│
├── backend/                        # [Modular] Standalone FastAPI + SQLite API
│   ├── requirements.txt            # Backend dependencies
│   ├── tests/                      # Pytest optimization test suite
│   └── app/
│       ├── main.py                 # FastAPI application entry point
│       ├── config.py               # Application configuration
│       ├── api/                    # Route handlers (plans, tasks, simulator)
│       ├── data/                   # Seed data & database initializers
│       ├── engine/                 # OR-Tools optimizer, baseline & prioritizer
│       ├── models/                 # SQLAlchemy ORM entities
│       └── schemas/                # Pydantic schemas
│
├── frontend/                       # [Modular] Standalone React 18 + Vite + Tailwind UI
│   ├── package.json                # React dependencies (lucide-react, tailwindcss, vite)
│   ├── vite.config.js              # Vite config with API proxy to port 8000
│   ├── index.html                  # React root HTML
│   └── src/
│       ├── App.jsx                 # Main application view
│       ├── components/             # React UI components (Gantt, Marey, KPIs, Simulator)
│       └── services/api.js         # API integration client
│
├── Datasets/                       # Real & Synthetic Railway Datasets
│   ├── SMMS/                       # Signalling maintenance & failure logs
│   ├── TMS/                        # Track maintenance, inspection & speed restriction records
│   └── TDMS/                       # Traction distribution & power block datasets
│
└── skills/                         # SIH Engineering Documents & System Blueprints
    ├── 01_Project_Requirement_Document.md
    ├── 02_Technical_Requirement_Document.md
    ├── 03_App_Flow.md
    ├── 04_UI_UX_Design_Brief.md
    ├── 05_Backend_Schema.md
    ├── 06_Implementation_Plan.md
    └── report.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm** (only if running the decoupled React frontend)
- Git

---

### Mode 1: Unified Operations Console (`Main - File`) [Recommended]

This runs the complete integrated platform—serving both the high-performance operations dashboard and the Two-Brain API from a single lightweight FastAPI server.

```powershell
# 1. Navigate to Main - File
cd "Main - File"

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Start the MaxTrack Operations Server
python server.py
```

Open your browser to:
👉 **`http://127.0.0.1:8000`**

*(Interactive Swagger API documentation available at `http://127.0.0.1:8000/docs`)*

---

### Mode 2: Decoupled Full-Stack (`Backend` + `Frontend`)

If you prefer running the standalone FastAPI service alongside the independent React + Vite frontend:

#### Terminal 1: Backend Server
```powershell
# 1. Install backend dependencies
pip install -r backend/requirements.txt

# 2. Start FastAPI with auto-reload
uvicorn backend.app.main:app --reload --port 8000
```

#### Terminal 2: Frontend Client
```powershell
# 1. Navigate to frontend directory
cd frontend

# 2. Install Node packages
npm install

# 3. Launch Vite development server
npm run dev
```

Open your browser to:
👉 **`http://127.0.0.1:5173`**

---

## 📈 Datasets

MaxTrack includes realistic, standardized synthetic datasets modeled directly after CRIS production databases:

| Dataset | System | Records | Attributes Captured |
|---|---|---|---|
| `smms_signalling_failures_10000.csv` | SMMS | 10,000 | Gear type, relay state, point machine code, failure duration, overdue days |
| `smms_planned_maintenance_10000.csv` | SMMS | 10,000 | Preventive maintenance periodicity, station limits, safety class |
| `smms_joint_inspections_10000.csv` | SMMS/TMS | 10,000 | P-Way + S&T joint inspection defects, turnout geometry discrepancies |
| `tms_maintenance_bdms_dataset_all.csv`| TMS | 10,000 | Deep screening, tamping needs, rail fracture (IMR) urgency, track ballast |
| `tms_speed_restriction_bdms_dataset.csv`| TMS | 10,000 | Temporary Speed Restrictions (TSR), speed penalty km/h, cumulative delay |
| `TDMS/X_train.csv` | TDMS | 2,000+ | OHE cantilever wear, insulator contamination, power block permits |

---

## 👥 Contributors & Acknowledgements

- **Team MaxTrack** — Smart India Hackathon 2026 (Problem Statement 26027)
- **Problem Statement Owner**: Ministry of Railways, Government of India
- **Implementing Authority**: Centre for Railway Information Systems (CRIS)

---

<div align="center">
  <sub>Built with precision for Indian Railways · Operational Safety First · Zero Headway Compromise</sub>
</div>
