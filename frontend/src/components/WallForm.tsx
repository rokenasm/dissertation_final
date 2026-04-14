import { useState } from "react";
import type { WallFormData, Opening } from "../types";

interface Props {
  data: WallFormData;
  onChange: (data: WallFormData) => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function WallForm({ data, onChange, onSubmit, loading }: Props) {
  const [openingInput, setOpeningInput] = useState({ width: "", height: "" });

  function set<K extends keyof WallFormData>(key: K, value: WallFormData[K]) {
    onChange({ ...data, [key]: value });
  }

  function addOpening() {
    const w = parseFloat(openingInput.width);
    const h = parseFloat(openingInput.height);
    if (!w || !h || w <= 0 || h <= 0) return;
    const opening: Opening = { width: w, height: h };
    onChange({ ...data, openings: [...data.openings, opening] });
    setOpeningInput({ width: "", height: "" });
  }

  function removeOpening(index: number) {
    onChange({ ...data, openings: data.openings.filter((_, i) => i !== index) });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form className="wall-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>
          Length (m)
          <input
            type="number"
            min="0.1"
            step="0.01"
            value={data.length}
            onChange={(e) => set("length", e.target.value)}
            required
          />
        </label>
        <label>
          Height (m)
          <input
            type="number"
            min="0.1"
            step="0.01"
            value={data.height}
            onChange={(e) => set("height", e.target.value)}
            required
          />
        </label>
      </div>

      <div className="form-row">
        <fieldset>
          <legend>Stud spacing</legend>
          {([300, 600] as const).map((s) => (
            <label key={s} className="inline-label">
              <input
                type="radio"
                name="stud_spacing"
                value={s}
                checked={data.stud_spacing_mm === s}
                onChange={() => set("stud_spacing_mm", s)}
              />
              {s} mm
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Sides boarded</legend>
          {([1, 2] as const).map((s) => (
            <label key={s} className="inline-label">
              <input
                type="radio"
                name="sides"
                value={s}
                checked={data.sides === s}
                onChange={() => set("sides", s)}
              />
              {s === 1 ? "Single" : "Double"}
            </label>
          ))}
        </fieldset>

        <label className="inline-label checkbox-label">
          <input
            type="checkbox"
            checked={data.insulated}
            onChange={(e) => set("insulated", e.target.checked)}
          />
          Insulation
        </label>
      </div>

      <div className="openings-section">
        <p className="section-label">Openings (doors / windows)</p>
        {data.openings.length > 0 && (
          <ul className="opening-list">
            {data.openings.map((o, i) => (
              <li key={i}>
                {o.width} m × {o.height} m
                <button type="button" className="remove-btn" onClick={() => removeOpening(i)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="opening-inputs">
          <input
            type="number"
            placeholder="Width (m)"
            min="0.1"
            step="0.01"
            value={openingInput.width}
            onChange={(e) => setOpeningInput({ ...openingInput, width: e.target.value })}
          />
          <input
            type="number"
            placeholder="Height (m)"
            min="0.1"
            step="0.01"
            value={openingInput.height}
            onChange={(e) => setOpeningInput({ ...openingInput, height: e.target.value })}
          />
          <button type="button" className="add-btn" onClick={addOpening}>
            Add opening
          </button>
        </div>
      </div>

      <button type="submit" className="calculate-btn" disabled={loading}>
        {loading ? "Calculating…" : "Calculate"}
      </button>
    </form>
  );
}
