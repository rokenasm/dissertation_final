"""
agent.py — AI floor plan analysis agent using Google Gemini vision.

Accepts a floor plan image, sends it to Gemini with a structured prompt,
and returns a list of detected walls with estimated dimensions.
The user can review and edit these before running the material calculator.
"""

import os
import io
import json
import re
from pathlib import Path
from google import genai
from google.genai import types
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

GEMINI_MODEL = "gemini-2.0-flash"

# Poppler binary path — required on Windows for PDF conversion
POPPLER_PATH = r"C:\Users\roken\Downloads\Release-25.12.0-0\poppler-25.12.0\Library\bin"

ANALYSIS_PROMPT = """
You are an experienced drylining estimator analysing a construction floor plan or elevation drawing.

Your task is to identify all partition walls suitable for drylining (metal stud and plasterboard).
Do NOT include structural concrete or masonry walls — only lightweight partition walls.

For each wall, estimate:
1. Length in metres (use any scale bar, dimension annotations, or room size labels shown)
2. Height in metres (use elevation drawings or notes; assume 2.4m if not shown)
3. Any openings such as doors or windows — their width and height in metres

Instructions:
- Look for a scale bar or scale notation (e.g. 1:50, 1:100) and use it to convert dimensions
- If dimension lines are shown on the drawing, use those values directly
- If no scale is visible, make a reasonable assumption based on typical room sizes and note it
- Label each wall clearly (e.g. "North wall — Office 1", "Corridor partition")

Return ONLY a valid JSON object in this exact format, with no other text before or after:

{
  "walls": [
    {
      "label": "brief description of the wall",
      "length": 4.5,
      "height": 2.4,
      "openings": [
        {"width": 0.9, "height": 2.1, "label": "door"}
      ]
    }
  ],
  "scale_detected": "1:100 or unknown",
  "notes": "any assumptions made or important observations"
}

If no partition walls are detectable, return:
{"walls": [], "scale_detected": "unknown", "notes": "reason why no walls were detected"}
"""


def pdf_to_image_bytes(pdf_bytes: bytes) -> bytes:
    """Convert the first page of a PDF to JPEG bytes."""
    pages = convert_from_bytes(pdf_bytes, dpi=150, first_page=1, last_page=1, poppler_path=POPPLER_PATH)
    buf = io.BytesIO()
    pages[0].save(buf, format="JPEG", quality=90)
    return buf.getvalue()


def analyse_floor_plan(image_bytes: bytes, mime_type: str) -> dict:
    """
    Send a floor plan image to Gemini and extract wall dimensions.

    Args:
        image_bytes: Raw image data.
        mime_type:   MIME type e.g. "image/jpeg", "image/png", "image/pdf".

    Returns:
        Dict with keys: walls, scale_detected, notes.

    Raises:
        ValueError: If the API key is missing or the response cannot be parsed.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set in backend/.env")

    # Convert PDF to image before sending to Gemini
    if mime_type == "application/pdf":
        image_bytes = pdf_to_image_bytes(image_bytes)
        mime_type = "image/jpeg"

    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            ANALYSIS_PROMPT,
        ],
    )

    raw = response.text.strip()

    # Strip markdown code fences if Gemini wraps the JSON
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    try:
        result = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Gemini returned non-JSON response: {raw[:300]}") from exc

    if "walls" not in result:
        raise ValueError(f"Unexpected response structure: {raw[:300]}")

    return result
