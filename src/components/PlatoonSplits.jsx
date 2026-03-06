import { memo, useMemo } from 'react';
import InfoHeader from './InfoHeader.jsx';
import './PlatoonSplits.css';

const STRIKE_ZONE = new Set([7, 8, 9, 12, 13, 14, 17, 18, 19]);

function aggregateGroup(pitches) {
  const byType = {};
  const total = { count: 0, strikes: 0, zone: 0, velocities: [] };

  for (const p of pitches) {
    const type = p.pitchType || 'Other';
    if (!byType[type]) byType[type] = { count: 0, strikes: 0, zone: 0, velocities: [] };
    byType[type].count++;
    total.count++;
    if (p.result === 'Strike') { byType[type].strikes++; total.strikes++; }
    if (STRIKE_ZONE.has(Number(p.zone))) { byType[type].zone++; total.zone++; }
    const v = parseFloat(p.velocity);
    if (!isNaN(v) && v > 0) { byType[type].velocities.push(v); total.velocities.push(v); }
  }

  return { byType, total };
}

function fmtStats(d) {
  if (!d || d.count === 0) return null;
  return {
    count: d.count,
    strikePct: ((d.strikes / d.count) * 100).toFixed(1),
    zonePct: ((d.zone / d.count) * 100).toFixed(1),
    avgVelo: d.velocities.length > 0
      ? (d.velocities.reduce((a, b) => a + b, 0) / d.velocities.length).toFixed(1)
      : null,
  };
}

const PlatoonSplits = memo(function PlatoonSplits({ pitches }) {
  const { typeRows, rhhTotal, lhhTotal } = useMemo(() => {
    if (!pitches.length) return { typeRows: [], rhhTotal: null, lhhTotal: null };

    const rhhPitches = pitches.filter(p => p.batterHand !== 'LHH');
    const lhhPitches = pitches.filter(p => p.batterHand === 'LHH');

    const { byType: rhhByType, total: rhhTotalRaw } = aggregateGroup(rhhPitches);
    const { byType: lhhByType, total: lhhTotalRaw } = aggregateGroup(lhhPitches);

    const allTypes = [...new Set([...Object.keys(rhhByType), ...Object.keys(lhhByType)])];
    allTypes.sort((a, b) => {
      const aTotal = (rhhByType[a]?.count ?? 0) + (lhhByType[a]?.count ?? 0);
      const bTotal = (rhhByType[b]?.count ?? 0) + (lhhByType[b]?.count ?? 0);
      return bTotal - aTotal;
    });

    const typeRows = allTypes.map(type => ({
      type,
      rhh: fmtStats(rhhByType[type]),
      lhh: fmtStats(lhhByType[type]),
    }));

    return {
      typeRows,
      rhhTotal: fmtStats(rhhTotalRaw),
      lhhTotal: fmtStats(lhhTotalRaw),
    };
  }, [pitches]);

  if (!typeRows.length) return null;

  const Cell = ({ stats }) => stats ? (
    <>
      <td>{stats.count}</td>
      <td>{stats.strikePct}%</td>
      <td>{stats.zonePct}%</td>
      <td>{stats.avgVelo ?? '—'}</td>
    </>
  ) : (
    <><td>—</td><td>—</td><td>—</td><td>—</td></>
  );

  return (
    <div className="platoon-splits">
      <InfoHeader
        title="Platoon Splits"
        info="Compares how each pitch type performs against right-handed (RHH) vs. left-handed (LHH) batters. A large gap in strike % or zone % between hands can reveal whether a pitch loses effectiveness against one side of the plate."
      />
      <div className="platoon-table-scroll">
        <table className="platoon-table">
          <thead>
            <tr>
              <th rowSpan={2} className="platoon-type-header">Type</th>
              <th colSpan={4} className="platoon-hand-header rhh-header">vs. RHH</th>
              <th colSpan={4} className="platoon-hand-header lhh-header">vs. LHH</th>
            </tr>
            <tr>
              <th>#</th><th>Strike%</th><th>Zone%</th><th>Avg Velo</th>
              <th>#</th><th>Strike%</th><th>Zone%</th><th>Avg Velo</th>
            </tr>
          </thead>
          <tbody>
            {typeRows.map(row => (
              <tr key={row.type}>
                <td className="platoon-pitch-type">{row.type}</td>
                <Cell stats={row.rhh} />
                <Cell stats={row.lhh} />
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="platoon-total-row">
              <td>Total</td>
              <Cell stats={rhhTotal} />
              <Cell stats={lhhTotal} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
});

export default PlatoonSplits;
