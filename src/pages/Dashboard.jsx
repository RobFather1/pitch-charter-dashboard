import { useState, useEffect, useMemo } from 'react';
import API_BASE, { API_KEY } from '../config.js';
import MetricCards from '../components/MetricCards.jsx';
import StrikeZoneHeatmap from '../components/StrikeZoneHeatmap.jsx';
import PitchMix from '../components/PitchMix.jsx';
import SplitStatsTable from '../components/SplitStatsTable.jsx';
import CountGrid from '../components/CountGrid.jsx';
import CountSituations from '../components/CountSituations.jsx';
import PlatoonSplits from '../components/PlatoonSplits.jsx';
import VelocityTrend from '../components/VelocityTrend.jsx';
import './Dashboard.css';

const API_HEADERS = API_KEY ? { 'x-api-key': API_KEY } : {};
const RESULTS = ['All', 'Strike', 'Ball'];
const COUNTS = ['All Count', '0-0', '0-1', '0-2', '1-0', '1-1', '1-2', '2-0', '2-1', '2-2', '3-0', '3-1', '3-2'];

function formatGameLabel(game) {
  const parts = (game.gameDate || '').split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = parts[1] ? (monthNames[parseInt(parts[1], 10) - 1] || parts[1]) : '';
  const day = parts[2] ? parseInt(parts[2], 10) : '';
  const datePart = monthName && day ? `${monthName} ${day}` : (game.gameDate || game.gameID);
  const opponentPart = game.opponent ? `vs. ${game.opponent}` : game.gameID;
  const gamePart = game.gameNumber ? ` · G${game.gameNumber}` : '';
  return `${datePart} ${opponentPart}${gamePart}`;
}

