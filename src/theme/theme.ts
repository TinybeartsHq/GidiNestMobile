import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  colors: {
    primary: '#6b146d', // Brand purple
    primaryLight: '#8B3A8D',
    primaryDark: '#4D0F4F',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
    overlay: 'rgba(107, 20, 109, 0.7)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as const,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold' as const,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
    },
  },
};

// React Native Paper theme
export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: theme.colors.primary,
    primaryContainer: theme.colors.primaryLight,
    secondary: theme.colors.secondary,
    error: theme.colors.error,
    background: theme.colors.background,
    surface: theme.colors.surface,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: theme.colors.text,
    onSurface: theme.colors.text,
  },
};

export type Theme = typeof theme;


