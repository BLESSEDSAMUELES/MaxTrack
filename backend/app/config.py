import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = BASE_DIR / "maxtrack.db"

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")

MIN_VIABLE_BLOCK_DURATION_MINUTES = 120  # Minimum 2 hours per block
OHE_SETUP_CLEARANCE_MINUTES = 45          # Setup, isolation, and discharge overhead
TIME_DISCRETIZATION_MINUTES = 15          # Solver slot discretization
