import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themePreference, setThemePreference] = useState(() => {
    const saved = localStorage.getItem('zad_theme_pref');
    if (saved === 'ramadan' || saved === 'default' || saved === 'auto') return saved;
    return 'default';
  });

  const [theme, setTheme] = useState('default');

  // Light / Dark color mode (independent from Ramadan mode)
  const [colorMode, setColorMode] = useState(() => {
    const saved = localStorage.getItem('zad_color_mode');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('zad_theme_pref', themePreference);
    localStorage.setItem('zad_color_mode', colorMode);

    let effectiveTheme = themePreference;
    if (themePreference === 'auto') {
      try {
        // Use Intl to get Hijri month (9 is Ramadan)
        const hijriMonthStr = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { month: 'numeric' }).format(new Date());
        const hijriMonth = parseInt(hijriMonthStr, 10);
        effectiveTheme = hijriMonth === 9 ? 'ramadan' : 'default';
      } catch (e) {
        effectiveTheme = 'default';
      }
    }

    setTheme(effectiveTheme);

    const root = document.documentElement;
    root.removeAttribute('data-theme');

    if (effectiveTheme === 'ramadan') {
      root.setAttribute('data-theme', 'ramadan');
    } else if (colorMode === 'dark') {
      root.setAttribute('data-theme', 'dark');
    }
  }, [themePreference, colorMode]);

  const cycleThemePreference = () => {
    setThemePreference((prev) => {
      if (prev === 'auto') return 'ramadan';
      if (prev === 'ramadan') return 'default';
      return 'auto';
    });
  };

  const toggleColorMode = () => {
    setColorMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setRamadanMode = (on) => {
    setThemePreference(on ? 'ramadan' : 'default');
  };

  return (
    <ThemeContext.Provider value={{ theme, themePreference, cycleThemePreference, setThemePreference, setRamadanMode, colorMode, toggleColorMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
