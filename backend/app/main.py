from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.models.entities import init_db
from backend.app.data.seed_data import seed_database
from backend.app.api.routes_tasks import router as tasks_router
from backend.app.api.routes_plans import router as plans_router
from backend.app.api.routes_simulator import router as simulator_router

app = FastAPI(
    title="MaxTrack API",
    description="AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations (SIH 2026 PS 26027)",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks_router)
app.include_router(plans_router)
app.include_router(simulator_router)

@app.on_event("startup")
def on_startup():
    print("Initializing MaxTrack Database...")
    init_db()
    seed_database()
    print("MaxTrack backend initialized and ready.")

@app.get("/")
def root():
    return {
        "system": "MaxTrack",
        "description": "Automatic Railway Block Planning & Multi-Department Bundling Engine",
        "sih_problem_statement": "26027",
        "status": "online",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
