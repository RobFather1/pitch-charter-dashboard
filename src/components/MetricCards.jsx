import { memo, useMemo } from 'react';
import './MetricCards.css';

const STRIKE_ZONE = new Set([7, 8, 9, 12, 13, 14, 17, 18, 19]);

function computeMetrics(pitches) {
  const total = pitches.length;
  if (total === 0) {
    return {
      totalPitches: 0,
      strikePercent: '—',
      fpStrikePercent: '—',
      avgVelocity: '—',
      maxVelocity: '—',
      zonePercent: '—',
      twoStrikePercent: '—',
    };
  }

  const strikes = pitches.filter(p => p.result === 'Strike').length;
  const strikePercent = ((strikes / total) * 100).toFixed(1);

  // First-pitch: count === 0-0
  const firstPitches = pitches.filter(p => Number(p.ballCount) === 0 && Number(p.strikeCount) === 0);
  const fpStrikes = firstPitches.filter(p => p.result === 'Strike').length;
  const fpStrikePercent = firstPitches.length > 0
    ? ((fpStrikes / firstPitches.length) * 100).toFixed(1)
    : '—';

  const velocities = pitches
    .map(p => parseFloat(p.velocity))
    .filter(v => !isNaN(v) && v > 0);

  const avgVelocity = velocities.length > 0
    ? (velocities.reduce((a, b) => a + b, 0) / velocities.length).toFixed(1)
    : '—';

  const maxVelocity = velocities.length > 0
    ? Math.max(...velocities).toFixed(1)
    : '—';

  // Zone %: pitches thrown in the strike zone (inner 3×3 of 5×5 grid)
  const zonePitches = pitches.filter(p => STRIKE_ZONE.has(Number(p.zone)));
  const zonePercent = ((zonePitches.length / total) * 100).toFixed(1);

  // 2-Strike Strike %: put-away rate when pitcher has 2 strikes
  const twoStrikePitches = pitches.filter(p => Number(p.strikeCount) === 2);
  const twoStrikePercent = twoStrikePitches.length > 0
    ? ((twoStrikePitches.filter(p => p.result === 'Strike').length / twoStrikePitches.length) * 100).toFixed(1)
    : '—';

  return { totalPitches: total, strikePercent, fpStrikePercent, avgVelocity, maxVelocity, zonePercent, twoStrikePercent };
}

const MetricCards = memo(function MetricCards({ pitches }) {
  const metrics = useMemo(() => computeMetrics(pitches), [pitches]);

  return (
    <div className="metric-cards">
      <MetricCard label="Total Pitches" value={metrics.totalPitches} />
      <MetricCard label="Strike %" value={metrics.strikePercent} unit="%" />
      <MetricCard label="1st Pitch Strike %" value={metrics.fpStrikePercent} unit="%" />
      <MetricCard label="Zone %" value={metrics.zonePercent} unit="%" />
      <MetricCard label="2-Strike Strike %" value={metrics.twoStrikePercent} unit="%" />
      <MetricCard label="Avg Velocity" value={metrics.avgVelocity} unit="mph" />
      <MetricCard label="Max Velocity" value={metrics.maxVelocity} unit="mph" />
    </div>
  );
});

function MetricCard({ label, value, unit }) {
  return (
    <div className="metric-card">
      <span className="metric-label">{label}</span>
      <span className="metric-value">
        {value}
        {unit && <span className="metric-unit">{unit}</span>}
      </span>
    </div>
  );
}

export default MetricCards;
