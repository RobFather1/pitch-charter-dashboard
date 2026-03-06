import { memo, useMemo } from 'react';
import InfoHeader from './InfoHeader.jsx';
import './PitchMix.css';

const PitchMix = memo(function PitchMix({ pitches }) {
  const rows = useMemo(() => {
    if (!pitches.length) return [];

    const byType = {};
    for (const p of pitches) {
      const t = p.pitchType || 'Other';
      if (!byType[t]) byType[t] = { count: 0, velocities: [] };
      byType[t].count++;
      const v = parseFloat(p.velocity);
      if (!isNaN(v) && v > 0) byType[t].velocities.push(v);
    }

    const total = pitches.length;
    return Object.entries(byType)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([type, d]) => ({
        type,
        count: d.count,
        pct: ((d.count / total) * 100).toFixed(1),
        avgVelo: d.velocities.length > 0
          ? (d.velocities.reduce((a, b) => a + b, 0) / d.velocities.length).toFixed(1)
          : null,
      }));
  }, [pitches]);

  if (!rows.length) return null;

  const maxCount = rows[0].count;

  return (
    <div className="pitch-mix">
      <InfoHeader
        title="Pitch Mix"
        info="Shows how often each pitch type was thrown and at what average velocity. Use this to see if a pitcher is mixing well or leaning too heavily on one pitch — predictable patterns give hitters an advantage."
      />
      <div className="pitch-mix-rows">
        {rows.map(row => (
          <div key={row.type} className="pitch-mix-row">
            <span className="pitch-mix-type">{row.type}</span>
            <div className="pitch-mix-bar-track">
              <div
                className="pitch-mix-bar-fill"
                style={{ width: `${(row.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="pitch-mix-count">{row.count}</span>
            <span className="pitch-mix-pct">{row.pct}%</span>
            <span className="pitch-mix-velo">{row.avgVelo ? `${row.avgVelo} mph` : '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default PitchMix;
