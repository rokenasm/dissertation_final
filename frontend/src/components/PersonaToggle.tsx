import type { Persona } from "../types";

// Two presets that matter — DIY (domestic timber) vs Trade (commercial metal).
// The third "estimator" persona was removed because it wasn't meaningfully
// different from Trade.
type TwoPersona = "diy" | "trade";

interface Props {
  value: TwoPersona;
  onChange: (p: TwoPersona) => void;
}

const LABELS: Record<TwoPersona, string> = {
  diy: "DIY",
  trade: "Trade",
};

const HINTS: Record<TwoPersona, string> = {
  diy: "Domestic timber partitions — CLS 4×2, insulation on, paint finish",
  trade: "Commercial metal — Gypframe 70 S 50, WallBoard, paint finish",
};

export default function PersonaToggle({ value, onChange }: Props) {
  return (
    <div className="persona-wrap">
      <div className="persona-toggle">
        {(["diy", "trade"] as const).map((p) => (
          <button
            key={p}
            type="button"
            className={`persona-btn${value === p ? " active" : ""}`}
            onClick={() => onChange(p)}
          >
            {LABELS[p]}
          </button>
        ))}
      </div>
      <p className="persona-hint">
        <span className="persona-hint-label">New walls start as:</span> {HINTS[value]}
      </p>
    </div>
  );
}

export type { TwoPersona };
