import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text as RNText,
  Platform,
  Animated,
  Easing,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import { useWallet } from '../../hooks/useWallet';
import { useSavings } from '../../hooks/useSavings';

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
  const navigation = useNavigation();
  const {
    wallet,
    transactions: apiTransactions,
    getWalletBalance,
    getTransactionHistory,
  } = useWallet();
  const { goals: apiGoals, getAllGoals, goalsLoading } = useSavings();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const [selectedTab, setSelectedTab] = useState<'goals' | 'transactions'>('goals');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch wallet balance, savings goals, and transaction history on mount
  useEffect(() => {
    getWalletBalance();
    getAllGoals();
    getTransactionHistory();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([getWalletBalance(), getAllGoals(), getTransactionHistory()]);
    setRefreshing(false);
  };

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

  // Use real wallet balance or default to 0
  const walletBalance = wallet?.balance ?? 0;

  // Calculate total from real goals - ensure we parse amounts as numbers
  const totalSavingsGoals =
    apiGoals && apiGoals.length > 0
      ? apiGoals.reduce((sum, goal) => {
          const amount =
            typeof goal.current_amount === 'string'
              ? parseFloat(goal.current_amount)
              : goal.current_amount;
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0)
      : 0;

  const goalIcons = useMemo(
    () => [
      { icon: 'hospital-building', color: isDark ? '#FCA5A5' : '#DC2626' },
      { icon: 'baby-carriage', color: isDark ? '#FDE68A' : '#D97706' },
      { icon: 'shield-check', color: isDark ? '#6EE7B7' : '#059669' },
      { icon: 'heart-plus', color: isDark ? '#C4B5FD' : '#7C3AED' },
      { icon: 'school', color: isDark ? '#93C5FD' : '#2563EB' },
      { icon: 'star', color: isDark ? '#F9A8D4' : '#EC4899' },
    ],
    [isDark]
  );

  const getGoalIcon = (index: number) => {
    return goalIcons[index % goalIcons.length];
  };

  const savingsGoals = useMemo(() => {
    if (!apiGoals || apiGoals.length === 0) {
      return [];
    }

    return apiGoals.map((goal, index) => {
      const iconData = getGoalIcon(index);
      const progress = (goal.current_amount / goal.target_amount) * 100;
      return {
        id: goal.id,
        name: goal.name,
        icon: iconData.icon,
        target: goal.target_amount,
        saved: goal.current_amount,
        accent: iconData.color,
        progress,
        category: goal.category || 'General',
        deadline: goal.deadline || '',
      };
    });
  }, [apiGoals, isDark]);

  // Use real transaction history from wallet
  const transactions = useMemo(() => {
    if (!apiTransactions || apiTransactions.length === 0) {
      return [];
    }

    // Map API transactions to UI format
    return apiTransactions.map((tx) => {
      const isCredit = tx.transaction_type === 'credit';
      return {
        id: tx.id,
        type: isCredit ? 'contribution' : 'withdrawal',
        description: tx.description || (isCredit ? 'Deposit' : 'Withdrawal'),
        amount: isCredit ? tx.amount : -tx.amount,
        date: tx.created_at,
        icon: isCredit ? 'arrow-down-circle' : 'arrow-up-circle',
        accent: isCredit
          ? (isDark ? '#6EE7B7' : '#059669')
          : (isDark ? '#FCA5A5' : '#DC2626'),
        rawData: tx, // Keep original transaction data
      };
    });
  }, [apiTransactions, isDark]);

  const quickActions = useMemo(
    () => [
      {
        key: 'withdraw',
        icon: 'bank-transfer-out',
        label: 'Withdraw',
        subtitle: 'Take money out',
        accent: isDark ? '#FCA5A5' : '#DC2626',
        background: isDark ? 'rgba(248,113,113,0.16)' : 'rgba(220,38,38,0.08)',
      },
      {
        key: 'deposit',
        icon: 'bank-transfer-in',
        label: 'Deposit',
        subtitle: 'Add to wallet',
        accent: isDark ? '#6EE7B7' : '#059669',
        background: isDark ? 'rgba(16,185,129,0.16)' : 'rgba(5,150,105,0.08)',
      },
      {
        key: 'fund-goal',
        icon: 'target',
        label: 'Fund a goal',
        subtitle: 'Add to savings',
        accent: isDark ? '#93C5FD' : '#2563EB',
        background: isDark ? 'rgba(59,130,246,0.16)' : 'rgba(37,99,235,0.08)',
      },
      {
        key: 'create-goal',
        icon: 'plus-circle',
        label: 'Create goal',
        subtitle: 'New savings plan',
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

  const handleQuickAction = (actionKey: string) => {
    switch (actionKey) {
      case 'withdraw':
        // Navigate to WithdrawScreen
        // @ts-ignore
        navigation.navigate('Withdraw');
        break;
      case 'deposit':
        // @ts-ignore
        navigation.navigate('Deposit');
        break;
      case 'fund-goal':
        // @ts-ignore
        navigation.navigate('FundGoal');
        break;
      case 'create-goal':
        // @ts-ignore
        navigation.navigate('CreateGoal');
        break;
    }
  };

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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={palette.primary}
              colors={[palette.primary]}
            />
          }
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
                style={({ pressed }) => [
                  styles.quickActionButton,
                  {
                    backgroundColor: action.background,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
                onPress={() => handleQuickAction(action.key)}
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
              {!savingsGoals || savingsGoals.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: featureTint }]}>
                  <MaterialCommunityIcons name="target" size={40} color={palette.textSecondary} />
                  <RNText style={[styles.emptyStateText, { color: palette.text }]}>
                    No savings goals yet
                  </RNText>
                  <RNText style={[styles.emptyStateSubtext, { color: palette.textSecondary }]}>
                    Create a goal to start saving for your baby
                  </RNText>
                  <Pressable
                    style={[styles.emptyStateButton, { backgroundColor: palette.primary }]}
                    onPress={() => {
                      // @ts-ignore
                      navigation.navigate('CreateGoal');
                    }}
                  >
                    <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                    <RNText style={styles.emptyStateButtonText}>Create Your First Goal</RNText>
                  </Pressable>
                </View>
              ) : (
                savingsGoals.map((goal) => {
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
                      onPress={() => {
                        // @ts-ignore
                        navigation.navigate('GoalDetails', { goalId: goal.id });
                      }}
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
                })
              )}
            </View>
          )}

          {/* Transactions Tab */}
          {selectedTab === 'transactions' && (
            <View style={styles.transactionsContainer}>
              {transactions.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: featureTint }]}>
                  <MaterialCommunityIcons name="history" size={40} color={palette.textSecondary} />
                  <RNText style={[styles.emptyStateText, { color: palette.text }]}>
                    No transactions yet
                  </RNText>
                  <RNText style={[styles.emptyStateSubtext, { color: palette.textSecondary }]}>
                    Your transaction history will appear here once you start saving
                  </RNText>
                </View>
              ) : (
                transactions.map((tx) => {
                  // Format date from ISO string
                  const formatDate = (dateString: string) => {
                    try {
                      const date = new Date(dateString);
                      const now = new Date();
                      const diffMs = now.getTime() - date.getTime();
                      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                      const diffDays = Math.floor(diffHours / 24);

                      if (diffHours < 1) return 'Just now';
                      if (diffHours < 24) return `${diffHours}h ago`;
                      if (diffDays === 1) return 'Yesterday';
                      if (diffDays < 7) return `${diffDays}d ago`;
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    } catch {
                      return '';
                    }
                  };

                  return (
                    <Pressable
                      key={tx.id}
                      style={[
                        styles.transactionCard,
                        {
                          backgroundColor: cardBackground,
                          borderColor: separatorColor,
                        },
                      ]}
                      onPress={() => {
                        // @ts-ignore - Navigate to transaction details
                        navigation.navigate('TransactionDetails', { transaction: tx.rawData });
                      }}
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
                          {formatDate(tx.date)}
                        </RNText>
                      </View>
                      <RNText style={[styles.transactionAmount, { color: tx.accent }]}>
                        {tx.amount > 0 ? '+' : ''}
                        {formatCurrency(Math.abs(tx.amount))}
                      </RNText>
                    </Pressable>
                  );
                })
              )}
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 2,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  emptyStateText: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    marginTop: theme.spacing.sm,
  },
  emptyStateButtonText: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 14,
    color: '#FFFFFF',
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
