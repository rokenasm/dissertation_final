import type { WallFormData } from "../types";
import WallForm from "./WallForm";
import WallDiagram from "./WallDiagram";

interface Props {
  index: number;
  total: number;
  data: WallFormData;
  onChange: (data: WallFormData) => void;
  onRemove: () => void;
}

export default function WallCard({ index, total, data, onChange, onRemove }: Props) {
  const hasDims =
    parseFloat(data.length) > 0 && parseFloat(data.height) > 0;

  return (
    <div className="wall-card">
      <div className="wall-card-header">
        <span className="wall-label">
          Wall {index + 1}{data.label ? ` — ${data.label}` : ""}
        </span>
        {total > 1 && (
          <button type="button" className="remove-wall-btn" onClick={onRemove}>
            Remove
          </button>
        )}
      </div>
      <WallForm data={data} onChange={onChange} wallIndex={index} />
      {hasDims && (
        <div className="wall-diagram-wrap">
          <p className="wall-diagram-label">Wall diagram</p>
          <WallDiagram data={data} />
        </div>
      )}
    </div>
  );
}
