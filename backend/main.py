"""
main.py — FastAPI application for the Drylining Estimator.

Endpoints:
    POST /estimate         — accepts wall runs + config, returns material totals
    POST /agent/analyse    — accepts floor plan image, returns detected walls
    POST /api/contact      — accepts contact form submissions (stores in SQLite)
    POST /api/admin/login  — password gate for /admin
    GET  /api/admin/contacts   — list all contact submissions
    POST /api/admin/contacts/{id}/read    — mark as read
    POST /api/admin/contacts/{id}/replied — mark as replied
    DELETE /api/admin/contacts/{id}       — delete a submission

Run:
    uvicorn backend.main:app --reload --port 8001
"""

import os
import secrets
from typing import Any

import re

from fastapi import Depends, FastAPI, Header, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from backend.calculator import (
    Opening,
    WallInput,
    estimate_project,
)
from backend.models import EstimateRequest, EstimateResponse
from backend.agent import analyse_floor_plan
from backend import db


app = FastAPI(
    title="Drylining Estimator API",
    description=(
        "Material takeoff calculator for British Gypsum GypWall Single Frame "
        "partitions (spec A206001). Returns quantities for boards, studs, track, "
        "insulation, screws, joint tape, and EasiFill per wall run and as project totals."
    ),
    version="0.2.0",
)

# CORS — allow the local Vite dev server (port 5173) during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    db.init_db()


# ---------------------------------------------------------------------------
# Admin auth — password + ephemeral token
# ---------------------------------------------------------------------------

# Password is read from env. Default is only used in dev; change in production.
ADMIN_PASSWORD = os.environ.get("RMBUILD_ADMIN_PASSWORD", "rmbuild-2026")

# In-memory token store. Restart = all tokens invalidated, which is fine for a
# single-user admin page.
_ADMIN_TOKENS: set[str] = set()


def _require_admin(authorization: str | None = Header(default=None)) -> None:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization[7:].strip()
    if token not in _ADMIN_TOKENS:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


class LoginRequest(BaseModel):
    password: str


class LoginResponse(BaseModel):
    token: str


# ---------------------------------------------------------------------------
# Contact form schemas
# ---------------------------------------------------------------------------

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class ContactRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=200)
    message: str = Field(min_length=1, max_length=4000)

    @field_validator("email")
    @classmethod
    def _validate_email(cls, v: str) -> str:
        v = v.strip()
        if not _EMAIL_RE.match(v):
            raise ValueError("Invalid email address")
        return v


class ContactResponse(BaseModel):
    id: int
    ok: bool = True


# ---------------------------------------------------------------------------
# Routes — existing
# ---------------------------------------------------------------------------

@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/agent/analyse")
async def agent_analyse(file: UploadFile = File(...)):
    allowed = {"image/jpeg", "image/png", "image/webp", "application/pdf"}
    mime = file.content_type or "image/jpeg"
    if mime not in allowed:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{mime}'. Upload a JPEG, PNG, or PDF.",
        )
    image_bytes = await file.read()
    try:
        result = analyse_floor_plan(image_bytes, mime)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return result


@app.post("/estimate", response_model=EstimateResponse)
def estimate(request: EstimateRequest) -> EstimateResponse:
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

    try:
        result = estimate_project(walls)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

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


# ---------------------------------------------------------------------------
# Routes — contact form (public)
# ---------------------------------------------------------------------------

@app.post("/api/contact", response_model=ContactResponse)
def contact_submit(payload: ContactRequest) -> ContactResponse:
    """Accept a contact form submission and store it in SQLite."""
    new_id = db.insert_contact(payload.name, payload.email, payload.message)
    return ContactResponse(id=new_id, ok=True)


# ---------------------------------------------------------------------------
# Routes — admin (password + token gated)
# ---------------------------------------------------------------------------

@app.post("/api/admin/login", response_model=LoginResponse)
def admin_login(payload: LoginRequest) -> LoginResponse:
    if payload.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Incorrect password")
    token = secrets.token_urlsafe(32)
    _ADMIN_TOKENS.add(token)
    return LoginResponse(token=token)


@app.get("/api/admin/contacts")
def admin_list_contacts(_auth: None = Depends(_require_admin)) -> dict[str, Any]:
    return {
        "contacts": db.list_contacts(),
        "unread": db.count_unread(),
    }


@app.post("/api/admin/contacts/{contact_id}/read")
def admin_mark_read(contact_id: int, _auth: None = Depends(_require_admin)) -> dict[str, bool]:
    db.set_read(contact_id, True)
    return {"ok": True}


@app.post("/api/admin/contacts/{contact_id}/replied")
def admin_mark_replied(contact_id: int, _auth: None = Depends(_require_admin)) -> dict[str, bool]:
    db.set_replied(contact_id, True)
    return {"ok": True}


@app.delete("/api/admin/contacts/{contact_id}")
def admin_delete(contact_id: int, _auth: None = Depends(_require_admin)) -> dict[str, bool]:
    db.delete_contact(contact_id)
    return {"ok": True}
