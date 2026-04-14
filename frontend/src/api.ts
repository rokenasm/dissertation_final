import type { WallFormData, EstimateResponse } from "./types";

const API_URL = import.meta.env.VITE_API_URL;

export async function fetchEstimate(wall: WallFormData): Promise<EstimateResponse> {
  const response = await fetch(`${API_URL}/estimate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      walls: [
        {
          length: parseFloat(wall.length),
          height: parseFloat(wall.height),
          stud_spacing_mm: wall.stud_spacing_mm,
          sides: wall.sides,
          layers: wall.layers,
          insulated: wall.insulated,
          openings: wall.openings,
          board_waste_pct: wall.board_waste_pct,
          stud_waste_pct: wall.stud_waste_pct,
          track_waste_pct: wall.track_waste_pct,
          insulation_waste_pct: wall.insulation_waste_pct,
          screw_waste_pct: wall.screw_waste_pct,
          framing_screw_waste_pct: wall.framing_screw_waste_pct,
          joint_tape_waste_pct: wall.joint_tape_waste_pct,
          easifill_waste_pct: wall.easifill_waste_pct,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.detail?.[0]?.msg ?? `Request failed (${response.status})`);
  }

  return response.json();
}
