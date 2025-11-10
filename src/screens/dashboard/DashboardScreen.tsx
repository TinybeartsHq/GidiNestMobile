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
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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
  const navigation = useNavigation();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();

  const sectionAnimations = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0))
  ).current;

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

  useEffect(() => {
    sectionAnimations.forEach((anim) => anim.setValue(0));
    const animations = sectionAnimations.map((anim) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );
    Animated.stagger(110, animations).start();
  }, [sectionAnimations]);

  const getAnimatedStyle = useCallback(
    (anim: Animated.Value, translateY: number = 28) => ({
      opacity: anim,
      transform: [
        {
          translateY: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [translateY, 0],
          }),
        },
      ],
    }),
    []
  );

  const [heroAnim, kycAnim, quickAnim, goalsAnim, transactionAnim, footerAnim] = sectionAnimations;

  // Subtle, balanced colors for light and dark mode
  const cardBackground = isDark ? 'rgba(15, 23, 42, 0.6)' : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';

  const welcomeName = (user as any)?.first_name ?? (user as any)?.name ?? null;
  const maskedBalance = '₦•••,•••';

  const quickActions = useMemo(() => [
    {
      key: 'hospital',
      icon: 'hospital-building',
      label: 'Hospital bills',
      subtitle: 'Delivery costs',
      color: isDark ? '#FCA5A5' : '#DC2626',
      bgColor: isDark ? 'rgba(248,113,113,0.12)' : 'rgba(220, 38, 38, 0.08)',
    },
    {
      key: 'baby-items',
      icon: 'baby-carriage',
      label: 'Baby supplies',
      subtitle: 'Clothes & items',
      color: isDark ? '#FDE68A' : '#D97706',
      bgColor: isDark ? 'rgba(251,191,36,0.12)' : 'rgba(217, 119, 6, 0.08)',
    },
    {
      key: 'postpartum',
      icon: 'heart-pulse',
      label: 'Postpartum care',
      subtitle: 'Recovery support',
      color: isDark ? '#C4B5FD' : '#7C3AED',
      bgColor: isDark ? 'rgba(147,51,234,0.12)' : 'rgba(124, 58, 237, 0.08)',
    },
    {
      key: 'gift-registry',
      icon: 'gift',
      label: 'Gift registry',
      subtitle: 'Share with loved ones',
      color: isDark ? '#F9A8D4' : '#EC4899',
      bgColor: isDark ? 'rgba(236,72,153,0.12)' : 'rgba(236, 72, 153, 0.08)',
    },
    {
      key: 'emergency',
      icon: 'shield-heart',
      label: 'Emergency fund',
      subtitle: 'Coming soon',
      color: isDark ? '#64748B' : '#94A3B8',
      bgColor: isDark ? 'rgba(100,116,139,0.08)' : 'rgba(148, 163, 184, 0.06)',
      disabled: true,
    },
  ], [isDark]);

  const handleQuickAction = useCallback((actionKey: string) => {
    switch (actionKey) {
      case 'hospital':
        // @ts-ignore
        navigation.navigate('HospitalBills');
        break;
      case 'baby-items':
        // @ts-ignore
        navigation.navigate('BabySupplies');
        break;
      case 'postpartum':
        // @ts-ignore
        navigation.navigate('PostpartumCare');
        break;
      case 'gift-registry':
        // @ts-ignore nested navigator
        navigation.navigate('Community', { screen: 'GiftRegistry' });
        break;
      case 'emergency':
        Alert.alert(
          'Coming Soon',
          'Emergency fund feature is under development. Stay tuned!',
          [{ text: 'OK' }]
        );
        break;
      default:
        break;
    }
  }, [navigation]);

  const savingGoals = useMemo(
    () => [
      {
        id: 'goal-1',
        name: 'Hospital delivery bills',
        icon: 'hospital-building',
        target: 500000,
        saved: 250000,
      },
      {
        id: 'goal-2',
        name: 'Baby clothes & supplies',
        icon: 'baby-carriage',
        target: 300000,
        saved: 180000,
      },
      {
        id: 'goal-3',
        name: 'Postpartum recovery',
        icon: 'heart-pulse',
        target: 200000,
        saved: 85000,
      },
    ],
    []
  );

  const transactionHistory = useMemo(
    () => [
      {
        id: 'tx-1',
        title: 'Hospital bills fund',
        description: 'Saved for delivery',
        timestamp: '2 hours ago',
        amount: 50000,
        positive: true,
        icon: 'hospital-building',
      },
      {
        id: 'tx-2',
        title: 'Baby supplies',
        description: 'Added to baby fund',
        timestamp: 'Yesterday',
        amount: 25000,
        positive: true,
        icon: 'baby-carriage',
      },
      {
        id: 'tx-3',
        title: 'Emergency fund',
        description: 'Safety net contribution',
        timestamp: '3 days ago',
        amount: 15000,
        positive: true,
        icon: 'shield-heart',
      },
    ],
    []
  );

  const bottomContentPadding = useMemo(
    () => insets.bottom + (Platform.OS === 'ios' ? 120 : 108),
    [insets.bottom]
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

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomContentPadding }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Balance Hero Card */}
          <Animated.View
            style={[
              styles.heroCard,
              {
                borderColor: separatorColor,
                backgroundColor: cardBackground,
                shadowColor: isDark ? '#000000' : 'rgba(100, 116, 139, 0.15)',
              },
              getAnimatedStyle(heroAnim, 24),
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
          </Animated.View>

          {/* KYC Verification Banner */}
          <Animated.View style={getAnimatedStyle(kycAnim, 26)}>
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
              <View
                style={[
                  styles.kycIcon,
                  { backgroundColor: isDark ? 'rgba(167, 139, 250, 0.18)' : 'rgba(139, 92, 246, 0.12)' },
                ]}
              >
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
          </Animated.View>

          {/* Separator */}
          <View style={[styles.sectionSeparator, { backgroundColor: separatorColor }]} />

          {/* Quick Actions */}
          <Animated.View style={[styles.section, getAnimatedStyle(quickAnim, 30)]}>
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
                      opacity: action.disabled ? 0.5 : 1,
                    },
                  ]}
                  onPress={() => handleQuickAction(action.key)}
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
          </Animated.View>

          {/* Separator */}
          <View style={[styles.sectionSeparator, { backgroundColor: separatorColor }]} />

          {/* Saving Goals Section */}
          {savingGoals.length > 0 && (
            <Animated.View style={[styles.section, getAnimatedStyle(goalsAnim, 26)]}>
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
            </Animated.View>
          )}

          {/* Separator */}
          <View style={[styles.sectionSeparator, { backgroundColor: separatorColor }]} />

          {/* Transaction History */}
          <Animated.View style={[styles.section, getAnimatedStyle(transactionAnim, 20)]}>
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
          </Animated.View>

          {/* Encouraging Footer */}
          <Animated.View
            style={[
              styles.encouragementCard,
              { backgroundColor: featureTint },
              getAnimatedStyle(footerAnim, 16),
            ]}
          >
            <MaterialCommunityIcons name="hand-heart" size={18} color={palette.primary} />
            <RNText style={[styles.encouragementText, { color: palette.textSecondary }]}>
              Every little bit saved brings you closer to welcoming your bundle of joy.
            </RNText>
          </Animated.View>
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
