import React from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';

const { height } = Dimensions.get('window');

const featurePoints = [
  { icon: 'baby-face-outline', label: 'Delivery day' },
  { icon: 'hand-heart', label: 'Baby essentials' },
  { icon: 'heart-pulse', label: 'Aftercare' },
];

export default function AuthLandingScreen() {
  const navigation = useNavigation();
  const paperTheme = useTheme();
  const { palette, mode, toggleTheme } = useThemeMode();
  const isDark = mode === 'dark';

  const heroGradient = isDark
    ? ['rgba(43, 14, 61, 0.95)', 'rgba(12, 10, 30, 0.85)', 'rgba(2, 6, 23, 0.9)']
    : ['rgba(245, 239, 255, 1)', 'rgba(241, 248, 255, 0.92)', 'rgba(248, 250, 252, 0.95)'];

  const heroCardGradient = isDark
    ? ['rgba(124, 58, 237, 0.32)', 'rgba(37, 13, 52, 0.92)']
    : ['rgba(128, 90, 240, 0.16)', 'rgba(255, 255, 255, 0.9)'];

  const featureTint = isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(100, 116, 139, 0.08)';
  const actionTint = isDark ? ['rgba(124, 58, 237, 0.24)', 'rgba(17, 24, 39, 0.72)'] : ['rgba(123, 97, 255, 0.18)', 'rgba(255, 255, 255, 0.92)'];

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <LinearGradient colors={heroGradient} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={[styles.topBar, { borderColor: palette.border }]}>
          <Text style={[styles.topBadge, { color: palette.primary }]}>GidiNest</Text>
          <Pressable
            style={[styles.modeToggle, { borderColor: palette.border }]}
            onPress={toggleTheme}
            accessibilityRole="button"
            accessibilityLabel="Toggle theme"
          >
            <MaterialCommunityIcons
              name={isDark ? 'weather-sunny' : 'moon-waning-crescent'}
              size={16}
              color={palette.text}
            />
          </Pressable>
        </View>

        <View style={styles.content}>
          <LinearGradient colors={heroCardGradient} style={[styles.heroCard, { borderColor: palette.border }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={[styles.heroBadge, { backgroundColor: featureTint }]}>
              <MaterialCommunityIcons name="refresh-auto" size={14} color={palette.primary} />
              <Text style={[styles.heroBadgeText, { color: palette.primary }]}>Baby-day ready</Text>
            </View>
            <Text style={[styles.title, { color: palette.text }]}>Baby-day savings, on autopilot.</Text>
            <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
              Build a calm buffer for delivery day, little essentials, and the aftercare you deserve.
            </Text>
            <View style={styles.featureRow}>
              {featurePoints.map((item) => (
                <View key={item.label} style={[styles.featureChip, { backgroundColor: featureTint }]}>
                  <MaterialCommunityIcons name={item.icon as never} size={16} color={palette.text} />
                  <Text style={[styles.featureLabel, { color: palette.text }]}>{item.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          <View style={styles.actionsShell}>
            <LinearGradient colors={actionTint} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
            <Button
              mode="contained"
              onPress={() => navigation.navigate('SignIn' as never)}
              style={styles.primaryButton}
              contentStyle={styles.primaryContent}
              buttonColor={palette.primary}
              textColor="#FFFFFF"
              labelStyle={styles.primaryLabel}
            >
              Log in
            </Button>
            <Button
              mode="contained-tonal"
              onPress={() => navigation.navigate('SignIn' as never)}
              style={[styles.secondaryButton, { backgroundColor: palette.card }]}
              contentStyle={styles.secondaryContent}
              textColor={palette.text}
              icon="apple"
              labelStyle={styles.secondaryLabel}
            >
              Sign in with Apple
            </Button>
            <Button
              mode="text"
              onPress={() => navigation.navigate('SignUp' as never)}
              textColor={paperTheme.colors.primary}
              labelStyle={styles.linkLabel}
            >
              Create a new GidiNest account
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  topBar: {
    width: '100%',
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBadge: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
    letterSpacing: 0.6,
  },
  modeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  heroCard: {
    width: '100%',
    borderRadius: theme.borderRadius.xl + 8,
    padding: theme.spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: theme.spacing.lg,
    overflow: 'hidden',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
  },
  heroBadgeText: {
    fontFamily: 'NeuzeitGro-Medium',
    fontSize: 12,
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: 'NeuzeitGro-ExtraBold',
    fontSize: 32,
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  featureRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.lg,
  },
  featureLabel: {
    fontFamily: 'NeuzeitGro-Medium',
    fontSize: 13,
  },
  actionsShell: {
    width: '100%',
    borderRadius: theme.borderRadius.xl + 2,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    overflow: 'hidden',
    shadowColor: '#00000018',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 16 },
  },
  primaryButton: {
    borderRadius: theme.borderRadius.xl,
    elevation: 6,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.32,
    shadowRadius: 24,
  },
  primaryContent: {
    paddingVertical: theme.spacing.md,
  },
  primaryLabel: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 16,
  },
  secondaryButton: {
    borderRadius: theme.borderRadius.xl,
    elevation: 3,
  },
  secondaryContent: {
    paddingVertical: theme.spacing.md,
  },
  secondaryLabel: {
    fontFamily: 'NeuzeitGro-Medium',
    fontSize: 15,
  },
  linkLabel: {
    fontFamily: 'NeuzeitGro-Medium',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
