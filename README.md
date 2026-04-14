# Drylining Estimator

A web application that calculates materials needed to dryline (stud partition / plasterboard) a room or building. Built as a dissertation project exploring AI-assisted quantity surveying for the construction industry.

---

## The Problem

Drylining (installing metal stud partitions with plasterboard) requires an accurate material takeoff before work begins. Traditionally this is done manually — a surveyor or estimator measures walls, accounts for openings, applies waste factors, and produces a list of materials. This is time-consuming and error-prone.

This tool automates that process in two ways:
1. **Manual entry** — the user inputs wall dimensions and gets an instant material list
2. **AI agent** — the user uploads a floor plan drawing and the AI reads it, extracts wall dimensions, and produces the estimate automatically

---

## Features

### Manual Estimator
- Add multiple wall runs (length × height)
- Add openings (doors, windows) per wall
- Configurable parameters:
  - Board type (standard, moisture-resistant, fire-resistant)
  - Sides boarded (1 or 2)
  - Layers per side
  - Stud spacing
  - Waste percentages per material
- Outputs per wall run and project totals:
  - Plasterboard sheets
  - Steel studs (pieces + metres)
  - Steel tracks (pieces + metres)
  - Insulation packs
  - Screws

### AI Agent (Floor Plan → Estimate)
- Upload a floor plan image or PDF
- Agent analyses the drawing using Claude's vision
- Identifies walls, measures lengths, detects openings
- Asks clarifying questions if scale or room type is unclear
- Produces a full material estimate from the drawing alone

### Persona System
- **DIY** — higher waste factors, simpler UI
- **Trade** — standard waste factors, full controls
- **Estimator** — professional defaults, detailed breakdown

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI |
| Calculator | Pure Python (no dependencies) |
| AI Agent | Claude API (claude-opus-4-6), vision + tool use |
| Frontend | React, TypeScript, Vite |
| 3D Preview | Three.js |
| Styling | Plain CSS |

---

## Project Structure

```
drylining-estimator/
├── backend/
│   ├── main.py          # FastAPI app, routes
│   ├── calculator.py    # Material calculation logic (pure functions)
│   ├── agent.py         # Claude AI agent — floor plan analysis
│   └── models.py        # Pydantic request/response models
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   └── types.ts
│   └── package.json
├── tests/
│   ├── test_calculator.py
│   └── test_agent.py
└── README.md
```

---

## Build Roadmap

The project is built in stages. Each stage is independently testable before moving on.

### Stage 1 — Calculator Core
> Pure Python. No API, no UI. Just the maths.

- [ ] `wall_areas(length, height, openings)` → gross, openings, net area
- [ ] `board_calc(net_area, ...)` → sheets needed
- [ ] `stud_calc(length, height, spacing, ...)` → lines, metres, pieces
- [ ] `track_calc(length, ...)` → metres, pieces
- [ ] `insulation_calc(net_area, ...)` → packs
- [ ] `screws_calc(...)` → total screws
- [ ] `estimate_project(inputs)` → full project result
- [ ] Unit tests for each function

### Stage 2 — REST API
> Wrap the calculator in a FastAPI backend.

- [ ] `POST /estimate` — accepts wall runs + config, returns material totals
- [ ] Input validation with Pydantic
- [ ] CORS configured for local frontend dev
- [ ] Manual test with curl or Postman

### Stage 3 — Frontend (Manual Mode)
> React UI for entering wall runs and viewing results.

- [ ] Wall run form (length, height, add/remove openings)
- [ ] Material result table (per run + totals)
- [ ] Persona selector (DIY / Trade / Estimator)
- [ ] Advanced settings panel (waste %, board type, stud spacing)
- [ ] 2D elevation preview of the wall
- [ ] 3D preview with Three.js

### Stage 4 — AI Agent
> Claude reads a floor plan and produces an estimate.

- [ ] `POST /agent/estimate` endpoint
- [ ] Accept floor plan image upload
- [ ] Agent extracts walls using Claude vision
- [ ] Agent uses `estimate_project` as a tool
- [ ] Clarification loop — agent asks if anything is unclear
- [ ] Return structured estimate result

### Stage 5 — Polish
- [ ] Export estimate to PDF / CSV
- [ ] Save and load projects
- [ ] Pricing (cost per material line item)

---

## AI Agent Design

The agent is built on the [Claude API](https://docs.anthropic.com/en/api/getting-started) using **tool use** (function calling) and **vision**.

### How it works

```
User uploads floor plan image
        ↓
Agent receives image + prompt:
"You are a drylining estimator. Analyse this floor plan.
 Identify all partition walls, their lengths and heights.
 Note any openings (doors, windows)."
        ↓
Agent calls tool: extract_walls(image) → list of wall runs
        ↓
If scale is unclear → Agent asks user for clarification
        ↓
Agent calls tool: estimate_project(wall_runs, config) → material list
        ↓
Return estimate to user
```

### Tools available to the agent

| Tool | Description |
|---|---|
| `estimate_project` | Runs the calculator with extracted wall data |
| `ask_clarification` | Pauses and asks the user a question |
| `set_scale` | Applies a known scale (e.g. 1:100) to pixel measurements |

### Key design decisions
- The calculator is a **pure function** — the agent calls it as a tool, it does not recalculate anything itself
- The agent is **stateless per request** — conversation history is sent each turn
- Clarification is handled by returning a `pending_question` in the response, not by streaming

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- An Anthropic API key (for the AI agent)

### Run the backend
```bash
cd backend
pip install fastapi uvicorn pydantic anthropic python-multipart
uvicorn main:app --reload
```

### Run the frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Background

This project is part of a dissertation investigating AI-assisted quantity surveying tools in the construction industry. The core question is whether a vision-capable language model can reliably extract dimensional data from architectural drawings and produce accurate material takeoffs without human measurement.
