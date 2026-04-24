import type { Persona } from "../types";
import { PERSONA_LABELS } from "../personas";

interface Props {
  value: Persona;
  onChange: (p: Persona) => void;
}

const PERSONA_HINTS: Record<Persona, string> = {
  diy: "Timber partitions, 4×2 CLS at 400 mm, insulation on by default",
  trade: "Metal GypWall 70 S 50 at 600 mm, standard board, paint finish",
  estimator: "Heavier commercial — 92 S 50 metal + FireLine board",
};

export default function PersonaToggle({ value, onChange }: Props) {
  const personas: Persona[] = ["diy", "trade", "estimator"];

  return (
    <div className="persona-wrap">
      <div className="persona-toggle">
        {personas.map((p) => (
          <button
            key={p}
            type="button"
            className={`persona-btn${value === p ? " active" : ""}`}
            onClick={() => onChange(p)}
          >
            {PERSONA_LABELS[p]}
          </button>
        ))}
      </div>
      <p className="persona-hint">
        <span className="persona-hint-label">Applies defaults:</span> {PERSONA_HINTS[value]}
      </p>
    </div>
  );
}
