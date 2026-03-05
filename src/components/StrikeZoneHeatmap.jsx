import { memo, useMemo } from 'react';
import './StrikeZoneHeatmap.css';

const GRID_SIZE = 5;
// Zones 7–9, 12–14, 17–19 = inner 3×3 = strike zone (matches pitch-charter source)
const STRIKE_ZONES = new Set([7, 8, 9, 12, 13, 14, 17, 18, 19]);

function buildZoneCounts(pitches) {
  const counts = new Map();
  for (const pitch of pitches) {
    const zone = Number(pitch.zone);
    if (!zone) continue;
    counts.set(zone, (counts.get(zone) ?? 0) + 1);
  }
  return counts;
}

function getHeatColor(count, maxCount, isStrike) {
  if (count === 0) {
    return isStrike ? 'var(--heatmap-empty-strike)' : 'var(--heatmap-empty-ball)';
  }
  const ratio = maxCount > 0 ? count / maxCount : 0;

  if (ratio < 0.5) {
    // Blue → Yellow
    const t = ratio / 0.5;
    const r = Math.round(59  + t * (251 - 59));
    const g = Math.round(130 + t * (191 - 130));
    const b = Math.round(246 + t * (36  - 246));
    return `rgb(${r},${g},${b})`;
  } else {
    // Yellow → Red
    const t = (ratio - 0.5) / 0.5;
    const r = Math.round(251 + t * (220 - 251));
    const g = Math.round(191 + t * (38  - 191));
    const b = Math.round(36  + t * (38  - 36));
    return `rgb(${r},${g},${b})`;
  }
}

const StrikeZoneHeatmap = memo(function StrikeZoneHeatmap({ pitches }) {
  const { zoneCounts, maxCount } = useMemo(() => {
    const counts = buildZoneCounts(pitches);
    const maxCount = counts.size > 0 ? Math.max(...counts.values()) : 0;
    return { zoneCounts: counts, maxCount };
  }, [pitches]);

  return (
    <div className="heatmap-container">
      <div className="heatmap-title">Strike Zone Heatmap</div>
      <div className="heatmap-grid">
        {Array.from({ length: GRID_SIZE }, (_, row) =>
          Array.from({ length: GRID_SIZE }, (_, col) => {
            const zoneNum = row * GRID_SIZE + col + 1;
            const isStrike = STRIKE_ZONES.has(zoneNum);
            const count = zoneCounts.get(zoneNum) ?? 0;
            const bgColor = getHeatColor(count, maxCount, isStrike);

            return (
              <div
                key={zoneNum}
                className={`heatmap-cell ${isStrike ? 'strike-zone' : 'ball-zone'}`}
                style={{ backgroundColor: bgColor }}
                title={`Zone ${zoneNum}: ${count} pitch${count !== 1 ? 'es' : ''}`}
              >
                <span className="zone-number">{zoneNum}</span>
                {count > 0 && <span className="zone-count">{count}</span>}
              </div>
            );
          })
        )}
      </div>

      {/* Home plate — ported from pitch-charter/src/components/StrikeZone.js */}
      <div className="home-plate">
        <svg width="72" height="36" viewBox="0 0 80 40">
          <polygon
            points="10,0 70,0 70,20 40,38 10,20"
            fill="var(--bg-surface)"
            stroke="var(--border-color)"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="heatmap-legend">
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: 'var(--heatmap-low)' }} />
          Low
        </span>
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: 'var(--heatmap-mid)' }} />
          Mid
        </span>
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: 'var(--heatmap-high)' }} />
          High
        </span>
      </div>
    </div>
  );
});

export default StrikeZoneHeatmap;
