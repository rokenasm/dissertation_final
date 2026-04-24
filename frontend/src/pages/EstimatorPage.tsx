import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Persona, WallFormData, EstimateResponse, MaterialPrices, DetectedWall,
  DetectedWallType, AgentAnalysisResult, ProjectSpec,
} from "../types";
import type {
  BoardType, MetalStudSize, TimberStudSize, ScrewLength, StudSize,
  Brand, TapeType, JointingProduct, FrameMaterial, Finish,
} from "../catalogue";
import {
  BOARDS, TAPES, JOINTING, TAPE_ORDER, JOINTING_ORDER,
  STUDS, BOARD_ORDER,
} from "../catalogue";
import { PERSONA_DEFAULTS } from "../personas";
import { DEFAULT_PRICES } from "../prices";
import { fetchEstimate, analyseFloorPlan } from "../api";
import { usePageTitle } from "../hooks/usePageTitle";
import PersonaToggle from "../components/PersonaToggle";
import WallCard from "../components/WallCard";
import ResultsTable from "../components/ResultsTable";
import AgentUpload from "../components/AgentUpload";
import MaterialsCatalogue from "../components/MaterialsCatalogue";

const DEFAULT_SPEC: ProjectSpec = {
  brand: "bg",
  tape_type: "paper",
  jointing_product: "easifill",
};

function newWall(persona: Persona): WallFormData {
  return { ...PERSONA_DEFAULTS[persona], length: "", height: "" };
}

// Clamp an arbitrary Claude string to one of our known StudSize enum values.
function coerceStudSize(raw: string | undefined): StudSize | null {
  if (!raw) return null;
  const s = raw.trim().toUpperCase();
  if (s in STUDS) return s as StudSize;
  // Tolerate "T38X63" vs "T38x63"
  const mixed = s.replace("X", "x");
  if (mixed in STUDS) return mixed as StudSize;
  return null;
}

function coerceBoardType(raw: string | undefined): BoardType | null {
  if (!raw) return null;
  const b = raw.trim().toLowerCase();
  if (BOARD_ORDER.includes(b as BoardType)) return b as BoardType;
  return null;
}

function coerceSpacing(raw: number | undefined): 300 | 400 | 600 | null {
  if (raw === 300 || raw === 400 || raw === 600) return raw;
  return null;
}

function coerceOneOrTwo(raw: number | undefined): 1 | 2 | null {
  if (raw === 1 || raw === 2) return raw;
  return null;
}

function detectedToWallForm(
  detected: DetectedWall,
  persona: Persona,
  typesById: Map<string, DetectedWallType>,
): WallFormData {
  const base = { ...PERSONA_DEFAULTS[persona] };
  const type = detected.type_id ? typesById.get(detected.type_id) : undefined;

  if (type) {
    const studSize = coerceStudSize(type.stud_size);
    if (studSize) base.stud_size = studSize;
    if (type.frame_material === "metal" || type.frame_material === "timber") {
      base.frame_material = type.frame_material as FrameMaterial;
    }
    const spacing = coerceSpacing(type.stud_spacing_mm);
    if (spacing) base.stud_spacing_mm = spacing;
    const board = coerceBoardType(type.board_type);
    if (board) base.board_type = board;
    const layers = coerceOneOrTwo(type.layers);
    if (layers) base.layers = layers;
    const sides = coerceOneOrTwo(type.sides);
    if (sides) base.sides = sides;
    if (typeof type.insulated === "boolean") base.insulated = type.insulated;
  }

  // Bake a sensible label if none was given: prefer detected label, then type code.
  const labelBits = [detected.label, type?.spec_code ? `(${type.spec_code})` : ""]
    .filter(Boolean)
    .join(" ");

  return {
    ...base,
    label: labelBits,
    length: String(detected.length),
    height: String(detected.height),
    openings: detected.openings.map((o) => ({ width: o.width, height: o.height })),
  };
}

interface Readiness {
  ready: boolean;
  waiting: number[];
}

function checkReadiness(walls: WallFormData[]): Readiness {
  const waiting: number[] = [];
  for (let i = 0; i < walls.length; i++) {
    const w = walls[i];
    const len = parseFloat(w.length);
    const ht = parseFloat(w.height);
    if (!w.length || isNaN(len) || len <= 0) { waiting.push(i + 1); continue; }
    if (!w.height || isNaN(ht) || ht <= 0) { waiting.push(i + 1); continue; }
    let badOpening = false;
    for (const o of w.openings) {
      if (o.width >= len || o.height >= ht) { badOpening = true; break; }
    }
    if (badOpening) waiting.push(i + 1);
  }
  return { ready: waiting.length === 0 && walls.length > 0, waiting };
}

