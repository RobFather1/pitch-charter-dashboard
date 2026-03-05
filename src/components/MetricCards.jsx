import { memo, useMemo } from 'react';
import './MetricCards.css';

function computeMetrics(pitches) {
  const total = pitches.length;
  if (total === 0) {
    return {
      totalPitches: 0,
      strikePercent: '—',
      fpStrikePercent: '—',
      avgVelocity: '—',
      maxVelocity: '—',
    };
  }

  const strikes = pitches.filter(p => p.result === 'Strike').length;
  const strikePercent = ((strikes / total) * 100).toFixed(1);

  // First-pitch: count === 0-0
  const firstPitches = pitches.filter(p => p.ballCount === 0 && p.strikeCount === 0);
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

  return { totalPitches: total, strikePercent, fpStrikePercent, avgVelocity, maxVelocity };
}

const MetricCards = memo(function MetricCards({ pitches }) {
  const metrics = useMemo(() => computeMetrics(pitches), [pitches]);

  return (
    <div className="metric-cards">
      <MetricCard label="Total Pitches" value={metrics.totalPitches} />
      <MetricCard label="Strike %" value={metrics.strikePercent} unit="%" />
      <MetricCard label="1st Pitch Strike %" value={metrics.fpStrikePercent} unit="%" />
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
