import { useRef, useState } from "react";
import type { AgentAnalysisResult, DetectedWall } from "../types";
import { analyseFloorPlan } from "../api";

interface Props {
  onWallsDetected: (walls: DetectedWall[]) => void;
}

export default function AgentUpload({ onWallsDetected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);
    setPreview(URL.createObjectURL(f));
  }

  async function handleAnalyse() {
    if (!file) return;
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await analyseFloorPlan(file);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  function handleUseWalls() {
    if (result) onWallsDetected(result.walls);
  }

  return (
    <div className="agent-upload">
      <div className="upload-area" onClick={() => inputRef.current?.click()}>
        {preview && file?.type !== "application/pdf" ? (
          <img src={preview} alt="Floor plan preview" className="upload-preview" />
        ) : file?.type === "application/pdf" ? (
          <div className="upload-placeholder">
            <span className="upload-icon">📄</span>
            <p>{file.name}</p>
            <p className="upload-hint">PDF ready to analyse</p>
          </div>
        ) : (
          <div className="upload-placeholder">
            <span className="upload-icon">📐</span>
            <p>Click to upload a floor plan</p>
            <p className="upload-hint">JPEG, PNG, or PDF — floor plan or elevation drawing</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      {file && !loading && !result && (
        <button className="analyse-btn" onClick={handleAnalyse}>
          Analyse with AI
        </button>
      )}

      {loading && (
        <div className="agent-loading">
          <div className="spinner" />
          <p>Analysing floor plan… this may take a few seconds</p>
        </div>
      )}

      {error && <p className="error-msg">{error}</p>}

      {result && (
        <div className="agent-result">
          <div className="agent-result-header">
            <div>
              <p className="agent-scale">Scale detected: <strong>{result.scale_detected}</strong></p>
              {result.notes && <p className="agent-notes">{result.notes}</p>}
            </div>
            <span className="walls-badge">{result.walls.length} wall{result.walls.length !== 1 ? "s" : ""} found</span>
          </div>

          {result.walls.length > 0 ? (
            <>
              <table className="detected-table">
                <thead>
                  <tr>
                    <th>Wall</th>
                    <th>Length (m)</th>
                    <th>Height (m)</th>
                    <th>Openings</th>
                  </tr>
                </thead>
                <tbody>
                  {result.walls.map((w, i) => (
                    <tr key={i}>
                      <td>{w.label}</td>
                      <td>{w.length}</td>
                      <td>{w.height}</td>
                      <td>{w.openings.length > 0 ? w.openings.map(o => `${o.label} ${o.width}×${o.height}m`).join(", ") : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="agent-override-note">
                Review the detected walls above. Click below to load them into the estimator where you can edit any values before calculating.
              </p>
              <button className="use-walls-btn" onClick={handleUseWalls}>
                Use these walls →
              </button>
            </>
          ) : (
            <p className="error-msg">No partition walls detected. Try a clearer image or use manual entry.</p>
          )}
        </div>
      )}
    </div>
  );
}