function Dashboard() {
  const [allGames, setAllGames] = useState([]);
  const [submittedGameID, setSubmittedGameID] = useState('');
  const [pitches, setPitches] = useState([]);
  const [gameInfo, setGameInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedPitcher, setSelectedPitcher] = useState('All');
  const [selectedPitchType, setSelectedPitchType] = useState('All');
  const [selectedResult, setSelectedResult] = useState('All');
  const [selectedCount, setSelectedCount] = useState('All Count');
  const [selectedHand, setSelectedHand] = useState('All');

  // Fetch all games on mount to populate the selector
  useEffect(() => {
    fetch(`${API_BASE}/games`, { headers: API_HEADERS })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const games = Array.isArray(data) ? data : [];
        games.sort((a, b) => (b.gameDate || '').localeCompare(a.gameDate || ''));
        setAllGames(games);
      })
      .catch(() => {});
  }, []);

  // Fetch pitches when a game is selected (or all games)
  useEffect(() => {
    if (!submittedGameID) return;

    const controller = new AbortController();
    const { signal } = controller;

    setLoading(true);
    setError(null);
    setPitches([]);
    setGameInfo(null);

    const isAllGames = submittedGameID === 'ALL_GAMES';
    const pitchUrl = isAllGames
      ? `${API_BASE}/pitches`
      : `${API_BASE}/pitches?gameID=${encodeURIComponent(submittedGameID)}`;
    const gameUrl = isAllGames
      ? null
      : `${API_BASE}/games?gameID=${encodeURIComponent(submittedGameID)}`;

    Promise.all([
      fetch(pitchUrl, { signal, headers: API_HEADERS }),
      gameUrl ? fetch(gameUrl, { signal, headers: API_HEADERS }) : Promise.resolve(null),
    ])
      .then(async ([pitchesRes, gameRes]) => {
        if (!pitchesRes.ok) throw new Error(`Failed to load pitches (${pitchesRes.status})`);

        const [pitchData, gameData] = await Promise.all([
          pitchesRes.json(),
          gameRes?.ok ? gameRes.json() : Promise.resolve(null),
        ]);

        setPitches(Array.isArray(pitchData) ? pitchData : []);
        setGameInfo(gameData);
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        setError('Failed to load game data. Please try again.');
      })
      .finally(() => {
        if (!signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [submittedGameID]);

  const handleGameSelect = (gameID) => {
    if (!gameID) return;
    setSelectedPitcher('All');
    setSelectedPitchType('All');
    setSelectedResult('All');
    setSelectedCount('All Count');
    setSelectedHand('All');
    setSubmittedGameID(gameID);
  };

  const pitcherNames = useMemo(
    () => ['All', ...new Set(pitches.map(p => p.pitcherName).filter(Boolean))],
    [pitches]
  );

  const pitchTypes = useMemo(
    () => ['All', ...new Set(pitches.map(p => p.pitchType).filter(Boolean))],
    [pitches]
  );

  const filteredPitches = useMemo(() => pitches.filter(p => {
    if (selectedPitcher !== 'All' && p.pitcherName !== selectedPitcher) return false;
    if (selectedPitchType !== 'All' && p.pitchType !== selectedPitchType) return false;
    if (selectedResult !== 'All' && p.result !== selectedResult) return false;
    if (selectedCount !== 'All Count') {
      const [b, s] = selectedCount.split('-');
      if (Number(p.ballCount) !== Number(b) || Number(p.strikeCount) !== Number(s)) return false;
    }
    if (selectedHand !== 'All' && p.batterHand !== selectedHand) return false;
    return true;
  }), [pitches, selectedPitcher, selectedPitchType, selectedResult, selectedCount, selectedHand]);

  const hasData = pitches.length > 0;

  return (
    <div className="dashboard">
      {/* Game Selector */}
      <div className="game-selector">
        <label className="game-selector-label" htmlFor="game-select">Select a Game</label>
        <select
          id="game-select"
          className="game-select"
          value={submittedGameID}
          onChange={e => handleGameSelect(e.target.value)}
          disabled={loading || allGames.length === 0}
        >
          <option value="">{allGames.length === 0 ? 'Loading games…' : '— Select a game —'}</option>
          <option value="ALL_GAMES">All Games</option>
          {allGames.map(g => (
            <option key={g.gameID} value={g.gameID}>{formatGameLabel(g)}</option>
          ))}
        </select>
      </div>

      <div className="section-header">
        <h3 className="section-header-title">Heatmap</h3>
        <p className="section-header-sub">Interactive strike zone heatmaps showing pitch location patterns and effectiveness.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Game header once data is loaded */}
      {hasData && (
        <div className="game-info-header">
          <h2>
            {submittedGameID === 'ALL_GAMES'
              ? 'All Games'
              : gameInfo?.opponent ? `vs. ${gameInfo.opponent}` : submittedGameID}
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
            options={pitchTypes}
            value={selectedPitchType}
            onChange={setSelectedPitchType}
          />
          <FilterSelect
            label="Result"
            options={RESULTS}
            value={selectedResult}
            onChange={setSelectedResult}
          />
          <FilterSelect
            label="Count"
            options={COUNTS}
            value={selectedCount}
            onChange={setSelectedCount}
          />
          <FilterSelect
            label="Batter"
            options={['All', 'RHH', 'LHH']}
            value={selectedHand}
            onChange={setSelectedHand}
          />
          <div className="filter-pitch-count">
            Showing <strong>{filteredPitches.length}</strong> of {pitches.length} pitches
          </div>
        </div>
      )}

      {/* Main content */}
      {hasData && (
        <>
          <div className="dashboard-content">
            <MetricCards pitches={filteredPitches} />
            <StrikeZoneHeatmap pitches={filteredPitches} />
          </div>
          <div className="analytics-row">
            <PitchMix pitches={filteredPitches} />
            <CountGrid pitches={filteredPitches} />
            <CountSituations pitches={filteredPitches} />
          </div>
          <SplitStatsTable pitches={filteredPitches} />
          <PlatoonSplits pitches={filteredPitches} />
          <VelocityTrend pitches={filteredPitches} />
        </>
      )}

      {/* Loading state */}
      {loading && (
        <div className="loading-state">Loading game data…</div>
      )}

      {/* Empty state */}
      {!loading && submittedGameID && !hasData && !error && (
        <div className="empty-state">
          <p>No pitches found for <strong>{submittedGameID}</strong></p>
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
