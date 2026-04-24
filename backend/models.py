"""
models.py — Pydantic request and response models for the Drylining Estimator API.

These mirror the dataclasses in calculator.py but use Pydantic for:
  - Automatic JSON (de)serialisation
  - Input validation with clear error messages
  - FastAPI schema / OpenAPI docs generation
"""

from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional


# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------

class OpeningModel(BaseModel):
    """A door, window, or other void in a wall."""
    width: float = Field(..., gt=0, description="Opening width in metres")
    height: float = Field(..., gt=0, description="Opening height in metres")
    label: str = Field(default="", description="Optional label, e.g. 'front door'")


class WallInputModel(BaseModel):
    """All inputs describing a single wall run."""

    length: float = Field(..., gt=0, description="Wall length in metres")
    height: float = Field(..., gt=0, description="Wall height in metres")
    openings: list[OpeningModel] = Field(
        default_factory=list,
        description="Doors, windows, or other voids",
    )

    stud_spacing_mm: int = Field(
        default=600,
        description="Stud centres in mm — 300 or 600",
    )
    sides: int = Field(
        default=1,
        description="Number of boarded sides — 1 or 2",
    )
    layers: int = Field(
        default=1,
        ge=1,
        description="Board layers per side",
    )
    insulated: bool = Field(
        default=False,
        description="Include Isover APR 1200 50mm insulation in estimate",
    )

    # Waste percentages — defaults match BG GypWall Single Frame spec allowances
    board_waste_pct: float = Field(default=10.0, ge=0, description="Board waste %")
    stud_waste_pct: float = Field(default=5.0, ge=0, description="Stud waste %")
    track_waste_pct: float = Field(default=5.0, ge=0, description="Track waste %")
    insulation_waste_pct: float = Field(default=5.0, ge=0, description="Insulation waste %")
    screw_waste_pct: float = Field(default=10.0, ge=0, description="Board screw waste %")
    framing_screw_waste_pct: float = Field(default=10.0, ge=0, description="Framing screw waste %")
    joint_tape_waste_pct: float = Field(default=10.0, ge=0, description="Joint tape waste %")
    easifill_waste_pct: float = Field(default=10.0, ge=0, description="EasiFill waste %")

    @field_validator("stud_spacing_mm")
    @classmethod
    def validate_stud_spacing(cls, v: int) -> int:
        if v not in (300, 400, 600):
            raise ValueError(f"Stud spacing must be 300, 400 or 600 mm, got {v}")
        return v

    @field_validator("sides")
    @classmethod
    def validate_sides(cls, v: int) -> int:
        if v not in (1, 2):
            raise ValueError(f"Sides must be 1 or 2, got {v}")
        return v


class EstimateRequest(BaseModel):
    """Request body for POST /estimate."""
    walls: list[WallInputModel] = Field(
        ...,
        min_length=1,
        description="One or more wall runs to estimate",
    )


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------

class WallEstimateResponse(BaseModel):
    """Material takeoff for a single wall run."""
    wall_index: int
    length_m: float
    height_m: float
    boarded_area_m2: float
    boards: int
    studs_pieces: int
    studs_linear_m: float
    track_pieces: int
    track_linear_m: float
    insulation_packs: int
    screws: int
    framing_screws: int
    joint_tape_rolls: int
    easifill_bags: int


class ProjectTotalsResponse(BaseModel):
    """Summed quantities across all wall runs."""
    boards: int
    studs_pieces: int
    studs_linear_m: float
    track_pieces: int
    track_linear_m: float
    insulation_packs: int
    screws: int
    framing_screws: int
    joint_tape_rolls: int
    easifill_bags: int


class EstimateResponse(BaseModel):
    """Response body for POST /estimate."""
    walls: list[WallEstimateResponse]
    totals: ProjectTotalsResponse
