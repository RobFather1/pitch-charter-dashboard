import { memo, useMemo } from 'react';
import InfoHeader from './InfoHeader.jsx';
import './CountSituations.css';

const AHEAD = new Set(['0-1', '0-2', '1-2']);
const EVEN  = new Set(['0-0', '1-1', '2-2']);

const BUCKETS = [
  { key: 'ahead', label: 'Ahead',  counts: '0-1 · 0-2 · 1-2' },
  { key: 'even',  label: 'Even',   counts: '0-0 · 1-1 · 2-2' },
  { key: 'behind',label: 'Behind', counts: '1-0 · 2-0 · 3-0 · 2-1 · 3-1' },
];

const CountSituations = memo(function CountSituations({ pitches }) {
  const rows = useMemo(() => {
    if (!pitches.length) return null;

    const data = {
      ahead:  { total: 0, strikes: 0 },
      even:   { total: 0, strikes: 0 },
      behind: { total: 0, strikes: 0 },
    };

    for (const p of pitches) {
      const key = `${Number(p.ballCount)}-${Number(p.strikeCount)}`;
      const bucket = AHEAD.has(key) ? 'ahead' : EVEN.has(key) ? 'even' : 'behind';
      data[bucket].total++;
      if (p.result === 'Strike') data[bucket].strikes++;
    }

    const total = pitches.length;
    return BUCKETS.map(({ key, label, counts }) => ({
      key,
      label,
      counts,
      pitches: data[key].total,
      pct: ((data[key].total / total) * 100).toFixed(1),
      strikePct: data[key].total > 0
        ? ((data[key].strikes / data[key].total) * 100).toFixed(1)
        : '—',
    }));
  }, [pitches]);

  if (!rows) return null;

  return (
    <div className="count-situations">
      <InfoHeader
        title="Count Situations"
        info="Groups every pitch into three leverage situations. Ahead means the pitcher has more strikes than balls — they're in control. Even means equal balls and strikes — neutral. Behind means more balls than strikes — the hitter has the edge. Strike % shows how well the pitcher competes when it matters most."
      />
      <table className="count-situations-table">
        <thead>
          <tr>
            <th>Situation</th>
            <th>Pitches</th>
            <th>%</th>
            <th>Strike %</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.key}>
              <td>
                <span className={`situation-label situation-${row.key}`}>{row.label}</span>
                <span className="situation-counts">{row.counts}</span>
              </td>
              <td>{row.pitches}</td>
              <td>{row.pct}%</td>
              <td>{row.strikePct !== '—' ? `${row.strikePct}%` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default CountSituations;
