import type { ProjectTotals } from "../types";

interface Props {
  totals: ProjectTotals;
}

interface Row {
  label: string;
  product: string;
  qty: number;
  unit: string;
}

function buildRows(t: ProjectTotals): Row[] {
  return [
    {
      label: "Plasterboard",
      product: "Gyproc WallBoard 12.5mm (1200 × 2400 mm)",
      qty: t.boards,
      unit: "sheets",
    },
    {
      label: "Studs",
      product: "Gypframe 48 S 50 'C' Stud",
      qty: t.studs_pieces,
      unit: `pieces (${t.studs_linear_m} m)`,
    },
    {
      label: "Track",
      product: "Gypframe 50 FEC 50 Channel (3600 mm)",
      qty: t.track_pieces,
      unit: `lengths (${t.track_linear_m} m)`,
    },
    ...(t.insulation_packs > 0
      ? [
          {
            label: "Insulation",
            product: "Isover APR 1200 50mm",
            qty: t.insulation_packs,
            unit: "packs",
          },
        ]
      : []),
    {
      label: "Board screws",
      product: "BG Drywall Screws 25mm",
      qty: t.screws,
      unit: "screws",
    },
    {
      label: "Framing screws",
      product: "BG Wafer Head Screws 13mm",
      qty: t.framing_screws,
      unit: "screws",
    },
    {
      label: "Joint tape",
      product: "Gyproc Joint Tape 150m",
      qty: t.joint_tape_rolls,
      unit: "rolls",
    },
    {
      label: "Jointing compound",
      product: "Gyproc EasiFill 60 (10 kg)",
      qty: t.easifill_bags,
      unit: "bags",
    },
  ];
}

export default function ResultsTable({ totals }: Props) {
  const rows = buildRows(totals);

  return (
    <div className="results">
      <h2>Material Estimate</h2>
      <table className="results-table">
        <thead>
          <tr>
            <th>Material</th>
            <th>Product</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td className="product-name">{row.product}</td>
              <td className="qty">
                <strong>{row.qty}</strong> {row.unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="results-note">
        All quantities include waste allowance and are rounded up to whole purchasable units.
      </p>
    </div>
  );
}
