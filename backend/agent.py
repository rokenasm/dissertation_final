"""
agent.py — Floor plan analysis agent.

Accepts a floor plan image or PDF, sends it to a vision-capable AI service
with a structured prompt, and returns a list of detected partition walls
with estimated dimensions. The user reviews and edits these before running
the material calculator.

Currently uses the Anthropic Claude API (see CLAUDE_MODEL below); the
service can be swapped without changing the rest of the application.
"""

import os
import io
import json
import re
import base64
from pathlib import Path

import anthropic
from pdf2image import convert_from_bytes


def _load_env():
    """Load .env file from the backend directory."""
    env_file = Path(__file__).parent / ".env"
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, value = line.partition("=")
                    os.environ.setdefault(key.strip(), value.strip())


_load_env()

CLAUDE_MODEL = "claude-sonnet-4-6"

# Poppler binary path — only required on Windows where poppler isn't usually on
# PATH. On Linux / macOS pdf2image auto-detects it from PATH when POPPLER_PATH
# is None (install via `apt install poppler-utils` or `brew install poppler`).
# Windows users: either add the poppler `bin` folder to PATH, or set the
# POPPLER_PATH env var to its location.
POPPLER_PATH = os.environ.get("POPPLER_PATH") or None

ANALYSIS_PROMPT = """You are an experienced UK drylining estimator analysing a construction floor plan or elevation drawing.

Complete three steps and return ONE JSON object.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — Read the Partition Types Key / legend (if present)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UK drawings typically include a key listing each partition type numbered 01, 02, 03…
Each type is a paragraph of text describing:
  • Stud size and spacing (e.g. "70 S 50 @ 600 centres", "38 × 89 CLS @ 400")
  • Board type (Gyproc WallBoard, Moisture Resistant, FireLine, SoundBloc, DuraLine;
    Knauf Wallboard, Moisture Panel, Fire Panel, Soundshield Plus)
  • Skins / layers per side (e.g. "2 × 12.5 mm" = double skin)
  • Sides boarded (default is 2 unless only one side is specified)
  • Insulation (APR 1200, Isover, "acoustic partition roll" → insulated = true)
  • Fire rating, acoustic rating, spec reference code (e.g. A206015)

Extract every type you can see and map it to these ENUM values:
  stud_size         ∈  "48S" | "60S" | "70S" | "92S" | "146S" | "T38x63" | "T38x89"
  frame_material    ∈  "metal" | "timber"
  stud_spacing_mm   ∈  300 | 400 | 600
  board_type        ∈  "standard" | "mr" | "fireline" | "soundbloc" | "duraline"
  layers            ∈  1 | 2
  sides             ∈  1 | 2

Mapping hints:
  "WallBoard" / no specialist prefix       → "standard"
  "Moisture Resistant" / "MR" / "Moisture Panel"  → "mr"
  "FireLine" / "Fire Panel"                → "fireline"
  "SoundBloc" / "Soundshield"              → "soundbloc"
  "DuraLine" / "Impact"                    → "duraline"
  "70 S 50" or similar                     → "70S"  (strip spaces, drop trailing "50")
  CLS / timber studwork                    → frame_material = "timber"

PARSING THE SPEC SENTENCE — read it like a sandwich, boards on each side of
the studs. UK drylining keys use this exact structure:

   [BOARDS SIDE A]   +   [STUDS @ SPACING]   +   [BOARDS SIDE B]

`layers` is the multiplier immediately before the board thickness:
  "2x12.5mm Gyproc WallBoard"   → layers = 2
  "12.5mm Gyproc WallBoard"     → layers = 1
  "2x15mm Gyproc DuraLine"      → layers = 2  (15 mm board)

`sides` comes from whether the boards-text appears on BOTH sides of the studs:
  "2x12.5 WallBoard + 70 S 50 @600 + 2x12.5 WallBoard"   → sides = 2
  "12.5 SoundBloc + 70 S 50 @600"                        → sides = 1  (no + after studs)

Worked example (from a real drawing):
  "2x12.5mm Gyproc SoundBloc + Gypframe 70 S 50 'C' Studs @600 centres
   + 2x12.5mm Gyproc SoundBloc. 25mm Isover Acoustic Partition Roll (APR 1200)
   in the cavity."
     → frame_material = "metal"
     → stud_size        = "70S"
     → stud_spacing_mm  = 600
     → board_type       = "soundbloc"
     → layers           = 2    (from "2x12.5")
     → sides            = 2    (board text appears BEFORE and AFTER the studs)
     → insulated        = true (APR 1200 mentioned)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — Detect partition walls on the plan
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Only include lightweight drylining partitions. EXCLUDE structural concrete,
masonry, or blockwork walls.

For each wall, estimate length (m) and height (m). If a scale bar or dimension
lines are shown use them directly; otherwise note the assumption. Height
defaults to 2.4 m if no elevation info is shown; if the key says "SLAB TO SLAB",
use the max height quoted in the matching type entry.

Capture any door / window openings with width and height in metres.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — Map each wall to its partition type (THIS IS THE IMPORTANT STEP)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The whole point of reading the key is so every wall on the plan ends up
with the right material build-up attached. Without a good match the tool
falls back to a generic default, which is much less useful.

Signals to use, in order of reliability:
  1. A spec code printed next to or on the wall (e.g. "A206015", "A206198").
     These map DIRECTLY to a type in the key — match by code first.
  2. A numeric tag ("01", "02") next to the wall that references the key.
  3. The wall's line style and colour matching the swatch shown in the key
     (e.g. solid green dashed line = type 01 in this drawing).

For every wall you detect, pick the matching type_id. If no signal is visible
for a particular wall, set its type_id to null — do not guess.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT — return ONLY this JSON, no other text, no markdown fences
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "wall_types": [
    {
      "id": "01",
      "spec_code": "A206015",
      "frame_material": "metal",
      "stud_size": "70S",
      "stud_spacing_mm": 600,
      "board_type": "standard",
      "layers": 2,
      "sides": 2,
      "insulated": false,
      "fire_rating_min": 30,
      "acoustic_rw_db": 45
    }
  ],
  "walls": [
    {
      "label": "Corridor partition",
      "length": 6.5,
      "height": 4.2,
      "type_id": "01",
      "openings": [
        {"width": 0.9, "height": 2.1, "label": "door"}
      ]
    }
  ],
  "scale_detected": "1:100 or unknown",
  "notes": "any assumptions or caveats"
}

If the drawing has no partition-types key, return wall_types as [].
If no partition walls are detectable, return walls as [] with a note."""


