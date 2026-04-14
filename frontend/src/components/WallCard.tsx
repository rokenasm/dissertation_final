import type { WallFormData } from "../types";
import WallForm from "./WallForm";

interface Props {
  index: number;
  total: number;
  data: WallFormData;
  onChange: (data: WallFormData) => void;
  onRemove: () => void;
}

export default function WallCard({ index, total, data, onChange, onRemove }: Props) {
  return (
    <div className="wall-card">
      <div className="wall-card-header">
        <span className="wall-label">Wall {index + 1}</span>
        {total > 1 && (
          <button type="button" className="remove-wall-btn" onClick={onRemove}>
            Remove
          </button>
        )}
      </div>
      <WallForm data={data} onChange={onChange} />
    </div>
  );
}
