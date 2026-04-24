import type { WallFormData } from "../types";
import { STUDS } from "../catalogue";

interface Props {
  data: WallFormData;
}

/**
 * Elevation view of the wall — looking at it head-on. Floor below, ceiling
 * above, studs running vertically between plates. Doors get a swing arc,
 * windows a sash-cross.
 */
export default function WallDiagram({ data }: Props) {
  const len = parseFloat(data.length);
  const ht = parseFloat(data.height);
  if (!len || !ht || len <= 0 || ht <= 0) {
    return (
      <div className="wall-diagram wall-diagram--empty">
        <p>Enter length and height to see the wall diagram.</p>
      </div>
    );
  }

  const svgW = 560;
  const padLeft = 70;   // room for vertical height label
  const padRight = 30;
  const padTop = 54;    // CEILING label + dashed line + length dimension
  const padBottom = 68; // floor hatch + FLOOR label + caption
  const maxWallW = svgW - padLeft - padRight;
  const scale = maxWallW / len;
  const wallW = len * scale;
  const wallH = ht * scale;
  const svgH = wallH + padTop + padBottom;
  const x0 = padLeft;
  const y0 = padTop;
  const yFloor = y0 + wallH;

  const spacing_m = data.stud_spacing_mm / 1000;
  const studSpec = STUDS[data.stud_size];
  const plateThickness = studSpec.frame_material === "timber" ? 8 : 6;
  const isTimber = studSpec.frame_material === "timber";

  const studXs: number[] = [];
  for (let x = 0; x <= len + 0.001; x += spacing_m) {
    studXs.push(Math.min(x, len));
  }

  const gapPx = 24 * scale;
  let cursor = padLeft + gapPx;
  const openingRects = data.openings.map((o, i) => {
    const ow = o.width * scale;
    const oh = o.height * scale;
    const isDoor = o.height >= 1.8;
    const ox = cursor;
    const oy = isDoor ? yFloor - oh : y0 + (wallH - oh) / 2;
    cursor += ow + gapPx;
    return { i, x: ox, y: oy, w: ow, h: oh, isDoor };
  });

  return (
    <div className="wall-diagram">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width="100%"
        height="auto"
        role="img"
        aria-label="Wall elevation diagram"
      >
        <defs>
          <pattern id="floorHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="var(--ink-3)" strokeWidth="1" />
          </pattern>
          {data.insulated && (
            <pattern id="insulation" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="14" stroke="#c7d6ea" strokeWidth="1" />
            </pattern>
          )}
          {/* Arrow markers for dimension lines */}
          <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--ink-3)" />
          </marker>
          <marker id="arrStart" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M10,0 L0,5 L10,10 Z" fill="var(--ink-3)" />
          </marker>
        </defs>

        {/* CEILING — label at the very top, dashed line under it */}
        <text
          x={x0 + wallW / 2}
          y={20}
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fontFamily="var(--font-mono, monospace)"
          fill="var(--ink-2)"
          letterSpacing="1"
        >
          CEILING
        </text>
        <line
          x1={x0 - 20}
          y1={28}
          x2={x0 + wallW + 20}
          y2={28}
          stroke="var(--ink)"
          strokeWidth="1.2"
          strokeDasharray="4 3"
        />

        {/* Length dimension line, just above the wall */}
        <line
          x1={x0}
          y1={y0 - 14}
          x2={x0 + wallW}
          y2={y0 - 14}
          stroke="var(--ink-3)"
          strokeWidth="1"
          markerStart="url(#arrStart)"
          markerEnd="url(#arr)"
        />
        <rect
          x={x0 + wallW / 2 - 28}
          y={y0 - 22}
          width="56"
          height="16"
          fill="var(--paper)"
        />
        <text
          x={x0 + wallW / 2}
          y={y0 - 10}
          textAnchor="middle"
          fontSize="11"
          fontFamily="var(--font-mono, monospace)"
          fill="var(--ink-2)"
        >
          {len.toFixed(2)} m
        </text>

        {/* Height dimension line, left of the wall */}
        <line
          x1={x0 - 16}
          y1={y0}
          x2={x0 - 16}
          y2={yFloor}
          stroke="var(--ink-3)"
          strokeWidth="1"
          markerStart="url(#arrStart)"
          markerEnd="url(#arr)"
        />
        <rect
          x={x0 - 48}
          y={y0 + wallH / 2 - 8}
          width="28"
          height="16"
          fill="var(--paper)"
        />
        <text
          x={x0 - 34}
          y={y0 + wallH / 2 + 4}
          textAnchor="middle"
          fontSize="11"
          fontFamily="var(--font-mono, monospace)"
          fill="var(--ink-2)"
        >
          {ht.toFixed(2)} m
        </text>

        {/* Insulation hatching (soft, between the plates) */}
        {data.insulated && (
          <rect
            x={x0}
            y={y0 + plateThickness}
            width={wallW}
            height={wallH - plateThickness * 2}
            fill="url(#insulation)"
          />
        )}

        {/* Wall outline */}
        <rect
          x={x0}
          y={y0}
          width={wallW}
          height={wallH}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="1.5"
        />

        {/* Top + sole plates */}
        <rect x={x0} y={y0} width={wallW} height={plateThickness} fill="var(--ink)" />
        <rect x={x0} y={yFloor - plateThickness} width={wallW} height={plateThickness} fill="var(--ink)" />

        {/* Studs */}
        {studXs.map((xm, i) => (
          <rect
            key={`stud-${i}`}
            x={x0 + xm * scale - (isTimber ? 2.5 : 1.8)}
            y={y0 + plateThickness}
            width={isTimber ? 5 : 3.6}
            height={wallH - plateThickness * 2}
            fill="var(--redline)"
            opacity="0.85"
          />
        ))}

        {/* Timber mid-height noggin */}
        {isTimber && (
          <rect
            x={x0 + plateThickness}
            y={y0 + wallH / 2 - 2.5}
            width={wallW - plateThickness * 2}
            height={5}
            fill="var(--redline)"
            opacity="0.6"
          />
        )}

        {/* Openings */}
        {openingRects.map((o) => (
          <g key={`op-${o.i}`}>
            <rect
              x={o.x}
              y={o.y}
              width={o.w}
              height={o.h}
              fill="var(--paper)"
              stroke="var(--ink)"
              strokeWidth="1.3"
            />
            {o.isDoor ? (
              <>
                <path
                  d={`M ${o.x} ${o.y + o.h} A ${o.w} ${o.w} 0 0 1 ${o.x + o.w} ${o.y + o.h - o.w}`}
                  fill="none"
                  stroke="var(--ink-3)"
                  strokeWidth="0.9"
                  strokeDasharray="2 2"
                />
                <line
                  x1={o.x}
                  y1={o.y + o.h}
                  x2={o.x}
                  y2={o.y + o.h - o.w}
                  stroke="var(--ink-3)"
                  strokeWidth="1.5"
                />
                <circle cx={o.x + o.w - 4} cy={o.y + o.h / 2} r="1.5" fill="var(--redline)" />
              </>
            ) : (
              <>
                <line
                  x1={o.x + o.w / 2}
                  y1={o.y}
                  x2={o.x + o.w / 2}
                  y2={o.y + o.h}
                  stroke="var(--ink-3)"
                  strokeWidth="0.8"
                />
                <line
                  x1={o.x}
                  y1={o.y + o.h / 2}
                  x2={o.x + o.w}
                  y2={o.y + o.h / 2}
                  stroke="var(--ink-3)"
                  strokeWidth="0.8"
                />
              </>
            )}
          </g>
        ))}

        {/* FLOOR line + hatch + label */}
        <line
          x1={x0 - 20}
          y1={yFloor}
          x2={x0 + wallW + 20}
          y2={yFloor}
          stroke="var(--ink)"
          strokeWidth="2"
        />
        <rect
          x={x0 - 20}
          y={yFloor}
          width={wallW + 40}
          height={14}
          fill="url(#floorHatch)"
        />
        <text
          x={x0 + wallW / 2}
          y={yFloor + 34}
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fontFamily="var(--font-mono, monospace)"
          fill="var(--ink-2)"
          letterSpacing="1"
        >
          FLOOR
        </text>

        {/* Caption */}
        <text
          x={x0}
          y={svgH - 8}
          fontSize="10"
          fontFamily="var(--font-mono, monospace)"
          fill="var(--ink-3)"
        >
          Elevation · {studXs.length} studs at {data.stud_spacing_mm} mm centres
        </text>
      </svg>
    </div>
  );
}
