import { useState } from "react";
import type { WallFormData, Opening } from "../types";
import type { StudSize, BoardType, Finish } from "../catalogue";
import {
  STUDS,
  BOARDS,
  FINISHES,
  STUD_ORDER,
  BOARD_ORDER,
  FINISH_ORDER,
} from "../catalogue";

interface Props {
  data: WallFormData;
  onChange: (data: WallFormData) => void;
  wallIndex: number;
}

export default function WallForm({ data, onChange, wallIndex }: Props) {
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

  return (
    <div className="wall-form">
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

      <div className="form-row form-row-selects">
        <label className="select-label">
          <span className="select-head">Metal</span>
          <select
            value={data.stud_size}
            onChange={(e) => set("stud_size", e.target.value as StudSize)}
          >
            {STUD_ORDER.map((size) => (
              <option key={size} value={size}>
                {size} — {STUDS[size].partition_label}
              </option>
            ))}
          </select>
          <span className="select-foot">{STUDS[data.stud_size].name}</span>
        </label>

        <label className="select-label">
          <span className="select-head">Board</span>
          <select
            value={data.board_type}
            onChange={(e) => set("board_type", e.target.value as BoardType)}
          >
            {BOARD_ORDER.map((type) => (
              <option key={type} value={type}>
                {BOARDS[type].name.replace("Gyproc ", "").replace(" 12.5 mm", "")} — {BOARDS[type].tagline}
              </option>
            ))}
          </select>
          <span className="select-foot">{BOARDS[data.board_type].name}</span>
        </label>
      </div>

      <div className="form-row">
        <fieldset>
          <legend>Stud spacing</legend>
          {([300, 600] as const).map((s) => (
            <label key={s} className="inline-label">
              <input
                type="radio"
                name={`stud_spacing_${wallIndex}`}
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
                name={`sides_${wallIndex}`}
                value={s}
                checked={data.sides === s}
                onChange={() => set("sides", s)}
              />
              {s === 1 ? "One side" : "Both sides"}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Skins (layers per side)</legend>
          {([1, 2] as const).map((n) => (
            <label key={n} className="inline-label">
              <input
                type="radio"
                name={`layers_${wallIndex}`}
                value={n}
                checked={data.layers === n}
                onChange={() => set("layers", n)}
              />
              {n === 1 ? "Single skin" : "Double skin"}
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

      <div className="form-row">
        <fieldset className="finish-fieldset">
          <legend>Finish</legend>
          {FINISH_ORDER.map((f) => (
            <label key={f} className="inline-label finish-label">
              <input
                type="radio"
                name={`finish_${wallIndex}`}
                value={f}
                checked={data.finish === f}
                onChange={() => set("finish", f as Finish)}
              />
              <span>
                <strong>{FINISHES[f].label}</strong>
                <em>{FINISHES[f].tagline}</em>
              </span>
            </label>
          ))}
        </fieldset>
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
    </div>
  );
}
