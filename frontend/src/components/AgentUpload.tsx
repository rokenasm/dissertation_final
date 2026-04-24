import { useRef, useState } from "react";
import type { AgentAnalysisResult, DetectedWall, DetectedWallType } from "../types";

function buildupSummary(type: DetectedWallType | undefined): string {
  if (!type) return "—";
  const bits: string[] = [];
  if (type.frame_material) bits.push(type.frame_material === "timber" ? "Timber" : "Metal");
  if (type.stud_size) {
    bits.push(
      type.stud_size +
        (type.stud_spacing_mm ? ` @ ${type.stud_spacing_mm}` : "")
    );
  }
  if (type.board_type) {
    const skins =
      type.sides && type.layers
        ? ` ${type.sides}×${type.layers}`
        : "";
    bits.push(type.board_type + skins);
  }
  if (type.insulated) bits.push("insulated");
  if (type.fire_rating_min) bits.push(`${type.fire_rating_min}-min fire`);
  return bits.length ? bits.join(" · ") : "—";
}

interface Props {
  file: File | null;
  preview: string | null;
  loading: boolean;
  result: AgentAnalysisResult | null;
  error: string | null;
  onFileChange: (file: File, preview: string) => void;
  onAnalyse: () => void;
  onWallsDetected: (walls: DetectedWall[], wallTypes?: DetectedWallType[]) => void;
}

export default function AgentUpload({
  file, preview, loading, result, error,
  onFileChange, onAnalyse, onWallsDetected,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function openPicker() {
    inputRef.current?.click();
  }

  function acceptFile(f: File) {
    if (!f.type.match(/^(image\/(jpeg|png|webp)|application\/pdf)$/)) return;
    onFileChange(f, URL.createObjectURL(f));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) acceptFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) acceptFile(f);
  }

  const isPdf = file?.type === "application/pdf";

  return (
    <div className="agent-upload">
      <div
        className={"drop-sheet" + (dragOver ? " is-drag" : "")}
        onClick={() => { if (!preview) openPicker(); }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
      >
        <div className="drop-sheet-corners" aria-hidden>
          <span /><span /><span /><span />
        </div>

        {preview && !isPdf ? (
          <img src={preview} alt="Floor plan preview" className="drop-sheet-preview" />
        ) : preview && isPdf ? (
          <iframe src={preview} className="drop-sheet-pdf" title="Floor plan PDF" />
        ) : (
          <div className="drop-sheet-empty">
            <span className="drop-sheet-label">Drawing</span>
            <p className="drop-sheet-headline">Drop a floor plan here.</p>
            <p className="drop-sheet-hint">JPEG · PNG · PDF — click to browse</p>
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
        <div className="drop-actions">
          <button type="button" className="btn btn-text" onClick={openPicker}>
            Change file
          </button>
          {!loading && !result && (
            <button type="button" className="btn btn-primary" onClick={onAnalyse}>
              Read the drawing →
            </button>
          )}
        </div>
      )}

      {loading && (
        <div className="agent-loading">
          <div className="spinner" />
          <p>Reading the drawing — this takes a few seconds.</p>
        </div>
      )}

      {error && <p className="contact-error">{error}</p>}

      {result && (
        <div className="detected-panel">
          <div className="detected-panel-head">
            <div>
              <span className="sheet-label">Detected</span>
              <p className="detected-scale">
                Scale: <strong>{result.scale_detected}</strong>
              </p>
              {result.notes && <p className="detected-notes">{result.notes}</p>}
            </div>
            <span className="detected-count">
              {result.walls.length} wall{result.walls.length !== 1 ? "s" : ""}
            </span>
          </div>

          {result.walls.length > 0 ? (
            <>
              {(() => {
                const typesById = new Map<string, DetectedWallType>();
                (result.wall_types ?? []).forEach((t) => typesById.set(t.id, t));
                return (
                  <table className="detected-table">
                    <thead>
                      <tr>
                        <th>Wall</th>
                        <th>Size</th>
                        <th>Build-up</th>
                        <th>Openings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.walls.map((w, i) => {
                        const type = w.type_id ? typesById.get(w.type_id) : undefined;
                        return (
                          <tr key={i}>
                            <td>
                              <strong>{w.label}</strong>
                              {type?.spec_code && (
                                <span className="detected-spec"> · {type.spec_code}</span>
                              )}
                            </td>
                            <td>{w.length} m × {w.height} m</td>
                            <td className="detected-buildup">{buildupSummary(type)}</td>
                            <td>
                              {w.openings.length > 0
                                ? w.openings.map((o) => `${o.label} ${o.width}×${o.height}m`).join(", ")
                                : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                );
              })()}
              <p className="detected-note">
                Walls with a build-up above came from the partition types key
                and will pre-fill stud / board / skins / insulation when you load
                them. Walls showing "—" didn't match any type — they fall back
                to the current persona default and you can set them manually.
              </p>
              <button type="button" className="btn btn-primary" onClick={() => onWallsDetected(result.walls, result.wall_types)}>
                Load into walls below →
              </button>
            </>
          ) : (
            <p className="contact-error">
              No partition walls detected. Try a clearer drawing or enter walls manually.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
