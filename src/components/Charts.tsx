import type { KpiEntry } from "@/lib/types";
import { formatCompact, formatDate, formatShortDate, formatValue } from "@/lib/utils";

/* ---------- Sparkline ---------- */

export function Sparkline({
  values,
  color = "#4f46e5",
  width = 120,
  height = 36,
}: {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (values.length < 2) {
    return <div style={{ width, height }} />;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 3;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (width - pad * 2) + pad;
      const y = height - pad - ((v - min) / range) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- Line chart with target line ---------- */

const W = 640;
const H = 260;
const P = { top: 16, right: 16, bottom: 32, left: 52 };

export function LineChart({
  entries,
  target,
  unit,
}: {
  entries: KpiEntry[]; // must be sorted by date ascending
  target: number;
  unit: string;
}) {
  if (entries.length === 0) {
    return (
      <div className="grid h-64 place-items-center text-sm text-slate-400">
        No data yet — add your first entry below.
      </div>
    );
  }

  const values = entries.map((e) => e.value);
  let min = Math.min(...values, target);
  let max = Math.max(...values, target);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const pad = (max - min) * 0.1;
  const allNonNegative = min >= 0;
  min = allNonNegative ? Math.max(0, min - pad) : min - pad;
  max += pad;

  const innerW = W - P.left - P.right;
  const innerH = H - P.top - P.bottom;
  const x = (i: number) =>
    entries.length === 1 ? P.left + innerW / 2 : P.left + (i / (entries.length - 1)) * innerW;
  const y = (v: number) => P.top + (1 - (v - min) / (max - min)) * innerH;

  const ticks = Array.from({ length: 5 }, (_, i) => min + ((max - min) * i) / 4);
  const line = entries.map((e, i) => `${i ? "L" : "M"}${x(i)},${y(e.value)}`).join(" ");
  const baseY = P.top + innerH;
  const area = `${line} L${x(entries.length - 1)},${baseY} L${x(0)},${baseY} Z`;
  const labelStep = Math.ceil(entries.length / 8);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="KPI trend chart">
      <defs>
        <linearGradient id="area-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.18} />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Grid + y-axis labels */}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={P.left} x2={W - P.right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" />
          <text x={P.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill="#94a3b8">
            {formatCompact(t)}
          </text>
        </g>
      ))}

      {/* X-axis labels */}
      {entries.map((e, i) =>
        i % labelStep === 0 || i === entries.length - 1 ? (
          <text
            key={e.id}
            x={x(i)}
            y={H - 10}
            textAnchor="middle"
            fontSize={11}
            fill="#94a3b8"
          >
            {formatShortDate(e.date)}
          </text>
        ) : null,
      )}

      {/* Target line */}
      <line
        x1={P.left}
        x2={W - P.right}
        y1={y(target)}
        y2={y(target)}
        stroke="#f59e0b"
        strokeWidth={1.5}
        strokeDasharray="6 4"
      />
      <text x={W - P.right} y={y(target) - 6} textAnchor="end" fontSize={11} fill="#d97706">
        Target {formatValue(target, unit)}
      </text>

      {/* Series */}
      {entries.length > 1 && <path d={area} fill="url(#area-fill)" />}
      <path d={line} fill="none" stroke="#4f46e5" strokeWidth={2.5} strokeLinejoin="round" />
      {entries.map((e, i) => (
        <circle key={e.id} cx={x(i)} cy={y(e.value)} r={4} fill="#fff" stroke="#4f46e5" strokeWidth={2}>
          <title>{`${formatDate(e.date)}: ${formatValue(e.value, unit)}`}</title>
        </circle>
      ))}
    </svg>
  );
}
