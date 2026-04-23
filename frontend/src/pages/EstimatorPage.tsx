import { useCallback, useEffect, useRef, useState } from "react";
import type { Persona, WallFormData, EstimateResponse, MaterialPrices, DetectedWall, AgentAnalysisResult, SharedPriceKey } from "../types";
import type { StudSize, BoardType } from "../catalogue";
import { PERSONA_DEFAULTS } from "../personas";
import { DEFAULT_PRICES } from "../prices";
import { fetchEstimate, analyseFloorPlan } from "../api";
import PersonaToggle from "../components/PersonaToggle";
import WallCard from "../components/WallCard";
import ResultsTable from "../components/ResultsTable";
import AgentUpload from "../components/AgentUpload";

function newWall(persona: Persona): WallFormData {
  return { ...PERSONA_DEFAULTS[persona], length: "", height: "" };
}

function detectedToWallForm(detected: DetectedWall, persona: Persona): WallFormData {
  return {
    ...PERSONA_DEFAULTS[persona],
    label: detected.label,
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
  const [persona, setPersona] = useState<Persona>("trade");
  const [walls, setWalls] = useState<WallFormData[]>([newWall("trade")]);
  const [prices, setPrices] = useState<MaterialPrices>(DEFAULT_PRICES);
  const [result, setResult] = useState<EstimateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  const [assistOpen, setAssistOpen] = useState(true);
  const [agentFile, setAgentFile] = useState<File | null>(null);
  const [agentPreview, setAgentPreview] = useState<string | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentResult, setAgentResult] = useState<AgentAnalysisResult | null>(null);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState(false);
  const hasSaved = !!localStorage.getItem("drylining_estimate");

  const readiness = checkReadiness(walls);

  // ── Auto-calc: whenever walls become valid, fetch the estimate (debounced).
  //    Stale requests are discarded via the request id ref.
  const debounceRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);

  const runEstimate = useCallback(async (currentWalls: WallFormData[]) => {
    const reqId = ++requestIdRef.current;
    setCalcLoading(true);
    setError(null);
    try {
      const data = await fetchEstimate(currentWalls);
      if (reqId !== requestIdRef.current) return; // stale, ignore
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
      // Walls incomplete — clear stale result, don't call server
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      requestIdRef.current++; // invalidate any in-flight
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

  function handleStudPriceChange(size: StudSize, kind: "piece" | "track", value: number) {
    setPrices((prev) => ({
      ...prev,
      studs: {
        ...prev.studs,
        [size]: { ...prev.studs[size], [kind]: value },
      },
    }));
  }

  function handleBoardPriceChange(type: BoardType, value: number) {
    setPrices((prev) => ({
      ...prev,
      boards: { ...prev.boards, [type]: value },
    }));
  }

  function handleOtherPriceChange(key: SharedPriceKey, value: number) {
    setPrices((prev) => ({ ...prev, [key]: value }));
  }

  function clearAll() {
    if (!confirm("Clear all walls and start over?")) return;
    setWalls([newWall(persona)]);
    setResult(null);
    setError(null);
  }

  function saveEstimate() {
    localStorage.setItem("drylining_estimate", JSON.stringify({ walls, prices }));
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  }

  function loadEstimate() {
    const raw = localStorage.getItem("drylining_estimate");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      const defaults = PERSONA_DEFAULTS[persona];
      // Merge saved walls onto current defaults so saves from an older schema
      // still load (missing fields pick up current catalogue defaults).
      const savedWalls: WallFormData[] = (parsed.walls ?? []).map((w: Partial<WallFormData>) => ({
        ...defaults,
        ...w,
      }));
      const savedPrices: MaterialPrices = { ...DEFAULT_PRICES, ...(parsed.prices ?? {}) };
      if (savedPrices.studs) savedPrices.studs = { ...DEFAULT_PRICES.studs, ...savedPrices.studs };
      if (savedPrices.boards) savedPrices.boards = { ...DEFAULT_PRICES.boards, ...savedPrices.boards };
      setWalls(savedWalls.length ? savedWalls : [newWall(persona)]);
      setPrices(savedPrices);
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

  function handleWallsDetected(detected: DetectedWall[]) {
    setWalls(detected.map((d) => detectedToWallForm(d, persona)));
    setError(null);
    setAssistOpen(false);
    setTimeout(() => {
      document.getElementById("takeoff-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

  return (
    <section className="section estimator">
      {/* Sheet-style header */}
      <div className="estimator-header">
        <div className="estimator-header-left">
          <span className="sheet-label">Estimator</span>
          <h2 className="estimator-title">GypWall Single Frame takeoff</h2>
          <p className="estimator-sub">
            Measure walls, or drop in a drawing and let the assistant read it.
            The takeoff updates live — no need to hit a button.
          </p>
        </div>
        <div className="estimator-header-right">
          <span className="sheet-label">Spec</span>
          <span className="sheet-meta">A206001 · UK trade rates</span>
        </div>
      </div>

      {/* 01 — Assistant */}
      <details className="assist-panel" open={assistOpen} onToggle={(e) => setAssistOpen((e.target as HTMLDetailsElement).open)}>
        <summary className="assist-head">
          <span className="assist-num">01</span>
          <div className="assist-head-text">
            <h3>Drop a drawing <span className="assist-optional">— optional</span></h3>
            <p>Upload a floor plan and the assistant will pre-fill the walls below. Review before the numbers lock in.</p>
          </div>
          <span className="assist-chevron" aria-hidden>▾</span>
        </summary>
        <div className="assist-body">
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
        </div>
      </details>

      {/* 02 — Walls */}
      <div id="walls-section" className="walls-section">
        <div className="walls-section-head">
          <span className="assist-num">02</span>
          <div className="assist-head-text">
            <h3>Walls</h3>
            <p>Each row is one partition run. Length and height in metres. Openings deduct from the boarded area.</p>
          </div>
        </div>

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

      {/* 03 — Takeoff (auto-renders when walls are valid) */}
      <div id="takeoff-section" className="results-section">
        <div className="walls-section-head">
          <span className="assist-num">03</span>
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
            onStudPriceChange={handleStudPriceChange}
            onBoardPriceChange={handleBoardPriceChange}
            onOtherPriceChange={handleOtherPriceChange}
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
    </section>
  );
}
