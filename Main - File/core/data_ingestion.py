"""
MaxTrack Multi-Department Data Ingestion & Integration Layer
Harmonizes TMS (Civil/P-Way), SMMS (Signals), TDMS (Traction), and COA (Train Ops)
Complies with IRPWM 2020, G&SR 3.51 & 15.08, IRSEM, and ACTM norms.
"""

from typing import List, Dict, Any
from datetime import datetime, timedelta, timezone

class DataIngestionService:
    def __init__(self):
        self.corridors = self._build_corridor_topology()
        self.stations = self._build_stations()
        self.trains = self._build_working_time_table()
        self.tms_records = self._build_tms_records()
        self.smms_records = self._build_smms_records()
        self.tdms_records = self._build_tdms_records()

    def _build_corridor_topology(self) -> List[Dict[str, Any]]:
        return [
            {
                "corridor_code": "NDLS-CNB",
                "name": "New Delhi – Kanpur Central (HDN-1 Trunk)",
                "zone": "Northern Railway (NR) / NCR",
                "division": "Delhi / Prayagraj",
                "length_km": 440.0,
                "lines": ["UP_MAIN", "DN_MAIN"],
                "electrified": True,
                "traction_voltage": "25 kV AC 50 Hz",
                "signalling": "Automatic Block Signalling (ABS)",
                "max_permissible_speed": 130
            },
            {
                "corridor_code": "DNR-PNBE",
                "name": "Danapur – Patna Junction",
                "zone": "East Central Railway (ECR)",
                "division": "Danapur",
                "length_km": 10.0,
                "lines": ["UP_MAIN", "DN_MAIN"],
                "electrified": True,
                "traction_voltage": "25 kV AC 50 Hz",
                "signalling": "Absolute Block Signalling",
                "max_permissible_speed": 110
            }
        ]

    def _build_stations(self) -> List[Dict[str, Any]]:
        # Key Interlocking Stations by Corridor
        return [
            {"code": "NDLS", "name": "New Delhi", "km": 0.0, "has_loops": True, "corridor_code": "NDLS-CNB"},
            {"code": "GZB", "name": "Ghaziabad Jn", "km": 45.0, "has_loops": True, "corridor_code": "NDLS-CNB"},
            {"code": "ALJN", "name": "Aligarh Jn", "km": 140.0, "has_loops": True, "corridor_code": "NDLS-CNB"},
            {"code": "TDL", "name": "Tundla Jn", "km": 280.0, "has_loops": True, "corridor_code": "NDLS-CNB"},
            {"code": "CNB", "name": "Kanpur Central", "km": 440.0, "has_loops": True, "corridor_code": "NDLS-CNB"},
            {"code": "DNR", "name": "Danapur", "km": 0.0, "has_loops": True, "corridor_code": "DNR-PNBE"},
            {"code": "PWS", "name": "Phulwari Sharif", "km": 5.2, "has_loops": True, "corridor_code": "DNR-PNBE"},
            {"code": "PNBE", "name": "Patna Junction", "km": 10.0, "has_loops": True, "corridor_code": "DNR-PNBE"}
        ]

    def _build_working_time_table(self) -> List[Dict[str, Any]]:
        # Master Passenger & Freight Train Paths
        return [
            # NDLS-CNB Trunk Trains
            {
                "train_no": "12002",
                "train_name": "Bhopal Shatabdi Express",
                "category": "PREMIUM_PASSENGER",
                "direction": "DN",
                "corridor_code": "NDLS-CNB",
                "speed_kmh": 130,
                "schedule": [
                    {"station": "NDLS", "km": 0.0, "dep_min": 360},     # 06:00
                    {"station": "GZB", "km": 45.0, "dep_min": 395},     # 06:35
                    {"station": "ALJN", "km": 140.0, "dep_min": 455},   # 07:35
                    {"station": "TDL", "km": 280.0, "dep_min": 545},    # 09:05
                    {"station": "CNB", "km": 440.0, "arr_min": 650}     # 10:50
                ]
            },
            {
                "train_no": "12302",
                "train_name": "Howrah Rajdhani Express",
                "category": "PREMIUM_PASSENGER",
                "direction": "DN",
                "corridor_code": "NDLS-CNB",
                "speed_kmh": 130,
                "schedule": [
                    {"station": "NDLS", "km": 0.0, "dep_min": 1015},    # 16:55
                    {"station": "GZB", "km": 45.0, "dep_min": 1050},
                    {"station": "ALJN", "km": 140.0, "dep_min": 1110},
                    {"station": "TDL", "km": 280.0, "dep_min": 1200},
                    {"station": "CNB", "km": 440.0, "arr_min": 1305}
                ]
            },
            {
                "train_no": "12004",
                "train_name": "Lucknow Shatabdi Express",
                "category": "PREMIUM_PASSENGER",
                "direction": "DN",
                "corridor_code": "NDLS-CNB",
                "speed_kmh": 120,
                "schedule": [
                    {"station": "NDLS", "km": 0.0, "dep_min": 370},
                    {"station": "GZB", "km": 45.0, "dep_min": 410},
                    {"station": "ALJN", "km": 140.0, "dep_min": 480},
                    {"station": "TDL", "km": 280.0, "dep_min": 575},
                    {"station": "CNB", "km": 440.0, "arr_min": 690}
                ]
            },
            {
                "train_no": "12418",
                "train_name": "Prayagraj Express",
                "category": "MAIL_EXPRESS",
                "direction": "DN",
                "corridor_code": "NDLS-CNB",
                "speed_kmh": 110,
                "schedule": [
                    {"station": "NDLS", "km": 0.0, "dep_min": 1330},    # 22:10
                    {"station": "GZB", "km": 45.0, "dep_min": 1375},
                    {"station": "ALJN", "km": 140.0, "dep_min": 1445},
                    {"station": "TDL", "km": 280.0, "dep_min": 90},     # next day 01:30
                    {"station": "CNB", "km": 440.0, "arr_min": 240}
                ]
            },
            {
                "train_no": "BOXN-701",
                "train_name": "BOXN Coal Rake (DVC Thermal)",
                "category": "FREIGHT_GOODS",
                "direction": "UP",
                "corridor_code": "NDLS-CNB",
                "speed_kmh": 75,
                "schedule": [
                    {"station": "CNB", "km": 440.0, "dep_min": 60},     # 01:00
                    {"station": "TDL", "km": 280.0, "dep_min": 210},
                    {"station": "ALJN", "km": 140.0, "dep_min": 360},
                    {"station": "GZB", "km": 45.0, "dep_min": 480},
                    {"station": "NDLS", "km": 0.0, "arr_min": 550}
                ]
            },
            {
                "train_no": "BTPN-304",
                "train_name": "BTPN Petroleum Rake (IOCL Mathura)",
                "category": "FREIGHT_GOODS",
                "direction": "UP",
                "corridor_code": "NDLS-CNB",
                "speed_kmh": 70,
                "schedule": [
                    {"station": "CNB", "km": 440.0, "dep_min": 720},    # 12:00
                    {"station": "TDL", "km": 280.0, "dep_min": 880},
                    {"station": "ALJN", "km": 140.0, "dep_min": 1020},
                    {"station": "GZB", "km": 45.0, "dep_min": 1150},
                    {"station": "NDLS", "km": 0.0, "arr_min": 1210}
                ]
            },
            {
                "train_no": "22436",
                "train_name": "Vande Bharat Express (NDLS-BSB)",
                "category": "PREMIUM_PASSENGER",
                "direction": "DN",
                "corridor_code": "NDLS-CNB",
                "speed_kmh": 130,
                "schedule": [
                    {"station": "NDLS", "km": 0.0, "dep_min": 360},     # 06:00
                    {"station": "GZB", "km": 45.0, "dep_min": 390},
                    {"station": "ALJN", "km": 140.0, "dep_min": 445},
                    {"station": "TDL", "km": 280.0, "dep_min": 525},
                    {"station": "CNB", "km": 440.0, "arr_min": 608}     # 10:08
                ]
            },
            {
                "train_no": "12424",
                "train_name": "Dibrugarh Rajdhani Express",
                "category": "PREMIUM_PASSENGER",
                "direction": "DN",
                "corridor_code": "NDLS-CNB",
                "speed_kmh": 130,
                "schedule": [
                    {"station": "NDLS", "km": 0.0, "dep_min": 980},     # 16:20
                    {"station": "GZB", "km": 45.0, "dep_min": 1015},
                    {"station": "ALJN", "km": 140.0, "dep_min": 1075},
                    {"station": "TDL", "km": 280.0, "dep_min": 1160},
                    {"station": "CNB", "km": 440.0, "arr_min": 1262}    # 21:02
                ]
            },
            {
                "train_no": "12560",
                "train_name": "Shiv Ganga Superfast Express",
                "category": "MAIL_EXPRESS",
                "direction": "DN",
                "corridor_code": "NDLS-CNB",
                "speed_kmh": 110,
                "schedule": [
                    {"station": "NDLS", "km": 0.0, "dep_min": 1205},    # 20:05
                    {"station": "GZB", "km": 45.0, "dep_min": 1245},
                    {"station": "ALJN", "km": 140.0, "dep_min": 1320},
                    {"station": "TDL", "km": 280.0, "dep_min": 1420},
                    {"station": "CNB", "km": 440.0, "arr_min": 60}      # 01:00 (next day)
                ]
            },
            # DNR-PNBE Branch Trains
            {
                "train_no": "12141",
                "train_name": "Pataliputra Superfast Express",
                "category": "PREMIUM_PASSENGER",
                "direction": "DN",
                "corridor_code": "DNR-PNBE",
                "speed_kmh": 90,
                "schedule": [
                    {"station": "DNR", "km": 0.0, "dep_min": 330},      # 05:30
                    {"station": "PWS", "km": 5.2, "dep_min": 339},
                    {"station": "PNBE", "km": 10.0, "arr_min": 348}     # 05:48
                ]
            },
            {
                "train_no": "13243",
                "train_name": "Patna Intercity Express",
                "category": "MAIL_EXPRESS",
                "direction": "UP",
                "corridor_code": "DNR-PNBE",
                "speed_kmh": 80,
                "schedule": [
                    {"station": "PNBE", "km": 10.0, "dep_min": 495},    # 08:15
                    {"station": "PWS", "km": 5.2, "dep_min": 504},
                    {"station": "DNR", "km": 0.0, "arr_min": 513}      # 08:33
                ]
            },
            {
                "train_no": "03218",
                "train_name": "Danapur Commuter EMU",
                "category": "PASSENGER_LOCAL",
                "direction": "DN",
                "corridor_code": "DNR-PNBE",
                "speed_kmh": 60,
                "schedule": [
                    {"station": "DNR", "km": 0.0, "dep_min": 660},      # 11:00
                    {"station": "PWS", "km": 5.2, "dep_min": 670},
                    {"station": "PNBE", "km": 10.0, "arr_min": 680}     # 11:20
                ]
            },
            {
                "train_no": "12392",
                "train_name": "Shramjeevi Superfast Express",
                "category": "PREMIUM_PASSENGER",
                "direction": "UP",
                "corridor_code": "DNR-PNBE",
                "speed_kmh": 90,
                "schedule": [
                    {"station": "PNBE", "km": 10.0, "dep_min": 840},    # 14:00
                    {"station": "PWS", "km": 5.2, "dep_min": 849},
                    {"station": "DNR", "km": 0.0, "arr_min": 858}      # 14:18
                ]
            },
            {
                "train_no": "BOXN-DNR44",
                "train_name": "BOXN Barauni Fertilizer Rake",
                "category": "FREIGHT_GOODS",
                "direction": "DN",
                "corridor_code": "DNR-PNBE",
                "speed_kmh": 50,
                "schedule": [
                    {"station": "DNR", "km": 0.0, "dep_min": 1080},     # 18:00
                    {"station": "PWS", "km": 5.2, "dep_min": 1098},
                    {"station": "PNBE", "km": 10.0, "arr_min": 1115}    # 18:35
                ]
            }
        ]

    def _build_tms_records(self) -> List[Dict[str, Any]]:
        # Track Management System (TMS) - Civil / P-Way Demands
        return [
            {
                "id": "TMS-001",
                "source_system": "TMS",
                "department": "ENG",
                "corridor_code": "NDLS-CNB",
                "line": "UP_MAIN",
                "task_type": "Track Tamping & High-Precision Alignment",
                "km_start": 285.2,
                "km_end": 287.4,
                "elementary_section": "ES-24B",
                "requires_power_off": False,
                "machine_required": "CSM 09-32",
                "duration_minutes": 180,
                "safety_class": "critical",
                "defect_detail": "IRPWM 706 Rail Flaw: Gauge variation +4.2mm, twist 3.8mm/3.6m",
                "caution_order_speed": 30,
                "days_overdue": 8,
                "codal_interval_days": 90,
                "tqi": 38.4,
                "rail_temp_c": 42.0
            },
            {
                "id": "TMS-002",
                "source_system": "TMS",
                "department": "ENG",
                "corridor_code": "NDLS-CNB",
                "line": "DN_MAIN",
                "task_type": "Ballast Deep Screening & Shoulder Cleaning",
                "km_start": 138.0,
                "km_end": 140.5,
                "elementary_section": "ES-12C",
                "requires_power_off": False,
                "machine_required": "BCM RM-80",
                "duration_minutes": 240,
                "safety_class": "high",
                "defect_detail": "Severe ballast fouling (caking > 65%), drainage choked",
                "caution_order_speed": 45,
                "days_overdue": 14,
                "codal_interval_days": 180,
                "tqi": 44.1,
                "rail_temp_c": 38.5
            },
            {
                "id": "TMS-003",
                "source_system": "TMS",
                "department": "ENG",
                "corridor_code": "NDLS-CNB",
                "line": "UP_MAIN",
                "task_type": "Ultrasonic Flaw Detection (USFD) Rail Joint Renewal",
                "km_start": 42.0,
                "km_end": 44.2,
                "elementary_section": "ES-04A",
                "requires_power_off": False,
                "machine_required": None,
                "duration_minutes": 120,
                "safety_class": "critical",
                "defect_detail": "IMR weld defect at Km 43.150; immediate fishplating applied",
                "caution_order_speed": 20,
                "days_overdue": 3,
                "codal_interval_days": 30,
                "tqi": 32.0,
                "rail_temp_c": 41.0
            },
            {
                "id": "TMS-004",
                "source_system": "TMS",
                "department": "ENG",
                "corridor_code": "NDLS-CNB",
                "line": "UP_MAIN",
                "task_type": "Switch Expansion Joint (SEJ) Destressing & Gap Adjustment",
                "km_start": 212.0,
                "km_end": 214.5,
                "elementary_section": "ES-18A",
                "requires_power_off": False,
                "machine_required": None,
                "duration_minutes": 150,
                "safety_class": "high",
                "defect_detail": "Hathras section rail thermal expansion exceedance; SEJ gap skewed by 22mm",
                "caution_order_speed": 50,
                "days_overdue": 5,
                "codal_interval_days": 60,
                "tqi": 35.8,
                "rail_temp_c": 43.5
            },
            {
                "id": "TMS-005",
                "source_system": "TMS",
                "department": "ENG",
                "corridor_code": "NDLS-CNB",
                "line": "DN_MAIN",
                "task_type": "Turnout Switch & Crossing Tongue Rail Renewal",
                "km_start": 88.5,
                "km_end": 90.2,
                "elementary_section": "ES-08B",
                "requires_power_off": False,
                "machine_required": "UNIMAT 08-475",
                "duration_minutes": 180,
                "safety_class": "critical",
                "defect_detail": "Khurja Junction 1:12 crossover curved switch blade chipped; flange climbing risk",
                "caution_order_speed": 30,
                "days_overdue": 12,
                "codal_interval_days": 90,
                "tqi": 41.2,
                "rail_temp_c": 39.0
            },
            {
                "id": "TMS-006",
                "source_system": "TMS",
                "department": "ENG",
                "corridor_code": "NDLS-CNB",
                "line": "UP_MAIN",
                "task_type": "High-Speed Rail Grinding & Profile Restoration",
                "km_start": 435.0,
                "km_end": 438.0,
                "elementary_section": "ES-32D",
                "requires_power_off": False,
                "machine_required": "RGM-72",
                "duration_minutes": 210,
                "safety_class": "medium",
                "defect_detail": "Kanpur approach head check corrugation > 0.4mm depth; 130 km/h acoustic rumble",
                "caution_order_speed": 60,
                "days_overdue": 4,
                "codal_interval_days": 120,
                "tqi": 29.5,
                "rail_temp_c": 40.0
            },
            {
                "id": "TMS-007",
                "source_system": "TMS",
                "department": "ENG",
                "corridor_code": "NDLS-CNB",
                "line": "DN_MAIN",
                "task_type": "Flash Butt Weld Micro-Defect Treatment & Fishplating",
                "km_start": 141.2,
                "km_end": 143.0,
                "elementary_section": "ES-12C",
                "requires_power_off": False,
                "machine_required": None,
                "duration_minutes": 90,
                "safety_class": "high",
                "defect_detail": "USFD periodic scan observed 0.8mm internal echo flaw near Aligarh freight loop",
                "caution_order_speed": 45,
                "days_overdue": 2,
                "codal_interval_days": 30,
                "tqi": 34.0,
                "rail_temp_c": 37.5
            },
            {
                "id": "TMS-008",
                "source_system": "TMS",
                "department": "ENG",
                "corridor_code": "NDLS-CNB",
                "line": "DN_MAIN",
                "task_type": "Ballast Shoulder Cleaning & Drainage Dressing",
                "km_start": 278.0,
                "km_end": 280.5,
                "elementary_section": "ES-24B",
                "requires_power_off": False,
                "machine_required": "BCM RM-80",
                "duration_minutes": 180,
                "safety_class": "medium",
                "defect_detail": "Cess clearance and shoulder ballast voiding along Tundla outer approach",
                "caution_order_speed": 50,
                "days_overdue": 7,
                "codal_interval_days": 90,
                "tqi": 37.1,
                "rail_temp_c": 41.2
            },
            {
                "id": "TMS-009",
                "source_system": "TMS",
                "department": "ENG",
                "corridor_code": "NDLS-CNB",
                "line": "UP_MAIN",
                "task_type": "Through Sleeper Renewal & Elastic Rail Clip Replacement",
                "km_start": 44.5,
                "km_end": 46.0,
                "elementary_section": "ES-04A",
                "requires_power_off": False,
                "machine_required": None,
                "duration_minutes": 120,
                "safety_class": "high",
                "defect_detail": "PSC sleeper seat cracking (14 nos) and rusted ERC clips near Ghaziabad yard",
                "caution_order_speed": 40,
                "days_overdue": 6,
                "codal_interval_days": 60,
                "tqi": 36.5,
                "rail_temp_c": 40.5
            },
            # DNR-PNBE Branch Tasks
            {
                "id": "TMS-DNR-01",
                "source_system": "TMS",
                "department": "ENG",
                "corridor_code": "DNR-PNBE",
                "line": "UP_MAIN",
                "task_type": "Track Tamping & Cross-Level Correction",
                "km_start": 4.5,
                "km_end": 5.8,
                "elementary_section": "ES-DNR-02",
                "requires_power_off": False,
                "machine_required": "CSM 09-32",
                "duration_minutes": 150,
                "safety_class": "critical",
                "defect_detail": "Uneven settlement at Phulwari curve, alignment skew 3.1mm",
                "caution_order_speed": 35,
                "days_overdue": 5,
                "codal_interval_days": 60,
                "tqi": 36.2,
                "rail_temp_c": 39.0
            },
            {
                "id": "TMS-DNR-02",
                "source_system": "TMS",
                "department": "ENG",
                "corridor_code": "DNR-PNBE",
                "line": "DN_MAIN",
                "task_type": "Turnout Switch & Crossing Renewal",
                "km_start": 9.1,
                "km_end": 9.9,
                "elementary_section": "ES-PNBE-01",
                "requires_power_off": False,
                "machine_required": None,
                "duration_minutes": 180,
                "safety_class": "high",
                "defect_detail": "Patna West Cabin scissors crossover tongue rail wear 6mm",
                "caution_order_speed": 25,
                "days_overdue": 11,
                "codal_interval_days": 90,
                "tqi": 41.0,
                "rail_temp_c": 37.0
            },
            {
                "id": "TMS-DNR-03",
                "source_system": "TMS",
                "department": "ENG",
                "corridor_code": "DNR-PNBE",
                "line": "UP_MAIN",
                "task_type": "USFD Weld Joint Flaw Testing & Fishplate Tightening",
                "km_start": 1.2,
                "km_end": 2.4,
                "elementary_section": "ES-DNR-01",
                "requires_power_off": False,
                "machine_required": None,
                "duration_minutes": 120,
                "safety_class": "high",
                "defect_detail": "Danapur yard lead AT-weld fatigue micro-crack IRPWM 706",
                "caution_order_speed": 40,
                "days_overdue": 3,
                "codal_interval_days": 45,
                "tqi": 34.0,
                "rail_temp_c": 38.0
            }
        ]

    def _build_smms_records(self) -> List[Dict[str, Any]]:
        # Signalling Maintenance Management System (SMMS) - S&T Demands
        return [
            {
                "id": "SMMS-101",
                "source_system": "SMMS",
                "department": "SNT",
                "corridor_code": "NDLS-CNB",
                "line": "UP_MAIN",
                "task_type": "Point Machine 104A/B Obstruction & Overhaul Test",
                "km_start": 286.0,
                "km_end": 286.3,
                "elementary_section": "ES-24B",
                "requires_power_off": True,  # 25kV traction bonding proximity
                "machine_required": None,
                "duration_minutes": 90,
                "safety_class": "critical",
                "defect_detail": "G&SR 3.51 Form T/351: Operating current spike 5.8A, detector lock delay",
                "sensor_vibration_mms": 9.4,
                "insulation_mohm": 42.0,
                "days_overdue": 4,
                "codal_interval_days": 60
            },
            {
                "id": "SMMS-102",
                "source_system": "SMMS",
                "department": "SNT",
                "corridor_code": "NDLS-CNB",
                "line": "DN_MAIN",
                "task_type": "Digital Axle Counter (DAC) Sensor Reset & Tuning",
                "km_start": 139.2,
                "km_end": 139.8,
                "elementary_section": "ES-12C",
                "requires_power_off": False,
                "machine_required": None,
                "duration_minutes": 60,
                "safety_class": "high",
                "defect_detail": "Intermittent wheel sensor countdown pulse dropout during rain",
                "sensor_vibration_mms": 4.1,
                "insulation_mohm": 98.0,
                "days_overdue": 2,
                "codal_interval_days": 30
            },
            {
                "id": "SMMS-103",
                "source_system": "SMMS",
                "department": "SNT",
                "corridor_code": "NDLS-CNB",
                "line": "UP_MAIN",
                "task_type": "Track Circuit 104T Bonding & Choke Coil Renewal",
                "km_start": 43.0,
                "km_end": 43.5,
                "elementary_section": "ES-04A",
                "requires_power_off": False,
                "machine_required": None,
                "duration_minutes": 75,
                "safety_class": "critical",
                "defect_detail": "Ghaziabad outer track circuit drop under wet ballast conditions; relay pick-up sluggish",
                "sensor_vibration_mms": 3.9,
                "insulation_mohm": 38.0,
                "days_overdue": 5,
                "codal_interval_days": 45
            },
            {
                "id": "SMMS-104",
                "source_system": "SMMS",
                "department": "SNT",
                "corridor_code": "NDLS-CNB",
                "line": "UP_MAIN",
                "task_type": "MACL Signal 214R Aspect LED Unit & Transformer Replacement",
                "km_start": 213.1,
                "km_end": 213.5,
                "elementary_section": "ES-18A",
                "requires_power_off": False,
                "machine_required": None,
                "duration_minutes": 60,
                "safety_class": "high",
                "defect_detail": "Green aspect LED current consumption drop below 85mA threshold; current sensing alarm",
                "sensor_vibration_mms": 2.8,
                "insulation_mohm": 95.0,
                "days_overdue": 3,
                "codal_interval_days": 30
            },
            {
                "id": "SMMS-105",
                "source_system": "SMMS",
                "department": "SNT",
                "corridor_code": "NDLS-CNB",
                "line": "DN_MAIN",
                "task_type": "Electric Point Machine 202B Throw Rod & Detector Slide Adjustment",
                "km_start": 89.0,
                "km_end": 89.4,
                "elementary_section": "ES-08B",
                "requires_power_off": True,
                "machine_required": None,
                "duration_minutes": 90,
                "safety_class": "critical",
                "defect_detail": "Khurja switch point 202B obstruction test gap > 3.5mm; requires slide packing",
                "sensor_vibration_mms": 8.7,
                "insulation_mohm": 44.0,
                "days_overdue": 8,
                "codal_interval_days": 60
            },
            {
                "id": "SMMS-106",
                "source_system": "SMMS",
                "department": "SNT",
                "corridor_code": "NDLS-CNB",
                "line": "UP_MAIN",
                "task_type": "Integrated Power Supply (IPS) DC-DC Inverter Overhaul",
                "km_start": 436.2,
                "km_end": 436.8,
                "elementary_section": "ES-32D",
                "requires_power_off": False,
                "machine_required": None,
                "duration_minutes": 75,
                "safety_class": "high",
                "defect_detail": "Kanpur yard S&T power supply DC bus ripple voltage 140mV; capacitor bank check",
                "sensor_vibration_mms": 3.2,
                "insulation_mohm": 88.0,
                "days_overdue": 4,
                "codal_interval_days": 90
            },
            {
                "id": "SMMS-107",
                "source_system": "SMMS",
                "department": "SNT",
                "corridor_code": "NDLS-CNB",
                "line": "DN_MAIN",
                "task_type": "Audio Frequency Track Circuit (AFTC) Tuning Drift Correction",
                "km_start": 140.1,
                "km_end": 140.6,
                "elementary_section": "ES-12C",
                "requires_power_off": False,
                "machine_required": None,
                "duration_minutes": 60,
                "safety_class": "high",
                "defect_detail": "Aligarh east block section receiver frequency drifted by 45 Hz; filter re-alignment",
                "sensor_vibration_mms": 3.5,
                "insulation_mohm": 91.0,
                "days_overdue": 1,
                "codal_interval_days": 30
            },
            # DNR-PNBE Branch Tasks
            {
                "id": "SMMS-DNR-01",
                "source_system": "SMMS",
                "department": "SNT",
                "corridor_code": "DNR-PNBE",
                "line": "UP_MAIN",
                "task_type": "Point Machine 102A Testing & Motor Contact Replacement",
                "km_start": 4.8,
                "km_end": 5.2,
                "elementary_section": "ES-DNR-02",
                "requires_power_off": True,
                "machine_required": None,
                "duration_minutes": 75,
                "safety_class": "critical",
                "defect_detail": "Phulwari Sharif Point 102A carbon brush wear > 70%",
                "sensor_vibration_mms": 8.1,
                "insulation_mohm": 48.0,
                "days_overdue": 6,
                "codal_interval_days": 45
            },
            {
                "id": "SMMS-DNR-02",
                "source_system": "SMMS",
                "department": "SNT",
                "corridor_code": "DNR-PNBE",
                "line": "DN_MAIN",
                "task_type": "Digital Axle Counter Dual Sensor Recalibration",
                "km_start": 9.2,
                "km_end": 9.6,
                "elementary_section": "ES-PNBE-01",
                "requires_power_off": False,
                "machine_required": None,
                "duration_minutes": 60,
                "safety_class": "high",
                "defect_detail": "Patna West block section axle counter phase drift detected",
                "sensor_vibration_mms": 5.2,
                "insulation_mohm": 92.0,
                "days_overdue": 4,
                "codal_interval_days": 30
            },
            {
                "id": "SMMS-DNR-03",
                "source_system": "SMMS",
                "department": "SNT",
                "corridor_code": "DNR-PNBE",
                "line": "UP_MAIN",
                "task_type": "Track Circuit 101T Bonding & Relay Inspection",
                "km_start": 1.4,
                "km_end": 1.8,
                "elementary_section": "ES-DNR-01",
                "requires_power_off": False,
                "machine_required": None,
                "duration_minutes": 60,
                "safety_class": "medium",
                "defect_detail": "Danapur yard approach track circuit ballast resistance drop",
                "sensor_vibration_mms": 3.8,
                "insulation_mohm": 65.0,
                "days_overdue": 2,
                "codal_interval_days": 60
            }
        ]

    def _build_tdms_records(self) -> List[Dict[str, Any]]:
        # Traction Distribution Management System (TDMS) - Electrical TRD Demands
        return [
            {
                "id": "TDMS-201",
                "source_system": "TDMS",
                "department": "TRD",
                "corridor_code": "NDLS-CNB",
                "line": "UP_MAIN",
                "task_type": "OHE Contact Wire Stagger & Dropper Regulation",
                "km_start": 285.0,
                "km_end": 287.5,
                "elementary_section": "ES-24B",
                "requires_power_off": True,
                "machine_required": "Tower Wagon TW-204",
                "duration_minutes": 120,
                "safety_class": "critical",
                "defect_detail": "ACTM 2.11: Stagger exceedance +230mm at Mast 286/12, localized thermal hotspot",
                "isolator_id": "SM-14",
                "feeding_post": "FP-TDL",
                "days_overdue": 6,
                "codal_interval_days": 45
            },
            {
                "id": "TDMS-202",
                "source_system": "TDMS",
                "department": "TRD",
                "corridor_code": "NDLS-CNB",
                "line": "DN_MAIN",
                "task_type": "PTFE Neutral Section Inspection & Dropper Tightening",
                "km_start": 138.5,
                "km_end": 140.0,
                "elementary_section": "ES-12C",
                "requires_power_off": True,
                "machine_required": "Tower Wagon TW-108",
                "duration_minutes": 120,
                "safety_class": "high",
                "defect_detail": "Dropper loose at Mast 139/14; arc erosion on arcing horns",
                "isolator_id": "SM-08",
                "feeding_post": "TSS-ALJN",
                "days_overdue": 1,
                "codal_interval_days": 30
            },
            {
                "id": "TDMS-203",
                "source_system": "TDMS",
                "department": "TRD",
                "corridor_code": "NDLS-CNB",
                "line": "UP_MAIN",
                "task_type": "25kV Section Insulator Replacement & Contact Polish",
                "km_start": 42.5,
                "km_end": 44.5,
                "elementary_section": "ES-04A",
                "requires_power_off": True,
                "machine_required": "Tower Wagon TW-204",
                "duration_minutes": 90,
                "safety_class": "critical",
                "defect_detail": "Ghaziabad outer cross-catenary section insulator carbon glaze; flashover threat",
                "isolator_id": "SM-02",
                "feeding_post": "FP-GZB",
                "days_overdue": 5,
                "codal_interval_days": 45
            },
            {
                "id": "TDMS-204",
                "source_system": "TDMS",
                "department": "TRD",
                "corridor_code": "NDLS-CNB",
                "line": "UP_MAIN",
                "task_type": "OHE Cantilever Assembly Inspection & Insulator Washing",
                "km_start": 212.0,
                "km_end": 214.0,
                "elementary_section": "ES-18A",
                "requires_power_off": True,
                "machine_required": "Tower Wagon TW-108",
                "duration_minutes": 105,
                "safety_class": "high",
                "defect_detail": "Hathras sub-station feeder cantilever stay-arm deformation +14mm",
                "isolator_id": "SM-11",
                "feeding_post": "TSS-HATHRAS",
                "days_overdue": 4,
                "codal_interval_days": 60
            },
            {
                "id": "TDMS-205",
                "source_system": "TDMS",
                "department": "TRD",
                "corridor_code": "NDLS-CNB",
                "line": "DN_MAIN",
                "task_type": "25kV Motorized Isolator Blade Alignment & Contact Test",
                "km_start": 88.0,
                "km_end": 90.5,
                "elementary_section": "ES-08B",
                "requires_power_off": True,
                "machine_required": None,
                "duration_minutes": 75,
                "safety_class": "critical",
                "defect_detail": "Khurja feeding post isolator SM-05 contact resistance 420 micro-ohms (limit 200)",
                "isolator_id": "SM-05",
                "feeding_post": "FP-KHURJA",
                "days_overdue": 7,
                "codal_interval_days": 60
            },
            {
                "id": "TDMS-206",
                "source_system": "TDMS",
                "department": "TRD",
                "corridor_code": "NDLS-CNB",
                "line": "UP_MAIN",
                "task_type": "Traction Feeder Circuit Breaker Isolation & Rod Earthing",
                "km_start": 435.5,
                "km_end": 437.5,
                "elementary_section": "ES-32D",
                "requires_power_off": True,
                "machine_required": None,
                "duration_minutes": 90,
                "safety_class": "high",
                "defect_detail": "Kanpur Central feeder gantry discharge rod clamping and earth bonding re-tightening",
                "isolator_id": "SM-22",
                "feeding_post": "FP-CNB",
                "days_overdue": 3,
                "codal_interval_days": 45
            },
            {
                "id": "TDMS-207",
                "source_system": "TDMS",
                "department": "TRD",
                "corridor_code": "NDLS-CNB",
                "line": "DN_MAIN",
                "task_type": "OHE Earth Discharge Rod Testing & Return Conductor Bonding",
                "km_start": 140.0,
                "km_end": 141.5,
                "elementary_section": "ES-12C",
                "requires_power_off": True,
                "machine_required": None,
                "duration_minutes": 60,
                "safety_class": "medium",
                "defect_detail": "Aligarh outer mast 141/06 return bond copper braid corrosion > 30%",
                "isolator_id": "SM-09",
                "feeding_post": "TSS-ALJN",
                "days_overdue": 2,
                "codal_interval_days": 30
            },
            # DNR-PNBE Branch Tasks
            {
                "id": "TDMS-DNR-01",
                "source_system": "TDMS",
                "department": "TRD",
                "corridor_code": "DNR-PNBE",
                "line": "UP_MAIN",
                "task_type": "25kV OHE Cantilever Inspection & Hotspot Thermal Scan",
                "km_start": 4.6,
                "km_end": 5.6,
                "elementary_section": "ES-DNR-02",
                "requires_power_off": True,
                "machine_required": "Tower Wagon TW-108",
                "duration_minutes": 105,
                "safety_class": "critical",
                "defect_detail": "Insulator flashover trace at Mast 5/14 near Phulwari sub-station",
                "isolator_id": "SM-DNR-03",
                "feeding_post": "TSS-DNR",
                "days_overdue": 4,
                "codal_interval_days": 30
            },
            {
                "id": "TDMS-DNR-02",
                "source_system": "TDMS",
                "department": "TRD",
                "corridor_code": "DNR-PNBE",
                "line": "DN_MAIN",
                "task_type": "OHE Section Insulator Cleaning & Contact Height Verification",
                "km_start": 9.0,
                "km_end": 9.8,
                "elementary_section": "ES-PNBE-01",
                "requires_power_off": True,
                "machine_required": "Tower Wagon TW-108",
                "duration_minutes": 90,
                "safety_class": "high",
                "defect_detail": "Patna West junction section insulator carbon accumulation",
                "isolator_id": "SM-PNBE-01",
                "feeding_post": "TSS-PNBE",
                "days_overdue": 3,
                "codal_interval_days": 45
            }
        ]

    def get_all_unified_tasks(self, corridor_code: str = "NDLS-CNB") -> List[Dict[str, Any]]:
        """Returns normalized, unified multi-department defect list for the given corridor."""
        all_tasks = self.tms_records + self.smms_records + self.tdms_records
        if corridor_code:
            return [t for t in all_tasks if t.get("corridor_code") == corridor_code]
        return all_tasks

    def get_corridor_info(self, corridor_code: str = "NDLS-CNB") -> Dict[str, Any]:
        for c in self.corridors:
            if c["corridor_code"] == corridor_code:
                return c
        return self.corridors[0]

    def get_corridor_stations(self, corridor_code: str = "NDLS-CNB") -> List[Dict[str, Any]]:
        return [s for s in self.stations if s.get("corridor_code") == corridor_code]

    def get_corridor_trains(self, corridor_code: str = "NDLS-CNB") -> List[Dict[str, Any]]:
        return [t for t in self.trains if t.get("corridor_code") == corridor_code]

    def add_custom_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Dynamically injects a new real-time defect requisition from field engineers."""
        dept = task.get("department", "ENG").upper()
        task_id = f"{dept}-REQ-{int(datetime.now().timestamp() % 10000):04d}"
        task["id"] = task_id
        task["source_system"] = "TMS" if dept == "ENG" else ("SMMS" if dept == "SNT" else "TDMS")
        task["is_custom"] = True
        
        if dept == "ENG":
            self.tms_records.append(task)
        elif dept == "SNT":
            self.smms_records.append(task)
        else:
            self.tdms_records.append(task)
        return task

    def reset_to_baseline(self):
        """Resets in-memory tasks to factory state."""
        self.tms_records = self._build_tms_records()
        self.smms_records = self._build_smms_records()
        self.tdms_records = self._build_tdms_records()
