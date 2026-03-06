import { memo, useMemo } from 'react';
import InfoHeader from './InfoHeader.jsx';
import './VelocityTrend.css';

// Palette: amber first (matches accent), then distinct colors
const PALETTE = ['#F59E0B', '#3B82F6', '#10B981', '#A855F7', '#EF4444', '#F97316', '#06B6D4', '#EC4899'];

const MARGIN = { top: 16, right: 24, bottom: 36, left: 48 };
const SVG_W = 600;
const SVG_H = 200;
const PLOT_W = SVG_W - MARGIN.left - MARGIN.right;
const PLOT_H = SVG_H - MARGIN.top - MARGIN.bottom;

function typeColor(type, typeList) {
  const idx = typeList.indexOf(type);
  return PALETTE[idx % PALETTE.length];
}

const VelocityTrend = memo(function VelocityTrend({ pitches }) {
  const { data, typeList, yMin, yMax, yTicks } = useMemo(() => {
    const withVelo = pitches
      .map((p, i) => ({ ...p, _seq: i, v: parseFloat(p.velocity) }))
      .filter(p => !isNaN(p.v) && p.v > 0);

    if (!withVelo.length) return { data: [], typeList: [], yMin: 0, yMax: 0, yTicks: [] };

    const velos = withVelo.map(p => p.v);
    const rawMin = Math.min(...velos);
    const rawMax = Math.max(...velos);

    const yMin = Math.floor(rawMin - 1);
    const yMax = Math.ceil(rawMax + 1);
    const step = Math.max(1, Math.ceil((yMax - yMin) / 4));
    const yTicks = [];
    for (let v = yMin; v <= yMax; v += step) yTicks.push(v);

    // Type list in first-appearance order
    const seen = new Set();
    const typeList = [];
    for (const p of withVelo) {
      const t = p.pitchType || 'Other';
      if (!seen.has(t)) { seen.add(t); typeList.push(t); }
    }

    return { data: withVelo, typeList, yMin, yMax, yTicks };
  }, [pitches]);

  if (!data.length) return null;

  const N = data.length;
  const toX = i => MARGIN.left + (i / Math.max(N - 1, 1)) * PLOT_W;
  const toY = v => MARGIN.top + PLOT_H - ((v - yMin) / (yMax - yMin)) * PLOT_H;

  // Group pitches by type for polylines
  const byType = {};
  for (const p of data) {
    const t = p.pitchType || 'Other';
    if (!byType[t]) byType[t] = [];
    byType[t].push(p);
  }

  // X-axis label positions (start, middle, end)
  const xLabels = [
    { i: 0, label: '1' },
    ...(N > 2 ? [{ i: Math.round((N - 1) / 2), label: String(Math.round(N / 2)) }] : []),
    { i: N - 1, label: String(N) },
  ];

  return (
    <div className="velocity-trend">
      <InfoHeader
        title="Velocity Trend"
        info="Plots pitch velocity in the order pitches were thrown, color-coded by pitch type. A downward drift may signal fatigue. Large gaps between pitch types show the speed differential in the arsenal."
      />
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="velocity-chart"
        aria-label="Velocity trend chart"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines + Y labels */}
        {yTicks.map(tick => {
          const y = toY(tick);
          return (
            <g key={tick}>
              <line
                x1={MARGIN.left} y1={y}
                x2={SVG_W - MARGIN.right} y2={y}
                className="chart-grid-line"
              />
              <text x={MARGIN.left - 8} y={y} textAnchor="end" dominantBaseline="middle" className="chart-axis-label">
                {tick}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {xLabels.map(({ i, label }) => (
          <text
            key={label}
            x={toX(i)} y={MARGIN.top + PLOT_H + 18}
            textAnchor="middle"
            className="chart-axis-label"
          >
            {label}
          </text>
        ))}

        {/* Axis label */}
        <text
          x={MARGIN.left + PLOT_W / 2}
          y={SVG_H - 4}
          textAnchor="middle"
          className="chart-axis-sub"
        >
          pitch sequence
        </text>

        {/* Connecting lines per pitch type */}
        {typeList.map(type => {
          const pts = byType[type];
          if (!pts || pts.length < 2) return null;
          const points = pts.map(p => `${toX(p._seq)},${toY(p.v)}`).join(' ');
          return (
            <polyline
              key={type}
              points={points}
              fill="none"
              stroke={typeColor(type, typeList)}
              strokeWidth="1.5"
              strokeOpacity="0.5"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Dots */}
        {data.map((p, i) => {
          const t = p.pitchType || 'Other';
          const color = typeColor(t, typeList);
          return (
            <circle key={i} cx={toX(p._seq)} cy={toY(p.v)} r="3.5" fill={color} fillOpacity="0.9">
              <title>{t}: {p.v} mph (pitch {p._seq + 1})</title>
            </circle>
          );
        })}

        {/* Y-axis line */}
        <line
          x1={MARGIN.left} y1={MARGIN.top}
          x2={MARGIN.left} y2={MARGIN.top + PLOT_H}
          className="chart-axis-line"
        />
        {/* X-axis line */}
        <line
          x1={MARGIN.left} y1={MARGIN.top + PLOT_H}
          x2={SVG_W - MARGIN.right} y2={MARGIN.top + PLOT_H}
          className="chart-axis-line"
        />
      </svg>

      {/* Legend */}
      <div className="velocity-legend">
        {typeList.map(type => (
          <span key={type} className="velocity-legend-item">
            <span className="velocity-legend-dot" style={{ background: typeColor(type, typeList) }} />
            {type}
          </span>
        ))}
      </div>
    </div>
  );
});

export default VelocityTrend;
