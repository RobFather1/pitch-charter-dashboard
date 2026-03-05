import { memo, useMemo } from 'react';
import './SplitStatsTable.css';

const STRIKE_ZONE = new Set([7, 8, 9, 12, 13, 14, 17, 18, 19]);

const SplitStatsTable = memo(function SplitStatsTable({ pitches }) {
  const rows = useMemo(() => {
    if (!pitches.length) return [];

    const byType = {};
    for (const p of pitches) {
      const t = p.pitchType || 'Other';
      if (!byType[t]) byType[t] = { count: 0, strikes: 0, zone: 0, velocities: [] };
      byType[t].count++;
      if (p.result === 'Strike') byType[t].strikes++;
      if (STRIKE_ZONE.has(Number(p.zone))) byType[t].zone++;
      const v = parseFloat(p.velocity);
      if (!isNaN(v) && v > 0) byType[t].velocities.push(v);
    }

    return Object.entries(byType)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([type, d]) => ({
        type,
        count: d.count,
        strikePct: ((d.strikes / d.count) * 100).toFixed(1),
        zonePct: ((d.zone / d.count) * 100).toFixed(1),
        avgVelo: d.velocities.length > 0
          ? (d.velocities.reduce((a, b) => a + b, 0) / d.velocities.length).toFixed(1)
          : null,
      }));
  }, [pitches]);

  if (!rows.length) return null;

  return (
    <div className="split-stats">
      <span className="split-stats-title">Split Stats by Pitch Type</span>
      <table className="split-stats-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Pitches</th>
            <th>Strike %</th>
            <th>Zone %</th>
            <th>Avg Velo</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.type}>
              <td className="split-type-cell">{row.type}</td>
              <td>{row.count}</td>
              <td>{row.strikePct}%</td>
              <td>{row.zonePct}%</td>
              <td>{row.avgVelo ? `${row.avgVelo} mph` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default SplitStatsTable;
