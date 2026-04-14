"""
main.py — FastAPI application for the Drylining Estimator (Stage 2).

Endpoints:
    POST /estimate   — accepts wall runs + config, returns material totals

Run:
    uvicorn backend.main:app --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.calculator import (
    Opening,
    WallInput,
    estimate_project,
)
from backend.models import EstimateRequest, EstimateResponse


app = FastAPI(
    title="Drylining Estimator API",
    description=(
        "Material takeoff calculator for British Gypsum GypWall Single Frame "
        "partitions (spec A206001). Returns quantities for boards, studs, track, "
        "insulation, screws, joint tape, and EasiFill per wall run and as project totals."
    ),
    version="0.1.0",
)

# CORS — allow the local Vite dev server (port 5173) during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
def health_check():
    """Simple liveness check."""
    return {"status": "ok"}


@app.post("/estimate", response_model=EstimateResponse)
def estimate(request: EstimateRequest) -> EstimateResponse:
    """
    Calculate material quantities for one or more wall runs.

    Accepts a list of wall definitions (dimensions, openings, configuration)
    and returns per-wall breakdowns and project totals following
    British Gypsum GypWall Single Frame specification A206001.
    """
    # Convert Pydantic models → calculator dataclasses
    walls = []
    for w in request.walls:
        openings = [
            Opening(width=o.width, height=o.height, label=o.label)
            for o in w.openings
        ]
        walls.append(
            WallInput(
                length=w.length,
                height=w.height,
                openings=openings,
                stud_spacing_mm=w.stud_spacing_mm,
                sides=w.sides,
                layers=w.layers,
                insulated=w.insulated,
                board_waste_pct=w.board_waste_pct,
                stud_waste_pct=w.stud_waste_pct,
                track_waste_pct=w.track_waste_pct,
                insulation_waste_pct=w.insulation_waste_pct,
                screw_waste_pct=w.screw_waste_pct,
                framing_screw_waste_pct=w.framing_screw_waste_pct,
                joint_tape_waste_pct=w.joint_tape_waste_pct,
                easifill_waste_pct=w.easifill_waste_pct,
            )
        )

    # Run the calculator
    try:
        result = estimate_project(walls)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    # Convert calculator dataclasses → Pydantic response models
    return EstimateResponse(
        walls=[
            {
                "wall_index": we.wall_index,
                "length_m": we.length_m,
                "height_m": we.height_m,
                "boarded_area_m2": we.boarded_area_m2,
                "boards": we.boards,
                "studs_pieces": we.studs_pieces,
                "studs_linear_m": we.studs_linear_m,
                "track_pieces": we.track_pieces,
                "track_linear_m": we.track_linear_m,
                "insulation_packs": we.insulation_packs,
                "screws": we.screws,
                "framing_screws": we.framing_screws,
                "joint_tape_rolls": we.joint_tape_rolls,
                "easifill_bags": we.easifill_bags,
            }
            for we in result.walls
        ],
        totals={
            "boards": result.totals.boards,
            "studs_pieces": result.totals.studs_pieces,
            "studs_linear_m": result.totals.studs_linear_m,
            "track_pieces": result.totals.track_pieces,
            "track_linear_m": result.totals.track_linear_m,
            "insulation_packs": result.totals.insulation_packs,
            "screws": result.totals.screws,
            "framing_screws": result.totals.framing_screws,
            "joint_tape_rolls": result.totals.joint_tape_rolls,
            "easifill_bags": result.totals.easifill_bags,
        },
    )
