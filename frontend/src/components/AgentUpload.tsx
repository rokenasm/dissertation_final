import { useRef } from "react";
import type { AgentAnalysisResult, DetectedWall } from "../types";

interface Props {
  file: File | null;
  preview: string | null;
  loading: boolean;
  result: AgentAnalysisResult | null;
  error: string | null;
  onFileChange: (file: File, preview: string) => void;
  onAnalyse: () => void;
  onWallsDetected: (walls: DetectedWall[]) => void;
}

export default function AgentUpload({
  file, preview, loading, result, error,
  onFileChange, onAnalyse, onWallsDetected,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    onFileChange(f, URL.createObjectURL(f));
  }

  return (
    <div className="agent-upload">
      <div
        className="upload-area"
        onClick={() => { if (!preview || file?.type !== "application/pdf") inputRef.current?.click(); }}
      >
        {preview && file?.type !== "application/pdf" ? (
          <img src={preview} alt="Floor plan preview" className="upload-preview" />
        ) : preview && file?.type === "application/pdf" ? (
          <iframe src={preview} className="upload-pdf-preview" title="Floor plan PDF" />
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

      {file && (
        <div className="upload-actions">
          <button type="button" className="change-file-btn" onClick={() => inputRef.current?.click()}>
            Change file
          </button>
          {!loading && !result && (
            <button className="analyse-btn" onClick={onAnalyse}>
              Analyse with AI
            </button>
          )}
        </div>
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
                Review the detected walls above. Height defaults to 2.4m (standard UK ceiling height) — adjust if known from an elevation or section drawing. Click below to load into the estimator where you can edit any values before calculating.
              </p>
              <button className="use-walls-btn" onClick={() => onWallsDetected(result.walls)}>
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
