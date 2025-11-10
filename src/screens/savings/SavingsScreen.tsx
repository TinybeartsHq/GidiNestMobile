import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text as RNText,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';

const formatCurrency = (value: number) => {
  return `₦${value.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export default function SavingsScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const [selectedTab, setSelectedTab] = useState<'goals' | 'transactions'>('goals');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const cardMutedBackground = isDark ? 'rgba(17, 24, 39, 0.72)' : palette.cardMuted;
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';

  const walletBalance = 850000;
  const totalSavingsGoals = 1550000;

  const savingsGoals = useMemo(
    () => [
      {
        id: 'goal-1',
        name: 'Hospital Delivery Bills',
        icon: 'hospital-building',
        target: 500000,
        saved: 250000,
        accent: isDark ? '#FCA5A5' : '#DC2626',
        deadline: 'Due Date',
        category: 'Medical',
      },
      {
        id: 'goal-2',
        name: 'Baby Clothes & Supplies',
        icon: 'baby-carriage',
        target: 300000,
        saved: 180000,
        accent: isDark ? '#FDE68A' : '#D97706',
        deadline: 'Before Birth',
        category: 'Essentials',
      },
      {
        id: 'goal-3',
        name: 'Emergency Medical Fund',
        icon: 'shield-heart',
        target: 200000,
        saved: 125000,
        accent: isDark ? '#6EE7B7' : '#059669',
        deadline: 'Anytime',
        category: 'Safety Net',
      },
      {
        id: 'goal-4',
        name: 'Postpartum Support',
        icon: 'heart-pulse',
        target: 250000,
        saved: 95000,
        accent: isDark ? '#C4B5FD' : '#7C3AED',
        deadline: 'After Birth',
        category: 'Recovery',
      },
    ],
    [isDark]
  );

  const transactions = useMemo(
    () => [
      {
        id: 'tx-1',
        type: 'contribution',
        description: 'Added to Hospital Bills Fund',
        amount: 50000,
        date: '2 hours ago',
        icon: 'arrow-down-circle',
        accent: isDark ? '#6EE7B7' : '#059669',
      },
      {
        id: 'tx-2',
        type: 'withdrawal',
        description: 'Bought baby essentials',
        amount: -15000,
        date: 'Yesterday',
        icon: 'arrow-up-circle',
        accent: isDark ? '#FCA5A5' : '#DC2626',
      },
      {
        id: 'tx-3',
        type: 'contribution',
        description: 'Auto-save to Postpartum Fund',
        amount: 25000,
        date: '3 days ago',
        icon: 'clock-check',
        accent: isDark ? '#93C5FD' : '#2563EB',
      },
    ],
    [isDark]
  );

  const quickActions = useMemo(
    () => [
      {
        key: 'hospital',
        icon: 'hospital-building',
        label: 'Hospital bills',
        subtitle: 'Save for delivery',
        accent: isDark ? '#FCA5A5' : '#DC2626',
        background: isDark ? 'rgba(248,113,113,0.16)' : 'rgba(220,38,38,0.08)',
      },
      {
        key: 'baby-supplies',
        icon: 'baby-carriage',
        label: 'Baby supplies',
        subtitle: 'Clothes & items',
        accent: isDark ? '#FDE68A' : '#D97706',
        background: isDark ? 'rgba(251,191,36,0.16)' : 'rgba(217,119,6,0.08)',
      },
      {
        key: 'emergency',
        icon: 'shield-heart',
        label: 'Emergency fund',
        subtitle: 'Medical safety',
        accent: isDark ? '#6EE7B7' : '#059669',
        background: isDark ? 'rgba(16,185,129,0.16)' : 'rgba(5,150,105,0.08)',
      },
      {
        key: 'postpartum',
        icon: 'heart-pulse',
        label: 'Postpartum care',
        subtitle: 'Recovery needs',
        accent: isDark ? '#C4B5FD' : '#7C3AED',
        background: isDark ? 'rgba(196,181,253,0.16)' : 'rgba(124,58,237,0.1)',
      },
    ],
    [isDark]
  );

  const bottomContentPadding = useMemo(
    () => insets.bottom + (Platform.OS === 'ios' ? 120 : 108),
    [insets.bottom]
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeading}>
            <RNText style={[styles.headerGreeting, { color: palette.textSecondary }]}>
              Baby Savings
            </RNText>
            <RNText style={[styles.headerTitle, { color: palette.text }]}>
              Preparing for Baby
            </RNText>
            <View style={[styles.headerAccent, { backgroundColor: palette.primary }]} />
          </View>
          <Pressable style={[styles.headerIcon, { backgroundColor: featureTint }]}>
            <MaterialCommunityIcons name="bell-outline" size={20} color={palette.text} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomContentPadding }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Wallet Balance Card */}
          <Animated.View
            style={[
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View
              style={[
                styles.walletCard,
                {
                  backgroundColor: isDark ? cardMutedBackground : '#F4F4FF',
                  borderColor: isDark ? 'rgba(148,163,184,0.22)' : 'rgba(79,70,229,0.18)',
                  shadowColor: isDark ? '#000000' : 'rgba(79, 70, 229, 0.12)',
                },
              ]}
            >
              <View style={styles.walletHeader}>
                <View style={styles.walletHeading}>
                  <RNText style={[styles.walletLabel, { color: palette.textSecondary }]}>Wallet balance</RNText>
                  <View style={styles.walletAccentLine}>
                    <View style={[styles.walletAccentDot, { backgroundColor: palette.primary }]} />
                  </View>
                  <RNText style={[styles.walletAmount, { color: palette.text }]}>{formatCurrency(walletBalance)}</RNText>
                </View>
                <View style={[styles.walletBadge, { backgroundColor: palette.primary }]}>
                  <MaterialCommunityIcons name="wallet" size={22} color={palette.onPrimary ?? '#FFFFFF'} />
                </View>
              </View>

              <View style={[styles.walletStats, { borderTopColor: separatorColor }]}>
                <View style={styles.walletStat}>
                  <RNText style={[styles.walletStatLabel, { color: palette.textSecondary }]}>Total in goals</RNText>
                  <RNText style={[styles.walletStatValue, { color: palette.text }]}>{formatCurrency(totalSavingsGoals)}</RNText>
                </View>
                <View style={[styles.walletDivider, { backgroundColor: separatorColor }]} />
                <View style={styles.walletStat}>
                  <RNText style={[styles.walletStatLabel, { color: palette.textSecondary }]}>Available</RNText>
                  <RNText style={[styles.walletStatValue, { color: palette.text }]}>
                    {formatCurrency(walletBalance - totalSavingsGoals)}
                  </RNText>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action) => (
              <Pressable
                key={action.key}
                style={[
                  styles.quickActionButton,
                  { backgroundColor: action.background },
                ]}
                onPress={() => {}}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: isDark ? action.accent + '33' : action.accent + '1F' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={action.icon as any}
                    size={20}
                    color={isDark ? '#F8FAFC' : action.accent}
                  />
                </View>
                <View style={styles.quickActionCopy}>
                  <RNText style={[styles.quickActionLabel, { color: palette.text }]}>
                    {action.label}
                  </RNText>
                  <RNText style={[styles.quickActionSubtitle, { color: palette.textSecondary }]}>
                    {action.subtitle}
                  </RNText>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Tabs */}
          <View style={[styles.tabsContainer, { backgroundColor: featureTint }]}>
            <Pressable
              style={[
                styles.tab,
                selectedTab === 'goals' && [
                  styles.tabActive,
                  { backgroundColor: palette.primary },
                ],
              ]}
              onPress={() => setSelectedTab('goals')}
            >
              <RNText
                style={[
                  styles.tabText,
                  { color: selectedTab === 'goals' ? '#FFFFFF' : palette.textSecondary },
                ]}
              >
                Goals ({savingsGoals.length})
              </RNText>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                selectedTab === 'transactions' && [
                  styles.tabActive,
                  { backgroundColor: palette.primary },
                ],
              ]}
              onPress={() => setSelectedTab('transactions')}
            >
              <RNText
                style={[
                  styles.tabText,
                  { color: selectedTab === 'transactions' ? '#FFFFFF' : palette.textSecondary },
                ]}
              >
                Activity
              </RNText>
            </Pressable>
          </View>

          {/* Goals Tab */}
          {selectedTab === 'goals' && (
            <View style={styles.goalRow}>
              {savingsGoals.map((goal) => {
                const progress = (goal.saved / goal.target) * 100;
                return (
                  <Pressable
                    key={goal.id}
                    style={[
                      styles.goalRowCard,
                      {
                        backgroundColor: cardBackground,
                        borderColor: separatorColor,
                      },
                    ]}
                    onPress={() => {}}
                  >
                    <View style={styles.goalTileHeader}>
                      <View style={styles.goalTileLeading}>
                        <View
                          style={[
                            styles.goalTileIcon,
                            { backgroundColor: isDark ? goal.accent + '33' : goal.accent + '14' },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={goal.icon as any}
                            size={18}
                            color={isDark ? '#F8FAFC' : goal.accent}
                          />
                        </View>
                        <View style={styles.goalTileInfo}>
                          <RNText style={[styles.goalTileName, { color: palette.text }]}>
                            {goal.name}
                          </RNText>
                          <RNText style={[styles.goalTileMeta, { color: palette.textSecondary }]}>
                            Due {goal.deadline}
                          </RNText>
                          <RNText style={[styles.goalTileMeta, { color: palette.textSecondary }]}>
                            {Math.round(progress)}% complete
                          </RNText>
                        </View>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={20} color={palette.textSecondary} />
                    </View>

                    <View style={styles.goalRowAmounts}>
                      <RNText style={[styles.goalTileSaved, { color: palette.text }]}>
                        {formatCurrency(goal.saved)}
                      </RNText>
                      <RNText style={[styles.goalTileTarget, { color: palette.textSecondary }]}>
                        of {formatCurrency(goal.target)}
                      </RNText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Transactions Tab */}
          {selectedTab === 'transactions' && (
            <View style={styles.transactionsContainer}>
              {transactions.map((tx) => (
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
                  <View style={[styles.transactionIcon, { backgroundColor: tx.accent + '1F' }]}>
                    <MaterialCommunityIcons
                      name={tx.icon as any}
                      size={20}
                      color={isDark ? '#F8FAFC' : tx.accent}
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <RNText style={[styles.transactionDescription, { color: palette.text }]}>
                      {tx.description}
                    </RNText>
                    <RNText style={[styles.transactionDate, { color: palette.textSecondary }]}>
                      {tx.date}
                    </RNText>
                  </View>
                  <RNText style={[styles.transactionAmount, { color: tx.accent }]}>
                    {tx.amount > 0 ? '+' : ''}
                    {formatCurrency(Math.abs(tx.amount))}
                  </RNText>
                </Pressable>
              ))}
            </View>
          )}

          {/* Insights Card */}
          <View
            style={[
              styles.insightsCard,
              {
                backgroundColor: featureTint,
                borderColor: separatorColor,
              },
            ]}
          >
            <View style={[styles.insightsIcon, { backgroundColor: palette.primary + '1F' }]}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color={palette.primary} />
            </View>
            <View style={styles.insightsContent}>
              <RNText style={[styles.insightsTitle, { color: palette.text }]}>
                Great progress!
              </RNText>
              <RNText style={[styles.insightsText, { color: palette.textSecondary }]}>
                You're 18% ahead this month. Your baby's arrival will be stress-free! 👶
              </RNText>
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
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerLeading: {
    gap: theme.spacing.xs / 1.6,
  },
  headerGreeting: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  headerTitle: {
    fontFamily: 'NeuzeitGro-ExtraBold',
    fontSize: 24,
    letterSpacing: -0.5,
  },
  headerAccent: {
    height: 2,
    width: 34,
    borderRadius: 1,
    marginTop: theme.spacing.xs / 2,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  walletCard: {
    borderRadius: theme.borderRadius.xl + 6,
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  walletHeading: {
    gap: theme.spacing.xs / 1.3,
  },
  walletAccentLine: {
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    width: 32,
    marginTop: theme.spacing.xs / 2.5,
  },
  walletAccentDot: {
    height: '100%',
    width: '55%',
    borderRadius: 1,
  },
  walletLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  walletAmount: {
    fontFamily: 'NeuzeitGro-ExtraBold',
    fontSize: 30,
    letterSpacing: -0.8,
  },
  walletBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    marginTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: theme.spacing.md,
  },
  walletStat: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  walletStatLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
  },
  walletStatValue: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 16,
  },
  walletDivider: {
    width: 1,
    height: 32,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  quickActionButton: {
    flexBasis: '48%',
    borderRadius: theme.borderRadius.xl + 2,
    padding: theme.spacing.md,
    gap: theme.spacing.sm / 1.5,
    elevation: 0,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionCopy: {
    gap: theme.spacing.xs / 2,
  },
  quickActionLabel: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
  quickActionSubtitle: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderRadius: theme.borderRadius.xl,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  tabActive: {
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 13,
  },
  goalRow: {
    gap: theme.spacing.sm,
  },
  goalRowCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalTileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalTileLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  goalTileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTileInfo: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  goalTileName: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 13.5,
  },
  goalTileMeta: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 11.5,
  },
  goalTileSaved: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
  },
  goalTileTarget: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 11.5,
  },
  goalRowAmounts: {
    alignItems: 'flex-end',
  },
  transactionsContainer: {
    gap: theme.spacing.sm,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
    marginBottom: 2,
  },
  transactionDate: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
  },
  transactionAmount: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
  },
  insightsCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
  },
  insightsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightsContent: {
    flex: 1,
  },
  insightsTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
    marginBottom: 4,
  },
  insightsText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
});
