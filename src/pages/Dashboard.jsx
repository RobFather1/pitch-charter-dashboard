import { useState, useEffect, useCallback } from 'react';
import API_BASE from '../config.js';
import MetricCards from '../components/MetricCards.jsx';
import StrikeZoneHeatmap from '../components/StrikeZoneHeatmap.jsx';
import './Dashboard.css';

const PITCH_TYPES = ['All', 'FB', 'CV', 'SL', 'CH'];
const RESULTS = ['All', 'Strike', 'Ball'];

function Dashboard() {
  const [gameID, setGameID] = useState('');
  const [submittedGameID, setSubmittedGameID] = useState('');
  const [pitches, setPitches] = useState([]);
  const [gameInfo, setGameInfo] = useState(null);
  const [pitchers, setPitchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedPitcher, setSelectedPitcher] = useState('All');
  const [selectedPitchType, setSelectedPitchType] = useState('All');
  const [selectedResult, setSelectedResult] = useState('All');

  useEffect(() => {
    if (!submittedGameID) return;

    const controller = new AbortController();
    const { signal } = controller;

    setLoading(true);
    setError(null);
    setPitches([]);
    setGameInfo(null);

    // Parallel fetch — no waterfall (React BP Priority 1)
    Promise.all([
      fetch(`${API_BASE}/pitches?gameID=${encodeURIComponent(submittedGameID)}`, { signal }),
      fetch(`${API_BASE}/roster?teamID=main`, { signal }),
      fetch(`${API_BASE}/games?gameID=${encodeURIComponent(submittedGameID)}`, { signal }),
    ])
      .then(async ([pitchesRes, rosterRes, gameRes]) => {
        if (!pitchesRes.ok) throw new Error(`Failed to load pitches (${pitchesRes.status})`);
        if (!rosterRes.ok) throw new Error(`Failed to load roster (${rosterRes.status})`);

        const [pitchData, rosterData, gameData] = await Promise.all([
          pitchesRes.json(),
          rosterRes.json(),
          gameRes.ok ? gameRes.json() : Promise.resolve(null),
        ]);

        setPitches(Array.isArray(pitchData) ? pitchData : []);
        setPitchers(Array.isArray(rosterData) ? rosterData : []);
        setGameInfo(gameData);
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        setError(err.message);
      })
      .finally(() => {
        if (!signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [submittedGameID]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const trimmed = gameID.trim();
    if (!trimmed) return;
    setSelectedPitcher('All');
    setSelectedPitchType('All');
    setSelectedResult('All');
    setSubmittedGameID(trimmed);
  }, [gameID]);

  // Derived filtered pitches — no separate state, computed inline
  const filteredPitches = pitches.filter(p => {
    if (selectedPitcher !== 'All' && p.pitcherName !== selectedPitcher) return false;
    if (selectedPitchType !== 'All' && p.pitchType !== selectedPitchType) return false;
    if (selectedResult !== 'All' && p.result !== selectedResult) return false;
    return true;
  });

  const pitcherNames = ['All', ...new Set(pitches.map(p => p.pitcherName).filter(Boolean))];
  const hasData = pitches.length > 0;

  return (
    <div className="dashboard">
      {/* Game ID Input */}
      <form className="game-id-form" onSubmit={handleSubmit}>
        <label htmlFor="gameID">Game ID</label>
        <div className="game-id-input-row">
          <input
            id="gameID"
            type="text"
            placeholder="e.g. 2025-06-01-G1"
            value={gameID}
            onChange={e => setGameID(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" disabled={loading || !gameID.trim()}>
            {loading ? 'Loading…' : 'Load Game'}
          </button>
        </div>
      </form>

      {error && <div className="error-banner">{error}</div>}

      {/* Game header once data is loaded */}
      {hasData && (
        <div className="game-info-header">
          <h2>
            {gameInfo?.opponent ? `vs. ${gameInfo.opponent}` : submittedGameID}
          </h2>
          <div className="game-info-sub">
            {gameInfo?.gameDate && <span>{gameInfo.gameDate}</span>}
            {gameInfo?.gameNumber && <span> · Game {gameInfo.gameNumber}</span>}
            <span> · {pitches.length} pitches logged</span>
          </div>
        </div>
      )}

      {/* Filters */}
      {hasData && (
        <div className="filter-bar">
          <FilterSelect
            label="Pitcher"
            options={pitcherNames}
            value={selectedPitcher}
            onChange={setSelectedPitcher}
          />
          <FilterSelect
            label="Pitch Type"
            options={PITCH_TYPES}
            value={selectedPitchType}
            onChange={setSelectedPitchType}
          />
          <FilterSelect
            label="Result"
            options={RESULTS}
            value={selectedResult}
            onChange={setSelectedResult}
          />
          <div className="filter-pitch-count">
            Showing <strong>{filteredPitches.length}</strong> of {pitches.length} pitches
          </div>
        </div>
      )}

      {/* Main content */}
      {hasData && (
        <div className="dashboard-content">
          <MetricCards pitches={filteredPitches} />
          <StrikeZoneHeatmap pitches={filteredPitches} />
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="loading-state">Loading game data…</div>
      )}

      {/* Empty state */}
      {!loading && submittedGameID && !hasData && !error && (
        <div className="empty-state">
          <p>No pitches found for <strong>{submittedGameID}</strong></p>
          <p className="empty-hint">Check the game ID format: YYYY-MM-DD-G1</p>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, options, value, onChange }) {
  return (
    <div className="filter-item">
      <label>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

export default Dashboard;
