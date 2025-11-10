import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text as RNText, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { Surface, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeMode } from '../../theme/ThemeProvider';
import type { RootState } from '../../redux/types';
import { theme } from '../../theme/theme';

const { height } = Dimensions.get('window');

const formatCurrency = (value: number, currency: string) => {
  const mappedCurrency = currency === 'NGN' ? '₦' : currency;
  return `${mappedCurrency}${value.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export default function DashboardScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';

  const analytics = useMemo(() => {
    if (!user || !('dashboardAnalytics' in user)) {
      return {
        totalSavingsBalance: 0,
        activeGoals: 0,
        monthlyContributions: 0,
        currency: '₦',
      };
    }
    return user.dashboardAnalytics;
  }, [user]);

  const heroGradient = isDark
    ? (['rgba(43, 14, 61, 0.95)', 'rgba(12, 10, 30, 0.85)', 'rgba(2, 6, 23, 0.9)'] as const)
    : (['rgba(245, 239, 255, 1)', 'rgba(241, 248, 255, 0.92)', 'rgba(248, 250, 252, 0.95)'] as const);

  const balanceSphereGradient = isDark
    ? (['#6A1B9A', '#4C1D95', '#312E81'] as const)
    : (['#7F5AF0', '#6b146d', '#0EA5E9'] as const);

  const actionTint = isDark
    ? (['rgba(124, 58, 237, 0.28)', 'rgba(17, 24, 39, 0.82)'] as const)
    : (['rgba(123, 97, 255, 0.22)', 'rgba(255, 255, 255, 0.88)'] as const);

  const coinBackground = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.72)';
  const coinIconColor = isDark ? '#A78BFA' : '#6b146d';

  const welcomeName = (user as any)?.first_name ?? (user as any)?.name ?? null;

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <LinearGradient colors={heroGradient} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={[styles.topBar, { borderColor: palette.border }]}>
          <RNText style={[styles.topBadge, { color: palette.primary }]}>
            {welcomeName ? `Hi, ${welcomeName}` : 'Dashboard'}
          </RNText>
          <RNText style={[styles.topMeta, { color: palette.textSecondary }]}>
            Your nest is growing
          </RNText>
          <View style={styles.topActions}>
            <Pressable style={[styles.topIcon, { backgroundColor: isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(100, 116, 139, 0.08)' }]}>
              <MaterialCommunityIcons name="bell-outline" size={18} color={palette.text} />
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Balance Hero */}
          <View style={[styles.heroIllustration, { backgroundColor: balanceSphereGradient[2] }]}>
            <LinearGradient colors={balanceSphereGradient} style={styles.heroSphere} />
            <View style={[styles.coin, styles.coinOne, { backgroundColor: coinBackground }]}>
              <MaterialCommunityIcons name="currency-ngn" size={24} color={coinIconColor} />
            </View>
            <View style={[styles.coin, styles.coinTwo, { backgroundColor: coinBackground }]}>
              <MaterialCommunityIcons name="sprout" size={20} color={coinIconColor} />
            </View>
            <View style={[styles.coin, styles.coinThree, { backgroundColor: coinBackground }]}>
              <MaterialCommunityIcons name="heart" size={18} color={coinIconColor} />
            </View>
          </View>

          {/* Balance Amount */}
          <View style={styles.copyBlock}>
            <RNText style={[styles.balanceValue, { color: palette.text }]}>
              {formatCurrency(analytics.totalSavingsBalance, analytics.currency)}
            </RNText>
            <RNText style={[styles.balanceLabel, { color: palette.textSecondary }]}>
              Total nest balance
            </RNText>
          </View>

          {/* Stats */}
          <View style={styles.statsGrid}>
            <Surface
              style={[styles.statCard, { backgroundColor: palette.card, borderColor: palette.border }]}
              elevation={0}
            >
              <MaterialCommunityIcons name="target" size={20} color={palette.primary} />
              <RNText style={[styles.statValue, { color: palette.text }]}>
                {analytics.activeGoals}
              </RNText>
              <RNText style={[styles.statLabel, { color: palette.textSecondary }]}>
                Goals
              </RNText>
            </Surface>

            <Surface
              style={[styles.statCard, { backgroundColor: palette.card, borderColor: palette.border }]}
              elevation={0}
            >
              <MaterialCommunityIcons name="calendar-month" size={20} color={palette.primary} />
              <RNText style={[styles.statValue, { color: palette.text }]}>
                {formatCurrency(analytics.monthlyContributions, analytics.currency)}
              </RNText>
              <RNText style={[styles.statLabel, { color: palette.textSecondary }]}>
                Monthly
              </RNText>
            </Surface>
          </View>

          {/* Actions */}
          <View style={styles.actionsShell}>
            <LinearGradient colors={actionTint} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
            <Button
              mode="contained"
              icon="plus-circle"
              onPress={() => {}}
              style={styles.primaryButton}
              contentStyle={styles.primaryContent}
              buttonColor={palette.primary}
              textColor="#FFFFFF"
              labelStyle={styles.primaryLabel}
            >
              Add savings
            </Button>
            <View style={styles.secondaryRow}>
              <Button
                mode="text"
                icon="target"
                onPress={() => {}}
                textColor={palette.text}
                labelStyle={styles.secondaryLabel}
                style={styles.secondaryButton}
              >
                Goals
              </Button>
              <Button
                mode="text"
                icon="chart-line"
                onPress={() => {}}
                textColor={palette.text}
                labelStyle={styles.secondaryLabel}
                style={styles.secondaryButton}
              >
                Activity
              </Button>
            </View>
          </View>
        </ScrollView>
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
    height: height * 0.35,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  topBar: {
    width: '100%',
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    position: 'relative',
  },
  topBadge: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 16,
    letterSpacing: 0.6,
  },
  topMeta: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    marginTop: theme.spacing.xs / 2,
  },
  topActions: {
    position: 'absolute',
    right: 0,
    top: theme.spacing.sm,
  },
  topIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
  },
  heroIllustration: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroSphere: {
    width: '100%',
    height: '100%',
    borderRadius: 90,
  },
  coin: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0000001A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  coinOne: {
    top: 10,
    right: -16,
    transform: [{ rotate: '-12deg' }],
  },
  coinTwo: {
    bottom: 20,
    right: -10,
    transform: [{ rotate: '8deg' }],
  },
  coinThree: {
    top: 30,
    left: -14,
    transform: [{ rotate: '18deg' }],
  },
  copyBlock: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  balanceValue: {
    fontFamily: 'NeuzeitGro-ExtraBold',
    fontSize: 42,
    textAlign: 'center',
    letterSpacing: -1,
  },
  balanceLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  statCard: {
    flex: 1,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statValue: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 18,
    marginTop: theme.spacing.xs / 2,
  },
  statLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
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
  secondaryRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  secondaryButton: {
    flex: 1,
  },
  secondaryLabel: {
    fontFamily: 'NeuzeitGro-Medium',
    fontSize: 14,
  },
});
