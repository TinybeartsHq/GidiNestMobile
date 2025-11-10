// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text as RNText, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ShapeSquare from '../../assets/background/shape-square.svg';
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

  const [showBalance, setShowBalance] = useState(true);

  const quickActions = useMemo(() => {
    const definitions = [
      {
        key: 'addSaving',
        label: 'Add savings',
        subtitle: 'Top up instantly',
        icon: 'plus-circle',
        lightBackground: '#E0F2FE',
        lightAccent: '#1D4ED8',
        darkGradient: ['rgba(59,130,246,0.22)', 'rgba(30,58,138,0.78)'],
        darkAccent: '#93C5FD',
      },
      {
        key: 'createGoal',
        label: 'Create goal',
        subtitle: 'Plan milestones',
        icon: 'flag-variant',
        lightBackground: '#ECE9FF',
        lightAccent: '#6D28D9',
        darkGradient: ['rgba(147,51,234,0.24)', 'rgba(76,29,149,0.82)'],
        darkAccent: '#C4B5FD',
      },
      {
        key: 'autoSave',
        label: 'Automate saving',
        subtitle: 'Keep momentum',
        icon: 'clock-check-outline',
        lightBackground: '#ECFDF5',
        lightAccent: '#047857',
        darkGradient: ['rgba(16,185,129,0.22)', 'rgba(6,95,70,0.78)'],
        darkAccent: '#6EE7B7',
      },
      {
        key: 'withdraw',
        label: 'Withdraw funds',
        subtitle: 'Move to bank',
        icon: 'bank-transfer-out',
        lightBackground: '#FEF3C7',
        lightAccent: '#B45309',
        darkGradient: ['rgba(251,191,36,0.24)', 'rgba(180,83,9,0.82)'],
        darkAccent: '#FDE68A',
      },
    ] as const;

    return definitions.map((definition) => ({
      key: definition.key,
      label: definition.label,
      subtitle: definition.subtitle,
      icon: definition.icon,
      accent: isDark ? definition.darkAccent : definition.lightAccent,
      gradient: isDark ? (definition.darkGradient as [string, string]) : undefined,
      background: isDark ? undefined : definition.lightBackground,
    }));
  }, [isDark]);

  const transactionHistory = useMemo(
    () => [
      {
        id: 'tx-1',
        title: 'Savings top-up',
        description: 'Bank transfer • GTB',
        timestamp: '2 hours ago',
        amount: 20000,
        positive: true,
      },
      {
        id: 'tx-2',
        title: 'Goal contribution',
        description: "Ada’s Education dream",
        timestamp: 'Yesterday',
        amount: 10000,
        positive: true,
      },
      {
        id: 'tx-3',
        title: 'Withdrawal to bank',
        description: 'UBA ••••8190',
        timestamp: 'Jul 12',
        amount: -5000,
        positive: false,
      },
    ],
    []
  );

  const savingGoals = useMemo(
    () => [
      {
        id: 'goal-1',
        name: 'Baby essentials',
        target: 300000,
        saved: 180000,
      },
      {
        id: 'goal-2',
        name: 'Hospital stay',
        target: 250000,
        saved: 125000,
      },
    ],
    []
  );

  const welcomeName = (user as any)?.first_name ?? (user as any)?.name ?? null;
  const heroGradient = isDark
    ? (['rgba(20, 11, 40, 0.85)', 'rgba(2, 6, 23, 0.95)'] as const)
    : (['rgba(244, 240, 255, 0.85)', 'rgba(248, 250, 252, 1)'] as const);

  const maskedBalance = '₦•••,•••';

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>      
      <LinearGradient colors={heroGradient} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.headerRow}>
          <Pressable style={[styles.avatar, { backgroundColor: palette.card }]}>
            <MaterialCommunityIcons name="account" size={20} color={palette.primary} />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable
              style={[styles.headerIcon, { backgroundColor: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(100,116,139,0.12)' }]}
            >
              <MaterialCommunityIcons name="bell-outline" size={18} color={palette.text} />
            </Pressable>
            <Pressable
              style={[styles.headerIcon, { backgroundColor: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(100,116,139,0.12)' }]}
            >
              <MaterialCommunityIcons name="account-circle-outline" size={18} color={palette.text} />
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionSpacing}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>Welcome back{welcomeName ? `, ${welcomeName}` : ''}</RNText>
            <View style={styles.sectionAccent}>
              <View style={[styles.sectionAccentLine, { backgroundColor: palette.primary }]} />
            </View>
            <RNText style={[styles.sectionSubtitle, { color: palette.textSecondary }]}>Your nest is ready for the day’s plans.</RNText>
          </View>

          <View
            style={[
              styles.balanceCard,
              {
                backgroundColor: isDark ? palette.card : '#F4F4FF',
                borderColor: isDark ? palette.border : 'rgba(79, 70, 229, 0.16)',
              },
            ]}
          >
            {!isDark ? (
              <ShapeSquare width="140%" height="140%" style={styles.balanceShape} pointerEvents="none" />
            ) : null}
            <View style={styles.balanceContent}>
              <View style={styles.balanceHeaderRow}>
                <RNText style={[styles.balanceLabel, { color: palette.textSecondary }]}>Nest balance</RNText>
                <Button
                  mode="text"
                  icon={showBalance ? 'eye-off-outline' : 'eye-outline'}
                  onPress={() => setShowBalance((prev) => !prev)}
                  textColor={palette.primary}
                  labelStyle={styles.toggleLabel}
                  contentStyle={styles.toggleContent}
                >
                  {showBalance ? 'Hide' : 'View'}
                </Button>
              </View>
              <RNText style={[styles.balanceValue, { color: palette.text }]}>
                {showBalance ? formatCurrency(analytics.totalSavingsBalance, analytics.currency) : maskedBalance}
              </RNText>
              <Button
                mode="contained"
                onPress={() => {}}
                buttonColor={palette.primary}
                textColor="#FFFFFF"
                style={styles.balanceCTA}
                contentStyle={styles.balanceCTAContent}
                icon="plus-circle"
              >
                Add savings
              </Button>
            </View>
          </View>

          <View style={[styles.kycCard, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.88)' : '#F1F5F9', borderColor: palette.border }] }>
            <View style={[styles.kycIconBadge, { backgroundColor: isDark ? 'rgba(107,20,109,0.2)' : 'rgba(107,20,109,0.12)' }]}>
              <MaterialCommunityIcons name="shield-check" size={20} color={palette.primary} />
            </View>
            <View style={styles.kycBody}>
              <View style={styles.kycCopy}>
                <RNText style={[styles.kycTitle, { color: palette.text }]}>Verify your NIN / KYC</RNText>
                <RNText style={[styles.kycSubtitle, { color: palette.textSecondary }]}>Finish verification to unlock higher transfer limits.</RNText>
              </View>
              <Button mode="contained" onPress={() => {}} buttonColor={palette.primary} textColor="#FFFFFF" style={styles.kycButton}>
                Complete now
              </Button>
            </View>
          </View>

          <View style={styles.sectionSpacing}>
            <View style={styles.sectionHeaderRow}>
              <RNText style={[styles.sectionHeading, { color: palette.text }]}>Quick actions</RNText>
            </View>
            <View style={styles.sectionAccent}>
              <View style={[styles.sectionAccentLine, { backgroundColor: palette.primary }]} />
            </View>
            <RNText style={[styles.sectionSubtitle, { color: palette.textSecondary }]}>Jump right into what matters.</RNText>
            <View style={styles.quickActionRow}>
              {quickActions.map((action) => (
                <Pressable key={action.key} style={styles.quickActionWrapper} onPress={() => {}}>
                  {isDark && action.gradient ? (
                    <LinearGradient colors={action.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.quickActionCard, { shadowColor: '#000000' }]}>
                      <View style={[styles.quickIconBadge, { backgroundColor: action.accent + '33' }]}>
                        <MaterialCommunityIcons name={action.icon as any} size={18} color="#F8FAFC" />
                      </View>
                      <RNText style={[styles.quickLabel, { color: '#F8FAFC' }]}>{action.label}</RNText>
                      <RNText style={[styles.quickSubtitle, { color: 'rgba(248,250,252,0.75)' }]}>{action.subtitle}</RNText>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.quickActionCard, { backgroundColor: action.background, shadowColor: action.accent + '22' }]}>
                      <View style={[styles.quickIconBadge, { backgroundColor: action.accent + '1A' }]}>
                        <MaterialCommunityIcons name={action.icon as any} size={18} color={action.accent} />
                      </View>
                      <RNText style={[styles.quickLabel, { color: palette.text }]}>{action.label}</RNText>
                      <RNText style={[styles.quickSubtitle, { color: palette.textSecondary }]}>{action.subtitle}</RNText>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.sectionSpacing}>
            <View style={styles.sectionHeaderRow}>
              <RNText style={[styles.sectionHeading, { color: palette.text }]}>Transaction history</RNText>
              <Pressable onPress={() => {}}>
                <RNText style={[styles.seeAll, { color: palette.primary }]}>See all</RNText>
              </Pressable>
            </View>
            <View style={styles.sectionAccent}>
              <View style={[styles.sectionAccentLine, { backgroundColor: palette.primary }]} />
            </View>
            <RNText style={[styles.sectionSubtitle, { color: palette.textSecondary }]}>Keep tabs on the latest activity.</RNText>
            <View style={styles.listStack}>
              {transactionHistory.map((item) => (
                <View key={item.id} style={[styles.transactionCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
                  <View style={styles.transactionRow}>
                    <View>
                      <RNText style={[styles.transactionTitle, { color: palette.text }]}>{item.title}</RNText>
                      <RNText style={[styles.transactionDescription, { color: palette.textSecondary }]}>{item.description}</RNText>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <RNText style={[styles.transactionAmount, { color: item.positive ? '#16A34A' : '#DC2626' }]}
                      >{`${item.positive ? '+' : ''}${formatCurrency(Math.abs(item.amount), analytics.currency)}`}</RNText>
                      <RNText style={[styles.transactionTimestamp, { color: palette.textSecondary }]}>{item.timestamp}</RNText>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.sectionSpacing, { marginBottom: theme.spacing.xl * 1.5 }] }>
            <View style={styles.sectionHeaderRow}>
              <RNText style={[styles.sectionHeading, { color: palette.text }]}>Saving goals</RNText>
              <Pressable onPress={() => {}}>
                <RNText style={[styles.seeAll, { color: palette.primary }]}>See all</RNText>
              </Pressable>
            </View>
            <View style={styles.sectionAccent}>
              <View style={[styles.sectionAccentLine, { backgroundColor: palette.primary }]} />
            </View>
            <RNText style={[styles.sectionSubtitle, { color: palette.textSecondary }]}>Keep an eye on your nest milestones.</RNText>
            <View style={styles.listStack}>
              {savingGoals.map((goal) => {
                const progress = goal.saved / goal.target;
                return (
                  <View key={goal.id} style={[styles.goalCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
                    <View style={styles.goalHeader}>
                      <MaterialCommunityIcons name="target-variant" size={18} color={palette.primary} />
                      <RNText style={[styles.goalTitle, { color: palette.text }]}>{goal.name}</RNText>
                    </View>
                    <RNText style={[styles.goalAmounts, { color: palette.textSecondary }]}> {formatCurrency(goal.saved, analytics.currency)} saved of {formatCurrency(goal.target, analytics.currency)} </RNText>
                    <View style={[styles.progressTrack, { backgroundColor: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(148,163,184,0.18)' }] }>
                      <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: palette.primary }]} />
                    </View>
                  </View>
                );
              })}
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
    height: height * 0.26,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00000018',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: theme.spacing.xl * 2,
    gap: theme.spacing.xl,
  },
  sectionSpacing: {
    gap: theme.spacing.xs,
  },
  sectionTitle: {
    fontFamily: 'NeuzeitGro-ExtraBold',
    fontSize: 28,
    letterSpacing: -0.6,
  },
  sectionSubtitle: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHeading: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 18,
  },
  balanceCard: {
    width: '100%',
    borderRadius: theme.borderRadius.xl + 6,
    padding: theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#00000010',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    overflow: 'hidden',
    position: 'relative',
  },
  balanceContent: {
    gap: theme.spacing.sm,
  },
  balanceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
  },
  balanceValue: {
    fontFamily: 'NeuzeitGro-ExtraBold',
    fontSize: 36,
    letterSpacing: -0.8,
  },
  toggleLabel: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
  toggleContent: {
    paddingHorizontal: theme.spacing.xs,
  },
  balanceCTA: {
    alignSelf: 'stretch',
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
  },
  balanceCTAContent: {
    paddingVertical: theme.spacing.sm,
  },
  balanceShape: {
    position: 'absolute',
    top: -60,
    right: -72,
    opacity: 0.4,
  },
  kycCard: {
    width: '100%',
    borderRadius: theme.borderRadius.xl + 4,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  kycIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kycBody: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  kycCopy: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  kycTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 16,
  },
  kycSubtitle: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  kycButton: {
    borderRadius: theme.borderRadius.lg,
    alignSelf: 'flex-start',
    marginTop: 0,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAll: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 13,
  },
  quickActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: theme.spacing.sm,
  },
  quickActionWrapper: {
    width: '48%',
    minWidth: 152,
    flexGrow: 1,
  },
  quickActionCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
  },
  quickIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
  },
  quickSubtitle: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  listStack: {
    gap: theme.spacing.sm,
  },
  transactionCard: {
    width: '100%',
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
  },
  transactionDescription: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    marginTop: theme.spacing.xs / 2,
  },
  transactionAmount: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
  },
  transactionTimestamp: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
    marginTop: theme.spacing.xs / 2,
  },
  goalCard: {
    width: '100%',
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  goalTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
  },
  goalAmounts: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionAccent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs / 2,
    marginBottom: theme.spacing.xs / 2,
  },
  sectionAccentLine: {
    width: 36,
    height: 3,
    borderRadius: 999,
  },
});
