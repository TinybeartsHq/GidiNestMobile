import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text as RNText, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeMode } from '../../theme/ThemeProvider';
import type { RootState } from '../../redux/types';
import { theme } from '../../theme/theme';

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

  // Subtle, balanced colors for light and dark mode
  const cardBackground = isDark ? 'rgba(15, 23, 42, 0.6)' : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';

  const welcomeName = (user as any)?.first_name ?? (user as any)?.name ?? null;
  const maskedBalance = '₦•••,•••';

  const quickActions = useMemo(() => [
    {
      key: 'save',
      icon: 'plus-circle',
      label: 'Add savings',
      subtitle: 'Top up now',
      color: isDark ? '#93C5FD' : '#2563EB',
      bgColor: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(37, 99, 235, 0.08)',
    },
    {
      key: 'goal',
      icon: 'target-variant',
      label: 'Create goal',
      subtitle: 'Plan ahead',
      color: isDark ? '#C4B5FD' : '#7C3AED',
      bgColor: isDark ? 'rgba(147,51,234,0.12)' : 'rgba(124, 58, 237, 0.08)',
    },
    {
      key: 'automate',
      icon: 'refresh-circle',
      label: 'Automate',
      subtitle: 'Set & forget',
      color: isDark ? '#6EE7B7' : '#059669',
      bgColor: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(5, 150, 105, 0.08)',
    },
    {
      key: 'withdraw',
      icon: 'bank-transfer-out',
      label: 'Withdraw',
      subtitle: 'To your bank',
      color: isDark ? '#FDE68A' : '#D97706',
      bgColor: isDark ? 'rgba(251,191,36,0.12)' : 'rgba(217, 119, 6, 0.08)',
    },
  ], [isDark]);

  const savingGoals = useMemo(
    () => [
      {
        id: 'goal-1',
        name: 'Baby essentials',
        icon: 'baby-face-outline',
        target: 300000,
        saved: 180000,
      },
      {
        id: 'goal-2',
        name: 'Hospital stay',
        icon: 'hospital-building',
        target: 250000,
        saved: 125000,
      },
    ],
    []
  );

  const transactionHistory = useMemo(
    () => [
      {
        id: 'tx-1',
        title: 'Savings top-up',
        description: 'Bank transfer • GTB',
        timestamp: '2 hours ago',
        amount: 20000,
        positive: true,
        icon: 'plus-circle',
      },
      {
        id: 'tx-2',
        title: 'Goal contribution',
        description: "Ada's future fund",
        timestamp: 'Yesterday',
        amount: 10000,
        positive: true,
        icon: 'target',
      },
      {
        id: 'tx-3',
        title: 'Withdrawal',
        description: 'UBA ••••8190',
        timestamp: '3 days ago',
        amount: -5000,
        positive: false,
        icon: 'bank-transfer-out',
      },
    ],
    []
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Top Bar */}
        <View style={[styles.topBar, { borderColor: separatorColor }]}>
          <View style={styles.topLeft}>
            <RNText style={[styles.greeting, { color: palette.textSecondary }]}>
              {welcomeName ? `Hey ${welcomeName} 👋` : 'Welcome back 👋'}
            </RNText>
            <RNText style={[styles.topBadge, { color: palette.text }]}>
              Your nest today
            </RNText>
          </View>
          <View style={styles.topActions}>
            <Pressable style={[styles.topIcon, { backgroundColor: featureTint }]}>
              <MaterialCommunityIcons name="bell-outline" size={18} color={palette.text} />
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Balance Hero Card */}
          <View
            style={[
              styles.heroCard,
              {
                borderColor: separatorColor,
                backgroundColor: cardBackground,
                shadowColor: isDark ? '#000000' : 'rgba(100, 116, 139, 0.15)',
              },
            ]}
          >
            <View style={[styles.heroBadge, { backgroundColor: featureTint }]}>
              <MaterialCommunityIcons name="sprout" size={13} color={palette.primary} />
              <RNText style={[styles.heroBadgeText, { color: palette.primary }]}>
                Growing steadily
              </RNText>
            </View>

            <RNText style={[styles.balanceLabel, { color: palette.textSecondary }]}>
              Total balance
            </RNText>
            <View style={styles.balanceRow}>
              <RNText style={[styles.balanceValue, { color: palette.text }]}>
                {showBalance ? formatCurrency(analytics.totalSavingsBalance, analytics.currency) : maskedBalance}
              </RNText>
              <Pressable onPress={() => setShowBalance((prev) => !prev)} style={styles.eyeIcon}>
                <MaterialCommunityIcons
                  name={showBalance ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color={palette.textSecondary}
                />
              </Pressable>
            </View>

            {/* Stats Chips */}
            <View style={styles.statsRow}>
              <View style={[styles.statChip, { backgroundColor: featureTint }]}>
                <MaterialCommunityIcons name="target" size={14} color={palette.text} />
                <RNText style={[styles.statChipText, { color: palette.text }]}>
                  {analytics.activeGoals} Goals
                </RNText>
              </View>
              <View style={[styles.statChip, { backgroundColor: featureTint }]}>
                <MaterialCommunityIcons name="calendar-month" size={14} color={palette.text} />
                <RNText style={[styles.statChipText, { color: palette.text }]}>
                  {formatCurrency(analytics.monthlyContributions, analytics.currency)}/mo
                </RNText>
              </View>
            </View>

            {/* Separator */}
            <View style={[styles.cardSeparator, { backgroundColor: separatorColor }]} />

            {/* Build Nest Button */}
            <Button
              mode="contained"
              icon="plus-circle-outline"
              onPress={() => {}}
              buttonColor={palette.primary}
              textColor="#FFFFFF"
              style={styles.heroButton}
              contentStyle={styles.heroButtonContent}
              labelStyle={styles.heroButtonLabel}
            >
              Build your nest
            </Button>
          </View>

          {/* KYC Verification Banner */}
          <Pressable
            style={[
              styles.kycBanner,
              {
                backgroundColor: isDark ? 'rgba(124, 58, 237, 0.1)' : 'rgba(139, 92, 246, 0.06)',
                borderColor: isDark ? 'rgba(167, 139, 250, 0.25)' : 'rgba(139, 92, 246, 0.2)',
              },
            ]}
            onPress={() => {}}
          >
            <View style={[styles.kycIcon, { backgroundColor: isDark ? 'rgba(167, 139, 250, 0.18)' : 'rgba(139, 92, 246, 0.12)' }]}>
              <MaterialCommunityIcons name="shield-check-outline" size={18} color={palette.primary} />
            </View>
            <View style={styles.kycContent}>
              <RNText style={[styles.kycTitle, { color: palette.text }]}>
                Verify your account
              </RNText>
              <RNText style={[styles.kycSubtitle, { color: palette.textSecondary }]}>
                Complete KYC for higher limits
              </RNText>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={palette.textSecondary} />
          </Pressable>

          {/* Separator */}
          <View style={[styles.sectionSeparator, { backgroundColor: separatorColor }]} />

          {/* Quick Actions */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Quick actions
            </RNText>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <Pressable
                  key={action.key}
                  style={[
                    styles.quickActionCard,
                    {
                      backgroundColor: action.bgColor,
                      borderColor: separatorColor,
                    },
                  ]}
                  onPress={() => {}}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: action.color + '18' }]}>
                    <MaterialCommunityIcons name={action.icon as any} size={20} color={action.color} />
                  </View>
                  <RNText style={[styles.quickActionLabel, { color: palette.text }]}>
                    {action.label}
                  </RNText>
                  <RNText style={[styles.quickActionSubtitle, { color: palette.textSecondary }]}>
                    {action.subtitle}
                  </RNText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Separator */}
          <View style={[styles.sectionSeparator, { backgroundColor: separatorColor }]} />

          {/* Saving Goals Section */}
          {savingGoals.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <RNText style={[styles.sectionTitle, { color: palette.text }]}>
                  Your milestones
                </RNText>
                <Pressable onPress={() => {}}>
                  <RNText style={[styles.seeAll, { color: palette.primary }]}>View all</RNText>
                </Pressable>
              </View>

              <View style={styles.goalsStack}>
                {savingGoals.map((goal) => {
                  const progress = goal.saved / goal.target;
                  const progressPercent = Math.round(progress * 100);
                  return (
                    <Pressable
                      key={goal.id}
                      style={[
                        styles.goalCard,
                        {
                          backgroundColor: cardBackground,
                          borderColor: separatorColor,
                        },
                      ]}
                      onPress={() => {}}
                    >
                      <View style={styles.goalHeader}>
                        <View style={[styles.goalIconBadge, { backgroundColor: featureTint }]}>
                          <MaterialCommunityIcons name={goal.icon as any} size={18} color={palette.primary} />
                        </View>
                        <View style={styles.goalInfo}>
                          <RNText style={[styles.goalTitle, { color: palette.text }]}>
                            {goal.name}
                          </RNText>
                          <RNText style={[styles.goalAmounts, { color: palette.textSecondary }]}>
                            {formatCurrency(goal.saved, analytics.currency)} • {progressPercent}% there
                          </RNText>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.progressTrack,
                          { backgroundColor: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.15)' },
                        ]}
                      >
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${Math.min(progress * 100, 100)}%`,
                              backgroundColor: palette.primary,
                            },
                          ]}
                        />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Separator */}
          <View style={[styles.sectionSeparator, { backgroundColor: separatorColor }]} />

          {/* Transaction History */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <RNText style={[styles.sectionTitle, { color: palette.text }]}>
                Recent activity
              </RNText>
              <Pressable onPress={() => {}}>
                <RNText style={[styles.seeAll, { color: palette.primary }]}>View all</RNText>
              </Pressable>
            </View>

            <View style={styles.transactionStack}>
              {transactionHistory.map((tx) => (
                <Pressable
                  key={tx.id}
                  style={[
                    styles.transactionCard,
                    {
                      backgroundColor: cardBackground,
                      borderColor: separatorColor,
                    },
                  ]}
                  onPress={() => {}}
                >
                  <View style={[styles.txIcon, { backgroundColor: featureTint }]}>
                    <MaterialCommunityIcons
                      name={tx.icon as any}
                      size={16}
                      color={tx.positive ? (isDark ? '#6EE7B7' : '#059669') : (isDark ? '#FCA5A5' : '#DC2626')}
                    />
                  </View>
                  <View style={styles.txContent}>
                    <RNText style={[styles.txTitle, { color: palette.text }]}>
                      {tx.title}
                    </RNText>
                    <RNText style={[styles.txDescription, { color: palette.textSecondary }]}>
                      {tx.description} • {tx.timestamp}
                    </RNText>
                  </View>
                  <RNText
                    style={[
                      styles.txAmount,
                      {
                        color: tx.positive
                          ? (isDark ? '#6EE7B7' : '#059669')
                          : (isDark ? '#FCA5A5' : '#DC2626'),
                      },
                    ]}
                  >
                    {tx.positive ? '+' : ''}
                    {formatCurrency(Math.abs(tx.amount), analytics.currency)}
                  </RNText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Encouraging Footer */}
          <View style={[styles.encouragementCard, { backgroundColor: featureTint }]}>
            <MaterialCommunityIcons name="hand-heart" size={18} color={palette.primary} />
            <RNText style={[styles.encouragementText, { color: palette.textSecondary }]}>
              You're building something beautiful, one step at a time.
            </RNText>
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
  safeArea: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  topBar: {
    width: '100%',
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topLeft: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  greeting: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  topBadge: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  topActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  topIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingTop: theme.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 90 : 80,
    gap: theme.spacing.lg,
  },
  heroCard: {
    width: '100%',
    borderRadius: theme.borderRadius.xl + 4,
    padding: theme.spacing.lg + theme.spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: theme.spacing.sm,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.md,
  },
  heroBadgeText: {
    fontFamily: 'NeuzeitGro-Medium',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  balanceLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  balanceValue: {
    fontFamily: 'NeuzeitGro-ExtraBold',
    fontSize: 34,
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  eyeIcon: {
    padding: theme.spacing.xs / 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: theme.spacing.xs,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.md,
  },
  statChipText: {
    fontFamily: 'NeuzeitGro-Medium',
    fontSize: 12,
  },
  cardSeparator: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  heroButton: {
    width: '100%',
    borderRadius: theme.borderRadius.lg,
    elevation: 2,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  heroButtonContent: {
    paddingVertical: theme.spacing.xs,
  },
  heroButtonLabel: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
  },
  kycBanner: {
    width: '100%',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderWidth: 1,
  },
  kycIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kycContent: {
    flex: 1,
    gap: theme.spacing.xs / 4,
  },
  kycTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
  kycSubtitle: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
  },
  sectionSeparator: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
  },
  section: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 17,
  },
  seeAll: {
    fontFamily: 'NeuzeitGro-Medium',
    fontSize: 13,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  quickActionCard: {
    width: '48%',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
    minHeight: 100,
    borderWidth: StyleSheet.hairlineWidth,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
    marginTop: theme.spacing.xs / 2,
  },
  quickActionSubtitle: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
  },
  goalsStack: {
    gap: theme.spacing.sm,
  },
  goalCard: {
    width: '100%',
    borderRadius: theme.borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  goalIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInfo: {
    flex: 1,
    gap: theme.spacing.xs / 4,
  },
  goalTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
  goalAmounts: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
  },
  progressTrack: {
    width: '100%',
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  transactionStack: {
    gap: theme.spacing.xs,
  },
  transactionCard: {
    width: '100%',
    borderRadius: theme.borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txContent: {
    flex: 1,
    gap: theme.spacing.xs / 4,
  },
  txTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
  txDescription: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
  },
  txAmount: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
  encouragementCard: {
    width: '100%',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  encouragementText: {
    flex: 1,
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
});