def pdf_to_image_bytes(pdf_bytes: bytes) -> bytes:
    """Convert the first page of a PDF to JPEG bytes.

    Raises a clear ValueError if poppler is missing, so the frontend shows a
    helpful message instead of a raw stacktrace.
    """
    try:
        pages = convert_from_bytes(
            pdf_bytes, dpi=150, first_page=1, last_page=1, poppler_path=POPPLER_PATH
        )
    except Exception as exc:  # pdf2image.exceptions.PDFInfoNotInstalledError etc.
        raise ValueError(
            "PDF conversion requires poppler. Install poppler-utils (Linux / macOS) "
            "or set the POPPLER_PATH environment variable to your poppler `bin` "
            "directory (Windows)."
        ) from exc
    buf = io.BytesIO()
    pages[0].save(buf, format="JPEG", quality=90)
    return buf.getvalue()


def analyse_floor_plan(image_bytes: bytes, mime_type: str) -> dict:
    """
    Send a floor plan image to the vision model and extract wall dimensions.

    Args:
        image_bytes: Raw image data.
        mime_type:   MIME type e.g. "image/jpeg", "image/png", "application/pdf".

    Returns:
        Dict with keys: walls, scale_detected, notes.

    Raises:
        ValueError: If the API key is missing or the response cannot be parsed.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY not set in backend/.env")

    # Convert PDF to image before sending to the model
    if mime_type == "application/pdf":
        image_bytes = pdf_to_image_bytes(image_bytes)
        mime_type = "image/jpeg"

    image_data = base64.standard_b64encode(image_bytes).decode("utf-8")

    client = anthropic.Anthropic(api_key=api_key)

    message = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": mime_type,
                            "data": image_data,
                        },
                    },
                    {
                        "type": "text",
                        "text": ANALYSIS_PROMPT,
                    },
                ],
            }
        ],
    )

    raw = message.content[0].text.strip()

    # Strip markdown code fences if the model wraps the JSON
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    try:
        result = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Vision model returned non-JSON response: {raw[:300]}") from exc

    if "walls" not in result:
        raise ValueError(f"Unexpected response structure: {raw[:300]}")

    return result
