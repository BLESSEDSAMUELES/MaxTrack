<div align="center">

# 🚆 MaxTrack
### Automated Railway Block Planning & Asset Availability Optimization Platform

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Google OR-Tools](https://img.shields.io/badge/Google%20OR--Tools-CP--SAT%20Solver-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/optimization)
[![LightGBM](https://img.shields.io/badge/LightGBM-4.0%2B-brightgreen?style=for-the-badge)](https://lightgbm.readthedocs.io)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

<p align="center">
  <b>An intelligent AI and combinatorial optimization engine for railway corridor maintenance.</b>
  <br />
  Coordinates track, signaling, and overhead electrical maintenance with train timetables to maximize track availability and prevent passenger train delays.
</p>

---

</div>

## 📑 Table of Contents

- [The Challenge](#-the-challenge)
- [How MaxTrack Solves It](#-how-maxtrack-solves-it)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Performance & Benchmark Results](#-performance--benchmark-results)
- [Repository Structure](#-repository-structure)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [Option 1: Unified Operations Console (Recommended)](#option-1-unified-operations-console-recommended)
  - [Option 2: Decoupled Full-Stack (Backend + Frontend)](#option-2-decoupled-full-stack-backend--frontend)
- [Datasets Included](#-datasets-included)
- [Tech Stack](#-tech-stack)

---

## ⚠️ The Challenge

Railway networks handle thousands of passenger and freight trains daily across dense track corridors. To keep operations safe, three engineering departments must perform regular maintenance:

1. **Track / Civil Engineering (P-Way)**: Rail defect repairs, tamping, deep screening.
2. **Signaling & Telecommunications (S&T)**: Point machine overhauls, signal testing, track circuits.
3. **Electrical / Overhead Traction (TRD)**: Contact wire adjustments, power de-energization blocks.

### The Problem: Departmental Silos
Traditionally, each department requests track possessions ("blocks") independently:
- **Civil** closes a section for 3 hours on Monday.
- **S&T** closes the same section for 2 hours on Wednesday.
- **Electrical** closes it for 3 hours on Friday.

**Result:** The corridor loses **8+ hours of traffic availability** across three disruptions, causing train delays, speed restrictions, and passenger inconvenience—when all three activities could have been safely combined into a **single 3.5-hour coordinated window**.

---

## 💡 How MaxTrack Solves It

MaxTrack combines predictive machine learning with exact mathematical optimization:

```
[Maintenance Requisitions] ──> [ML Prioritization Engine] ──> [Shadow Bundling] ──> [CP-SAT Solver] ──> [Conflict-Free Schedule]
```

1. **Intelligent Prioritization**: Machine learning evaluates defect severity, overdue days, traffic density, and speed penalties to compute an Asset Criticality Index (ACI).
2. **Smart Shadow Bundling**: Identifies major track possessions and co-schedules compatible signaling and electrical tasks into the same window (piggybacking).
3. **Mathematical Schedule Optimization**: Uses constraint programming (Google OR-Tools CP-SAT) to find optimal maintenance slots with **zero passenger train conflicts** and enforced safety buffers.
4. **Interactive Operations Dashboard**: Visualizes schedules on Gantt charts and Time-Space (Marey) diagrams with 1-click memo and permit generation.

---

## ✨ Key Features

- 🎯 **AI Criticality Scoring**: Automatically ranks maintenance urgency so high-risk safety defects are addressed first.
- ⏱️ **Quantile Duration Regressor**: Estimates realistic maintenance durations ($Q_{10}, Q_{50}, Q_{90}$) rather than static guesswork.
- 📦 **Cross-Department Shadow Bundling**: Merges Civil, Signal, and Electrical tasks into shared blocks, slashing total corridor downtime.
- 🛡️ **Zero-Conflict Train Protection**: Enforces mandatory headway buffers before and after high-priority express trains.
- ⚡ **Real-Time What-If Simulator**: Injects emergency disruptions (rail fractures, train delays, weather alerts) and recalculates schedules in seconds.
- 📈 **Interactive Time-Space Marey Chart**: Canvas-based train trajectory visualization showing live train paths alongside active maintenance blocks.
- 📄 **Digital Clearance & Permit Generator**: Automatically produces standardized disconnection memos, power block permits, and caution orders.

---

## 🧠 System Architecture

MaxTrack uses a two-tier hybrid architecture:

| Component | Technology | Responsibility |
|---|---|---|
| **Brain 1: AI Engine** | LightGBM & Scikit-learn | Calculates Asset Criticality Index (ACI), predicts realistic task durations, and groups overlapping requests into shadow bundles. |
| **Brain 2: Optimization Engine** | Google OR-Tools (CP-SAT) | Exact combinatorial solver that places maintenance blocks into timetable gaps without violating train paths, headway buffers, or power constraints. |
| **Operations Console** | FastAPI + Vanilla JS / React | Real-time control dashboard, Gantt charts, interactive Marey diagrams, and What-If scenario sandbox. |

---

## 📊 Performance & Benchmark Results

Evaluated on divisional railway corridor datasets (440 km, 10,000+ maintenance records):

| Metric | Traditional Uncoordinated Planning | MaxTrack Optimized Engine | Improvement |
|---|---|---|---|
| **Corridor Asset Availability** | 92.4% | **97.8%** | **+5.4% Absolute Gain** |
| **Corridor Shutdown Events** | 42 Separate Closures | **16 Coordinated Blocks** | **61.9% Fewer Disruptions** |
| **Total Corridor Downtime** | 86.5 Hours | **34.2 Hours** | **52.3 Hours Saved** |
| **Express Train Conflicts** | 38 Delays / Conflicts | **0 Conflicts** | **100% Punctuality Safe** |
| **Cross-Dept Bundling Rate** | 0.0% (Independent) | **64.5%** | **High Resource Synergy** |
| **Schedule Generation Time** | Days of manual meetings | **< 3.5 Seconds** | **Real-time Agility** |

---

## 📂 Repository Structure

```
MaxTrack/
├── Main - File/                    # [Recommended] Unified Console & Backend
│   ├── server.py                   # FastAPI application & static file host (Port 8000)
│   ├── requirements.txt            # Python dependencies (ortools, lightgbm, fastapi, etc.)
│   ├── core/                       # Core Optimization & AI Engines
│   │   ├── data_ingestion.py       # Multi-department data parser
│   │   ├── ml_engine.py            # LightGBM ACI Scorer & Duration Regressor
│   │   ├── optimizer_cpsat.py      # Google OR-Tools CP-SAT Combinatorial Solver
│   │   ├── simulator.py            # What-If disruption injector & rescheduler
│   │   ├── bdms_gateway.py         # Digital permit & caution order generator
│   │   ├── train_engine.py         # Model training pipeline
│   │   └── models/                 # Pre-trained ML models & metrics
│   └── static/                     # Operations Control Room Dashboard
│       ├── index.html              # High-density operational interface
│       ├── styles.css              # Dark navy operations design system
│       ├── app.js                  # Main controller & state manager
│       └── components/             # Dashboard modules (Gantt, Marey, Simulator)
│
├── backend/                        # [Modular] Standalone FastAPI REST API
│   ├── requirements.txt            # Backend dependencies
│   ├── tests/                      # Optimization test suite
│   └── app/                        # FastAPI routers, models, and schemas
│
├── frontend/                       # [Modular] Standalone React 18 + Vite UI
│   ├── package.json                # React dependencies (Tailwind, Lucide, Vite)
│   ├── vite.config.js              # Vite configuration with API proxy
│   └── src/                        # React UI components & API services
│
├── Datasets/                       # Railway maintenance & timetable datasets
│   ├── SMMS/                       # Signaling maintenance & defect logs
│   ├── TMS/                        # Track inspection, geometry & speed restriction data
│   └── TDMS/                       # Traction distribution & power block records
│
└── skills/                         # System architecture & engineering documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm** *(only required if running the decoupled React frontend)*

---

### Option 1: Unified Operations Console (Recommended)

Runs the complete platform—serving both the high-performance operations dashboard and the optimization API from a single lightweight FastAPI server.

```bash
# 1. Navigate to Main - File
cd "Main - File"

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Start the Operations Server
python server.py
```

Open your browser to:
👉 **`http://127.0.0.1:8000`**

*(Interactive Swagger API docs available at `http://127.0.0.1:8000/docs`)*

---

### Option 2: Decoupled Full-Stack (Backend + Frontend)

If you prefer running the backend API and the React + Vite frontend as independent services:

#### Terminal 1: Backend API
```bash
# 1. Install backend dependencies
pip install -r backend/requirements.txt

# 2. Start FastAPI server
uvicorn backend.app.main:app --reload --port 8000
```

#### Terminal 2: Frontend App
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Launch Vite development server
npm run dev
```

Open your browser to:
👉 **`http://127.0.0.1:5173`**

---

## 📈 Datasets Included

MaxTrack includes standardized railway operational datasets:

| Dataset | Department | Records | Description |
|---|---|---|---|
| `smms_signalling_failures_10000.csv` | S&T | 10,000 | Gear types, relay statuses, point codes, failure durations |
| `smms_planned_maintenance_10000.csv` | S&T | 10,000 | Routine maintenance schedules, station zones, safety categories |
| `smms_joint_inspections_10000.csv` | P-Way & S&T | 10,000 | Joint inspection logs and turnout geometry discrepancies |
| `tms_maintenance_bdms_dataset_all.csv` | P-Way | 10,000 | Track tamping, deep screening, and rail defect logs |
| `tms_speed_restriction_bdms_dataset.csv` | P-Way | 10,000 | Speed restrictions, speed penalties, and delay accumulation |
| `TDMS/X_train.csv` | TRD | 2,000+ | Overhead contact wire wear, insulator health, power block requests |

---

## 🛠 Tech Stack

- **Backend & Optimization**: Python 3.10+, FastAPI, Google OR-Tools (CP-SAT), LightGBM, Scikit-learn, NumPy, Pandas
- **Frontend & Visualization**: React 18, Vite, Vanilla JavaScript, HTML5 Canvas (Marey Charts), CSS3 (Modern Dark Operations Theme)
- **Deployment & Tooling**: Uvicorn, Pytest, Git

---

<div align="center">
  <sub>MaxTrack · Intelligent Railway Asset Availability & Corridor Scheduling Platform</sub>
</div>
