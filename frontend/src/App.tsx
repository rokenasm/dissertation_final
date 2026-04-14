import { useState } from "react";
import type { Persona, WallFormData, EstimateResponse } from "./types";
import { PERSONA_DEFAULTS } from "./personas";
import { fetchEstimate } from "./api";
import PersonaToggle from "./components/PersonaToggle";
import WallCard from "./components/WallCard";
import ResultsTable from "./components/ResultsTable";
import "./App.css";

function newWall(persona: Persona): WallFormData {
  return { length: "", height: "", ...PERSONA_DEFAULTS[persona] };
}

export default function App() {
  const [persona, setPersona] = useState<Persona>("trade");
  const [walls, setWalls] = useState<WallFormData[]>([newWall("trade")]);
  const [result, setResult] = useState<EstimateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handlePersonaChange(p: Persona) {
    setPersona(p);
    setWalls((prev) =>
      prev.map((w) => ({ ...PERSONA_DEFAULTS[p], length: w.length, height: w.height }))
    );
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
        <h1>Drylining Estimator</h1>
        <p className="subtitle">GypWall Single Frame — material takeoff</p>
      </header>

      <main className="app-main">
        <PersonaToggle value={persona} onChange={handlePersonaChange} />

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
          <ResultsTable walls={result.walls} totals={result.totals} />
        )}
      </main>
    </div>
  );
}
