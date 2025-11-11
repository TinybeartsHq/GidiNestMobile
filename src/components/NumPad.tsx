import React from 'react';
import { View, StyleSheet, Pressable, Text as RNText } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeMode } from '../theme/ThemeProvider';
import { theme } from '../theme/theme';

interface NumPadProps {
  onNumberPress: (num: string) => void;
  onBackspace: () => void;
  onBiometric?: () => void;
  showBiometric?: boolean;
  biometricIcon?: 'face-recognition' | 'fingerprint';
}

export default function NumPad({
  onNumberPress,
  onBackspace,
  onBiometric,
  showBiometric = false,
  biometricIcon = 'fingerprint',
}: NumPadProps) {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';

  const buttonBg = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';

  const numbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [showBiometric ? 'bio' : '', '0', 'back'],
  ];

  const renderButton = (value: string) => {
    if (value === '') {
      return <View key="empty" style={styles.button} />;
    }

    if (value === 'bio') {
      return (
        <Pressable
          key="bio"
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: pressed ? buttonBg : 'transparent',
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={onBiometric}
        >
          <MaterialCommunityIcons
            name={biometricIcon as any}
            size={28}
            color={palette.primary}
          />
        </Pressable>
      );
    }

    if (value === 'back') {
      return (
        <Pressable
          key="back"
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: pressed ? buttonBg : 'transparent',
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={onBackspace}
        >
          <MaterialCommunityIcons
            name="backspace-outline"
            size={28}
            color={palette.text}
          />
        </Pressable>
      );
    }

    return (
      <Pressable
        key={value}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: pressed ? buttonBg : 'transparent',
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
        onPress={() => onNumberPress(value)}
      >
        <RNText style={[styles.buttonText, { color: palette.text }]}>
          {value}
        </RNText>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {numbers.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((value) => renderButton(value))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 28,
  },
});
