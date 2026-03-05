import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('darkMode', String(next));
      return next;
    });
  }, []);

  const value = useMemo(() => ({ darkMode, toggleDarkMode }), [darkMode, toggleDarkMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
