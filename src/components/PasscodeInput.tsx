import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeMode } from '../theme/ThemeProvider';
import { theme } from '../theme/theme';

interface PasscodeInputProps {
  length: number;
  value: string;
}

export default function PasscodeInput({ length, value }: PasscodeInputProps) {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';

  const dots = Array.from({ length }, (_, index) => {
    const isFilled = index < value.length;
    return (
      <View
        key={index}
        style={[
          styles.dot,
          {
            borderColor: isFilled
              ? palette.primary
              : isDark
              ? 'rgba(148, 163, 184, 0.3)'
              : 'rgba(100, 116, 139, 0.3)',
            backgroundColor: isFilled ? palette.primary : 'transparent',
          },
        ]}
      />
    );
  });

  return <View style={styles.container}>{dots}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
});
