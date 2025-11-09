import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';

export type ThemeMode = 'light' | 'dark';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    fontFamily: 'Inter_700Bold' as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    fontFamily: 'Inter_700Bold' as const,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    fontFamily: 'Inter_400Regular' as const,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    fontFamily: 'Inter_400Regular' as const,
  },
};

const fontConfig = {
  displayLarge: { fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  displayMedium: { fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  displaySmall: { fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  headlineLarge: { fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  headlineMedium: { fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  headlineSmall: { fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  titleLarge: { fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  titleMedium: { fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  titleSmall: { fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
  labelLarge: { fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  labelMedium: { fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
  labelSmall: { fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
  bodyLarge: { fontFamily: 'Inter_400Regular', fontWeight: '400' as const },
  bodyMedium: { fontFamily: 'Inter_400Regular', fontWeight: '400' as const },
  bodySmall: { fontFamily: 'Inter_400Regular', fontWeight: '400' as const },
};

const lightPalette = {
  primary: '#6b146d',
  primaryLight: '#8B3A8D',
  primaryDark: '#4D0F4F',
  secondary: '#5856D6',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#FDF4FF',
  card: '#FFFFFF',
  cardMuted: '#F8F5FF',
  text: '#0F172A',
  textSecondary: '#475569',
  border: 'rgba(148, 163, 184, 0.16)',
  overlay: 'rgba(107, 20, 109, 0.7)',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
};

const darkPalette = {
  primary: '#C084FC',
  primaryLight: '#D8B4FE',
  primaryDark: '#A855F7',
  secondary: '#A5B4FC',
  background: '#020617',
  surface: '#0F172A',
  surfaceMuted: '#111827',
  card: '#111827',
  cardMuted: '#1E293B',
  text: '#E2E8F0',
  textSecondary: '#94A3B8',
  border: 'rgba(148, 163, 184, 0.28)',
  overlay: 'rgba(12, 10, 30, 0.75)',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  onPrimary: '#1E1B4B',
  onSecondary: '#0B1120',
};

export type AppColorPalette = typeof lightPalette;

export const getAppColors = (mode: ThemeMode): AppColorPalette =>
  mode === 'dark' ? darkPalette : lightPalette;

export const theme = {
  colors: lightPalette,
  spacing,
  borderRadius,
  typography,
};

export const createPaperTheme = (mode: ThemeMode) => {
  const base = mode === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const palette = getAppColors(mode);

  return {
    ...base,
    dark: mode === 'dark',
    colors: {
      ...base.colors,
      primary: palette.primary,
      primaryContainer: palette.primaryLight,
      secondary: palette.secondary,
      background: palette.background,
      surface: palette.surface,
      surfaceVariant: palette.surfaceMuted,
      error: palette.error,
      onPrimary: palette.onPrimary,
      onSecondary: palette.onSecondary,
      onBackground: palette.text,
      onSurface: palette.text,
      outline: palette.border,
      outlineVariant: palette.border,
    },
    fonts: configureFonts({ config: fontConfig }),
  };
};

export type Theme = typeof theme;