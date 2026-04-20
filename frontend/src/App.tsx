import { useState } from "react";
import type { Persona, WallFormData, EstimateResponse, MaterialPrices, DetectedWall, AgentAnalysisResult } from "./types";
import { PERSONA_DEFAULTS } from "./personas";
import { DEFAULT_PRICES } from "./prices";
import { fetchEstimate, analyseFloorPlan } from "./api";
import PersonaToggle from "./components/PersonaToggle";
import WallCard from "./components/WallCard";
import ResultsTable from "./components/ResultsTable";
import AgentUpload from "./components/AgentUpload";
import "./App.css";

type Mode = "manual" | "agent";

function newWall(persona: Persona): WallFormData {
  return { label: "", length: "", height: "", ...PERSONA_DEFAULTS[persona] };
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

export default function App() {
  const [mode, setMode] = useState<Mode>("manual");
  const [persona, setPersona] = useState<Persona>("trade");
  const [walls, setWalls] = useState<WallFormData[]>([newWall("trade")]);
  const [prices, setPrices] = useState<MaterialPrices>(DEFAULT_PRICES);
  const [result, setResult] = useState<EstimateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Agent state — kept here so it persists when switching between tabs
  const [agentFile, setAgentFile] = useState<File | null>(null);
  const [agentPreview, setAgentPreview] = useState<string | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentResult, setAgentResult] = useState<AgentAnalysisResult | null>(null);
  const [agentError, setAgentError] = useState<string | null>(null);

  function handlePersonaChange(p: Persona) {
    setPersona(p);
    setWalls((prev) =>
      prev.map((w) => ({ ...PERSONA_DEFAULTS[p], length: w.length, height: w.height }))
    );
    setResult(null);
    setError(null);
  }

  function handleModeChange(m: Mode) {
    setMode(m);
    setResult(null);
    setError(null);
  }

  function updateWall(index: number, data: WallFormData) {
    setWalls((prev) => prev.map((w, i) => (i === index ? data : w)));
  }

  function addWall() {
    setWalls((prev) => [...prev, newWall(persona)]);
    setResult(null);
    setError(null);
  }

  function removeWall(index: number) {
    setWalls((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
    setError(null);
  }

  function handlePriceChange(key: keyof MaterialPrices, value: number) {
    setPrices((prev) => ({ ...prev, [key]: value }));
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
    setMode("manual");
    setResult(null);
    setError(null);
  }

  async function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await fetchEstimate(walls);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Drylining Estimator</h1>
          <p className="subtitle">GypWall Single Frame — material takeoff</p>
        </div>
      </header>

      <main className="app-main">
        <div className="mode-toggle">
          <button
            className={`mode-btn${mode === "manual" ? " active" : ""}`}
            onClick={() => handleModeChange("manual")}
          >
            Manual Entry
          </button>
          <button
            className={`mode-btn${mode === "agent" ? " active" : ""}`}
            onClick={() => handleModeChange("agent")}
          >
            AI Floor Plan
          </button>
        </div>

        {mode === "agent" ? (
          <div className="agent-section">
            <div className="agent-intro">
              <h2>AI Floor Plan Analysis</h2>
              <p>Upload a floor plan image and the AI will detect partition walls and estimate their dimensions automatically. You can review and edit the results before calculating.</p>
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
          </div>
        ) : (
          <>
            <div className="manual-controls">
              <PersonaToggle value={persona} onChange={handlePersonaChange} />
            </div>

            <form onSubmit={handleCalculate}>
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
                <button type="submit" className="calculate-btn" disabled={loading}>
                  {loading ? "Calculating…" : "Calculate"}
                </button>
              </div>
            </form>

            {error && <p className="error-msg">{error}</p>}

            {result && (
              <ResultsTable
                walls={result.walls}
                totals={result.totals}
                prices={prices}
                onPriceChange={handlePriceChange}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
