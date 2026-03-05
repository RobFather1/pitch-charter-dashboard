import { memo, useMemo } from 'react';
import './CountGrid.css';

const CountGrid = memo(function CountGrid({ pitches }) {
  const { counts, max } = useMemo(() => {
    const counts = {};
    let max = 0;
    for (const p of pitches) {
      const key = `${Number(p.ballCount)}-${Number(p.strikeCount)}`;
      counts[key] = (counts[key] || 0) + 1;
      if (counts[key] > max) max = counts[key];
    }
    return { counts, max };
  }, [pitches]);

  if (!pitches.length) return null;

  return (
    <div className="count-grid">
      <span className="count-grid-title">Count Distribution</span>
      <div className="count-grid-table">
        {/* Header row: corner + strike column headers */}
        <div className="count-grid-header-row">
          <div className="count-grid-corner">B \ S</div>
          {[0, 1, 2].map(s => (
            <div key={s} className="count-grid-col-header">{s}</div>
          ))}
        </div>
        {/* Data rows, one per ball count */}
        {[0, 1, 2, 3].map(b => (
          <div key={b} className="count-grid-data-row">
            <div className="count-grid-row-header">{b}</div>
            {[0, 1, 2].map(s => {
              const key = `${b}-${s}`;
              const val = counts[key] || 0;
              const intensity = max > 0 ? val / max : 0;
              return (
                <div
                  key={s}
                  className="count-grid-cell"
                  style={{ '--intensity': intensity }}
                  title={`${b}-${s}: ${val} pitch${val !== 1 ? 'es' : ''}`}
                >
                  <span className="count-grid-count-label">{b}-{s}</span>
                  <span className="count-grid-value">{val > 0 ? val : '—'}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <span className="count-grid-axis-note">Rows = Balls · Cols = Strikes</span>
    </div>
  );
});

export default CountGrid;
