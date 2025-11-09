import React, { useMemo } from 'react';
import { SafeAreaView, View, StyleSheet, ScrollView } from 'react-native';
import { Text, Switch, Divider, Button, useTheme } from 'react-native-paper';
import { useThemeMode } from '../../theme/ThemeProvider';
import { spacing, borderRadius } from '../../theme/theme';

export default function ProfileScreen() {
  const { mode, toggleTheme } = useThemeMode();
  const paperTheme = useTheme();
  const isDark = mode === 'dark';

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: paperTheme.colors.background,
        },
        scrollContent: {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.xl,
          gap: spacing.lg,
        },
        heading: {
          fontFamily: 'Inter_700Bold',
          fontSize: 28,
          color: paperTheme.colors.onBackground,
        },
        subheading: {
          fontFamily: 'Inter_400Regular',
          fontSize: 14,
          color: paperTheme.colors.onSurface,
          opacity: 0.7,
          marginTop: spacing.xs,
        },
        card: {
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          backgroundColor: isDark ? '#111827' : '#FFFFFF',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(148,163,184,0.28)' : 'rgba(148,163,184,0.14)',
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        rowLabel: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 16,
          color: paperTheme.colors.onBackground,
        },
        rowDescription: {
          fontFamily: 'Inter_400Regular',
          fontSize: 13,
          color: paperTheme.colors.onSurface,
          opacity: 0.66,
          marginTop: spacing.xs,
        },
        divider: {
          marginVertical: spacing.md,
        },
        button: {
          marginTop: spacing.md,
          borderRadius: borderRadius.lg,
        },
      }),
    [isDark, paperTheme.colors.background, paperTheme.colors.onBackground, paperTheme.colors.onSurface]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.heading}>Settings & Preferences</Text>
          <Text style={styles.subheading}>
            Tailor GidiNest to feel just right for you and your family.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: spacing.md }}>
              <Text style={styles.rowLabel}>Dark mode</Text>
              <Text style={styles.rowDescription}>
                {isDark
                  ? 'We dimmed the lights for cozy evening planning.'
                  : 'Prefer a softer glow? Switch to the night palette.'}
              </Text>
            </View>
            <Switch value={isDark} onValueChange={toggleTheme} />
          </View>

          <Divider style={styles.divider} />

          <View>
            <Text style={styles.rowLabel}>Notification stories</Text>
            <Text style={styles.rowDescription}>
              Stay inspired with gentle nudges, saving milestones, and family highlights.
            </Text>
            <Button
              mode="contained"
              style={styles.button}
              onPress={() => {}}
            >
              Manage alerts
            </Button>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.rowLabel}>Need a human?</Text>
          <Text style={styles.rowDescription}>
            Our support guides are ready to help you keep the nest thriving.
          </Text>
          <Button
            mode="outlined"
            style={styles.button}
            onPress={() => {}}
          >
            Chat with support
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