export default function EstimatorPage() {
  usePageTitle("Estimator");
  const [persona, setPersona] = useState<Persona>("trade");
  const [walls, setWalls] = useState<WallFormData[]>([newWall("trade")]);
  const [prices, setPrices] = useState<MaterialPrices>(DEFAULT_PRICES);
  const [spec, setSpec] = useState<ProjectSpec>(DEFAULT_SPEC);
  const [result, setResult] = useState<EstimateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  const [agentFile, setAgentFile] = useState<File | null>(null);
  const [agentPreview, setAgentPreview] = useState<string | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentResult, setAgentResult] = useState<AgentAnalysisResult | null>(null);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState(false);
  const hasSaved = !!localStorage.getItem("drylining_estimate");

  const readiness = checkReadiness(walls);

  const debounceRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);

  const runEstimate = useCallback(async (currentWalls: WallFormData[]) => {
    const reqId = ++requestIdRef.current;
    setCalcLoading(true);
    setError(null);
    try {
      const data = await fetchEstimate(currentWalls);
      if (reqId !== requestIdRef.current) return;
      setResult(data);
    } catch (err) {
      if (reqId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "Couldn't calculate takeoff");
    } finally {
      if (reqId === requestIdRef.current) setCalcLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!readiness.ready) {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      requestIdRef.current++;
      setResult(null);
      setCalcLoading(false);
      setError(null);
      return;
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      runEstimate(walls);
    }, 400);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walls]);

  function handlePersonaChange(p: Persona) {
    setPersona(p);
    setWalls((prev) =>
      prev.map((w) => ({ ...PERSONA_DEFAULTS[p], length: w.length, height: w.height }))
    );
  }

  function updateWall(index: number, data: WallFormData) {
    setWalls((prev) => prev.map((w, i) => (i === index ? data : w)));
  }

  function addWall() {
    setWalls((prev) => [...prev, newWall(persona)]);
  }

  function removeWall(index: number) {
    setWalls((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Price mutations
  function handleMetalStudPriceChange(size: MetalStudSize, kind: "piece" | "track", value: number) {
    setPrices((prev) => ({
      ...prev,
      metal_studs: {
        ...prev.metal_studs,
        [size]: { ...prev.metal_studs[size], [kind]: value },
      },
    }));
  }

  function handleTimberStudPriceChange(size: TimberStudSize, value: number) {
    setPrices((prev) => ({
      ...prev,
      timber_studs: { ...prev.timber_studs, [size]: value },
    }));
  }

  function handleBoardPriceChange(type: BoardType, brand: Brand, value: number) {
    setPrices((prev) => ({
      ...prev,
      boards: { ...prev.boards, [type]: { ...prev.boards[type], [brand]: value } },
    }));
  }

  function handleScrewPriceChange(len: ScrewLength, value: number) {
    setPrices((prev) => ({
      ...prev,
      screws: { ...prev.screws, [len]: value },
    }));
  }

  function handleTapePriceChange(value: number) {
    setPrices((prev) => ({
      ...prev,
      tape: { ...prev.tape, [spec.tape_type]: value },
    }));
  }

  function handleJointingPriceChange(value: number) {
    setPrices((prev) => ({
      ...prev,
      jointing: { ...prev.jointing, [spec.jointing_product]: value },
    }));
  }

  function handleInsulationPriceChange(value: number) {
    setPrices((prev) => ({ ...prev, insulation_per_pack: value }));
  }

  function handleFramingScrewPriceChange(value: number) {
    setPrices((prev) => ({ ...prev, framing_screws_per_100: value }));
  }

  function handleCornerBeadPriceChange(value: number) {
    setPrices((prev) => ({ ...prev, corner_bead_per_length: value }));
  }

  function handleAcousticSealantPriceChange(value: number) {
    setPrices((prev) => ({ ...prev, acoustic_sealant_per_cartridge: value }));
  }

  function handlePerimeterFixingsPriceChange(value: number) {
    setPrices((prev) => ({ ...prev, perimeter_fixings_per_100: value }));
  }

  function handleSkimPlasterPriceChange(value: number) {
    setPrices((prev) => ({ ...prev, skim_plaster_per_bag: value }));
  }

  function handleDrywallSealerPriceChange(value: number) {
    setPrices((prev) => ({ ...prev, drywall_sealer_per_can: value }));
  }

  function handleResetPrices() {
    if (!confirm("Reset every unit price back to its catalogue default?")) return;
    setPrices(DEFAULT_PRICES);
  }

  function clearAll() {
    if (!confirm("Clear all walls and start over?")) return;
    setWalls([newWall(persona)]);
    setResult(null);
    setError(null);
  }

  function saveEstimate() {
    localStorage.setItem("drylining_estimate", JSON.stringify({ walls, prices, spec }));
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  }

  function loadEstimate() {
    const raw = localStorage.getItem("drylining_estimate");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      const defaults = PERSONA_DEFAULTS[persona];
      const savedWalls: WallFormData[] = (parsed.walls ?? []).map((w: Partial<WallFormData>) => ({
        ...defaults,
        ...w,
      }));
      // Deep-merge saved prices onto current defaults so old schemas still load.
      const savedPrices: MaterialPrices = {
        ...DEFAULT_PRICES,
        ...(parsed.prices ?? {}),
        metal_studs: { ...DEFAULT_PRICES.metal_studs, ...((parsed.prices ?? {}).metal_studs ?? {}) },
        timber_studs: { ...DEFAULT_PRICES.timber_studs, ...((parsed.prices ?? {}).timber_studs ?? {}) },
        boards: { ...DEFAULT_PRICES.boards, ...((parsed.prices ?? {}).boards ?? {}) },
        screws: { ...DEFAULT_PRICES.screws, ...((parsed.prices ?? {}).screws ?? {}) },
        tape: { ...DEFAULT_PRICES.tape, ...((parsed.prices ?? {}).tape ?? {}) },
        jointing: { ...DEFAULT_PRICES.jointing, ...((parsed.prices ?? {}).jointing ?? {}) },
      };
      const savedSpec: ProjectSpec = { ...DEFAULT_SPEC, ...(parsed.spec ?? {}) };
      setWalls(savedWalls.length ? savedWalls : [newWall(persona)]);
      setPrices(savedPrices);
      setSpec(savedSpec);
      setError(null);
    } catch { /* ignore corrupt data */ }
  }

  function handleAgentFileChange(file: File, preview: string) {
    setAgentFile(file);
    setAgentPreview(preview);
    setAgentResult(null);
    setAgentError(null);
  }

  async function handleAgentAnalyse() {
    if (!agentFile) return;
    setAgentError(null);
    setAgentResult(null);
    setAgentLoading(true);
    try {
      const data = await analyseFloorPlan(agentFile);
      setAgentResult(data);
    } catch (err) {
      setAgentError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAgentLoading(false);
    }
  }

  function handleWallsDetected(detected: DetectedWall[], wallTypes?: DetectedWallType[]) {
    const typesById = new Map<string, DetectedWallType>();
    (wallTypes ?? []).forEach((t) => typesById.set(t.id, t));
    setWalls(detected.map((d) => detectedToWallForm(d, persona, typesById)));
    setError(null);
    setTimeout(() => {
      document.getElementById("takeoff-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

  return (
    <section className="section estimator">
      <div className="estimator-header">
        <div className="estimator-header-left">
          <span className="sheet-label">Estimator</span>
          <h2 className="estimator-title">Partition wall takeoff</h2>
          <p className="estimator-sub">
            Measure walls, or drop in a drawing and let the assistant read it.
            Covers metal studwork (Gypframe / Knauf) and timber (CLS) partitions.
            Live updates — no button press.
          </p>
        </div>
        <div className="estimator-header-right">
          <span className="sheet-label">Spec</span>
          <span className="sheet-meta">Metal A206001 · Timber NHBC 6.4 · UK merchant rates</span>
        </div>
      </div>

      {/* Two-column workspace: walls + takeoff on the left, drawing on the right. */}
      <div className="estimator-layout has-rail">
      <div className="estimator-main">

      {/* Walls */}
      <div id="walls-section" className="walls-section">
        <div className="walls-section-head">
          <div className="assist-head-text">
            <h3>Walls</h3>
            <p>Each row is one partition run. Length and height in metres. Openings deduct from the boarded area.</p>
          </div>
        </div>

        <details className="spec-bar">
          <summary className="spec-bar-summary">
            <span className="sheet-label">Project spec</span>
            <span className="spec-bar-summary-value">
              {spec.brand === "bg" ? "Gyproc" : "Knauf"} · {TAPES[spec.tape_type].bg_name.split(" ")[0]} tape · {JOINTING[spec.jointing_product].name.split(" ").slice(-1)[0]}
            </span>
            <span className="spec-bar-hint">Click to change — applies to all walls</span>
            <span className="assist-chevron" aria-hidden>▾</span>
          </summary>
          <div className="spec-bar-grid">
            <label className="spec-bar-field">
              <span>Brand</span>
              <select
                value={spec.brand}
                onChange={(e) => setSpec({ ...spec, brand: e.target.value as Brand })}
              >
                <option value="bg">Gyproc / Gypframe (British Gypsum)</option>
                <option value="knauf">Knauf</option>
              </select>
            </label>
            <label className="spec-bar-field">
              <span>Tape</span>
              <select
                value={spec.tape_type}
                onChange={(e) => setSpec({ ...spec, tape_type: e.target.value as TapeType })}
              >
                {TAPE_ORDER.map((t) => (
                  <option key={t} value={t}>
                    {TAPES[t].bg_name.split(" —")[0]} — {TAPES[t].tagline}
                  </option>
                ))}
              </select>
            </label>
            <label className="spec-bar-field">
              <span>Jointing</span>
              <select
                value={spec.jointing_product}
                onChange={(e) => setSpec({ ...spec, jointing_product: e.target.value as JointingProduct })}
              >
                {JOINTING_ORDER.map((j) => (
                  <option key={j} value={j}>
                    {JOINTING[j].name} — {JOINTING[j].tagline}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </details>

        <div className="manual-controls">
          <PersonaToggle value={persona} onChange={handlePersonaChange} />
        </div>

        <div className="walls-list">
          {walls.map((wall, i) => (
            <WallCard
              key={i}
              index={i}
              total={walls.length}
              data={wall}
              onChange={(data) => updateWall(i, data)}
              onRemove={() => removeWall(i)}
            />
          ))}
        </div>

        <div className="form-actions">
          <button type="button" className="add-wall-btn" onClick={addWall}>
            + Add wall
          </button>
          <button type="button" className="save-btn" onClick={saveEstimate}>
            {savedMsg ? "Saved" : "Save"}
          </button>
          {hasSaved && (
            <button type="button" className="load-btn" onClick={loadEstimate}>
              Restore saved
            </button>
          )}
          <button type="button" className="clear-btn" onClick={clearAll}>
            Clear all
          </button>
        </div>

        {!readiness.ready && walls.length > 0 && (
          <p className="readiness-hint">
            Takeoff waiting on{" "}
            {readiness.waiting.length === 1
              ? `Wall ${readiness.waiting[0]}`
              : `walls ${readiness.waiting.join(", ")}`}{" "}
            — enter length and height to see materials.
          </p>
        )}
      </div>

      {error && <p className="error-msg">{error}</p>}

      {/* Takeoff */}
      <div id="takeoff-section" className="results-section">
        <div className="walls-section-head">
          <div className="assist-head-text">
            <h3>
              Takeoff
              {calcLoading && <span className="takeoff-updating">Updating</span>}
              {result && !calcLoading && <span className="takeoff-live">Live</span>}
            </h3>
            <p>Materials priced at UK trade rates. Edit any unit price inline — totals update immediately.</p>
          </div>
        </div>

        {result ? (
          <ResultsTable
            walls={result.walls}
            formWalls={walls}
            prices={prices}
            spec={spec}
            onMetalStudPriceChange={handleMetalStudPriceChange}
            onTimberStudPriceChange={handleTimberStudPriceChange}
            onBoardPriceChange={handleBoardPriceChange}
            onScrewPriceChange={handleScrewPriceChange}
            onTapePriceChange={handleTapePriceChange}
            onJointingPriceChange={handleJointingPriceChange}
            onInsulationPriceChange={handleInsulationPriceChange}
            onFramingScrewPriceChange={handleFramingScrewPriceChange}
            onCornerBeadPriceChange={handleCornerBeadPriceChange}
            onAcousticSealantPriceChange={handleAcousticSealantPriceChange}
            onPerimeterFixingsPriceChange={handlePerimeterFixingsPriceChange}
            onSkimPlasterPriceChange={handleSkimPlasterPriceChange}
            onDrywallSealerPriceChange={handleDrywallSealerPriceChange}
            onResetPrices={handleResetPrices}
          />
        ) : (
          <div className="takeoff-empty">
            <p className="takeoff-empty-headline">No takeoff yet.</p>
            <p className="takeoff-empty-sub">
              {walls.length === 0
                ? "Add a wall to get started."
                : "Fill in each wall's length and height — the takeoff will appear here."}
            </p>
          </div>
        )}
      </div>

      {/* Catalogue reference (full width, inside main column) */}
      <MaterialsCatalogue prices={prices} />
      </div>

      {/* Right rail — drawing upload + preview + detected walls */}
      <aside className="estimator-rail">
        <div className="rail-head">
          <span className="sheet-label">Drawing</span>
          <span className="rail-hint">
            {agentFile?.name ?? "drop a floor plan — optional"}
          </span>
        </div>
        <AgentUpload
          file={agentFile}
          preview={agentPreview}
          loading={agentLoading}
          result={agentResult}
          error={agentError}
          onFileChange={handleAgentFileChange}
          onAnalyse={handleAgentAnalyse}
          onWallsDetected={handleWallsDetected}
        />
      </aside>
      </div>
    </section>
  );
}
