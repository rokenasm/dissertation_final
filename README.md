# RMBuild — partition wall material estimator

A web application that prices a UK partition wall from its dimensions. Built
as a final-year dissertation project. Covers metal studwork (Gyproc /
Knauf C-Stud + I-Stud) and timber studwork (CLS C16) partitions.

---

## What it does

Type in a wall's length and height, add any door or window openings, pick a
brand, board type, and finish — and the tool returns a full material list
priced at indicative UK merchant rates. Boards, studs, track or plates,
fixings, tape, jointing, sealant, corner beads, skim plaster (when
applicable), and VAT.

Optionally, drop in a floor plan PDF or image and a vision-capable AI agent
will pre-fill the walls with detected dimensions and read the partition
types key from the drawing if one is present.

---

## Running locally

### Prerequisites
- Python 3.11+
- Node 18+
- `poppler` (for PDF uploads to the AI agent — `apt install poppler-utils` /
  `brew install poppler`; on Windows set `POPPLER_PATH` env var to the
  poppler `bin` folder)
- An Anthropic API key in `backend/.env` as `ANTHROPIC_API_KEY=...` (only
  needed if you want the AI floor-plan agent to work)

### Backend
```
pip install fastapi uvicorn pydantic anthropic pdf2image python-multipart
python -m uvicorn backend.main:app --reload --port 8001
```

### Frontend
```
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

---

## Project structure

```
backend/
  main.py         # FastAPI app + endpoints
  calculator.py   # Pure Python material calculations (BG GypWall spec)
  models.py       # Pydantic request / response schemas
  agent.py        # Floor plan analysis (vision AI agent)
  db.py           # SQLite wrapper for the contact form inbox
  .env            # ANTHROPIC_API_KEY (gitignored)

frontend/
  src/
    pages/         # Home, Estimator, About, Contact, Admin, NotFound
    components/    # Wall form, results table, agent upload, layout, etc.
    catalogue.ts   # Product catalogue (BG / Knauf / CLS timber / accessories)
    types.ts       # Shared TypeScript types
    prices.ts      # Default merchant prices
  public/          # Favicon + photos used on the About page

tests/
  test_calculator.py  # Unit tests for the calculation core
```

---

## Tests

```
pytest tests/
```

---

## Spec sources

- British Gypsum GypWall Single Frame **A206001** — boarding, stud, track
- BG Standard Detail **ST-121-Z1L2-08** — GFS1 fixing strap / deflection head
- BG White Book — waste allowances and fixing centres
- NHBC Standards **Chapter 6.2** — UK timber stud convention
- Merchant prices researched **April 2026** from Building Materials
  Nationwide, Condell, Insulation Wholesale, Trade Insulations, Materials
  Market, Insulation Superstore (indicative ex VAT)

---

## Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18, TypeScript, Vite, React Router 6 |
| Backend  | FastAPI, Pydantic v2, SQLite (stdlib) |
| AI agent | Anthropic Claude API (vision) + pdf2image + poppler |
| Fonts    | Fraunces, JetBrains Mono (SIL OFL) |

---

## Licence

Final-year dissertation project — not licensed for redistribution.
