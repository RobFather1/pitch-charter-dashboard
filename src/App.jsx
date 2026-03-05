import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTheme } from './context/ThemeContext.jsx';
import Dashboard from './pages/Dashboard.jsx';
import './App.css';

function App() {
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className="app-shell" data-theme={darkMode ? 'dark' : 'light'}>
      <nav className="navbar">
        <span className="navbar-brand">
          Pitch Charter
          <span>Dashboard</span>
        </span>
        <button
          className="theme-toggle"
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
        >
          <span className="theme-toggle-icon">{darkMode ? '☀' : '◑'}</span>
          {darkMode ? 'Light' : 'Dark'}
        </button>
      </nav>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

function NotFound() {
  return (
    <div className="not-found">
      <p>Page not found.</p>
      <a href="/">Return to dashboard</a>
    </div>
  );
}

export default App;
