import type { Persona } from "../types";
import { PERSONA_LABELS } from "../personas";

interface Props {
  value: Persona;
  onChange: (p: Persona) => void;
}

export default function PersonaToggle({ value, onChange }: Props) {
  const personas: Persona[] = ["diy", "trade", "estimator"];

  return (
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
  );
}
