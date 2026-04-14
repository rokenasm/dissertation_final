import { useState } from "react";
import type { Persona, WallFormData, EstimateResponse } from "./types";
import { PERSONA_DEFAULTS } from "./personas";
import { fetchEstimate } from "./api";
import PersonaToggle from "./components/PersonaToggle";
import WallForm from "./components/WallForm";
import ResultsTable from "./components/ResultsTable";
import "./App.css";

function defaultWall(persona: Persona): WallFormData {
  return {
    length: "",
    height: "",
    ...PERSONA_DEFAULTS[persona],
  };
}

export default function App() {
  const [persona, setPersona] = useState<Persona>("trade");
  const [wall, setWall] = useState<WallFormData>(defaultWall("trade"));
  const [result, setResult] = useState<EstimateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handlePersonaChange(p: Persona) {
    setPersona(p);
    setWall((prev) => ({ ...PERSONA_DEFAULTS[p], length: prev.length, height: prev.height }));
    setResult(null);
    setError(null);
  }

  async function handleCalculate() {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await fetchEstimate(wall);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
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
        <section className="form-section">
          <PersonaToggle value={persona} onChange={handlePersonaChange} />
          <WallForm
            data={wall}
            onChange={setWall}
            onSubmit={handleCalculate}
            loading={loading}
          />
        </section>

        {error && <p className="error-msg">{error}</p>}

        {result && (
          <section className="results-section">
            <ResultsTable totals={result.totals} />
          </section>
        )}
      </main>
    </div>
  );
}
