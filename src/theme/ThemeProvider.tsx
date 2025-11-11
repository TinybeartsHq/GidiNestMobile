import React, { createContext, useContext, useMemo, useState } from 'react';
import { PaperProvider } from 'react-native-paper';
import {
  AppColorPalette,
  ThemeMode,
  createPaperTheme,
  getAppColors,
} from './theme';

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  palette: AppColorPalette;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>('dark'); // Default to dark mode

  const palette = useMemo(() => getAppColors(mode), [mode]);
  const paperTheme = useMemo(() => createPaperTheme(mode), [mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      setMode,
      toggleTheme: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
      palette,
    }),
    [mode, palette]
  );

  return (
    <ThemeContext.Provider value={value}>
      <PaperProvider theme={paperTheme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
}
