import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Pressable, Text as RNText, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Surface, Button } from 'react-native-paper';
import type { RootState } from '../../redux/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeMode } from '../../theme/ThemeProvider';

const defaultAnalytics = {
  totalSavingsBalance: 0,
  activeGoals: 0,
  monthlyContributions: 0,
  goalsAchievedYTD: 0,
  currency: '₦',
  monthlyContributionChange: 0,
  goalsAchievedChange: 0,
  savingsTrend: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    totalSavings: [40, 50, 60, 75, 90, 120],
    monthlyDeposits: [10, 12, 14, 18, 20, 25],
  },
  goalProgress: [
    { title: 'School Fees', progress: 0.72, target: 500000 },
    { title: 'Vacation Fund', progress: 0.48, target: 300000 },
    { title: 'Emergency Cushion', progress: 0.3, target: 200000 },
  ],
  recommendations: [
    {
      title: 'Automate contributions',
      description: 'Set a weekly top-up to build momentum towards your goals.',
    },
    {
      title: 'Review inactive goals',
      description: 'Dust off old savings goals and decide to restart or archive them.',
    },
    {
      title: 'Celebrate wins',
      description: 'You hit one goal this quarter! Share the story with your Nest.',
    },
  ],
};

type BottomNavItem = {
  key: string;
  label: string;
  icon: string;
};

type QuickAction = {
  key: string;
  label: string;
  subtitle: string;
  icon: string;
  gradient: [string, string];
};

const bottomNavItems: BottomNavItem[] = [
  { key: 'home', label: 'Home', icon: 'home-variant' },
  { key: 'goals', label: 'Goals', icon: 'target' },
  { key: 'tips', label: 'Tips', icon: 'lightbulb-on' },
  { key: 'profile', label: 'Profile', icon: 'account-circle' },
];

const inspirationStories = [
  {
    key: 'story1',
    title: "Ada saved ₦500k in 6 months for her baby's arrival",
    icon: 'heart-circle',
    accent: '#FDF2F8',
  },
  {
    key: 'story2',
    title: 'The Obi family hit their childbirth goal together',
    icon: 'account-group',
    accent: '#F0FDF4',
  },
  {
    key: 'story3',
    title: "Automatic savings made Chioma's dream possible",
    icon: 'clock-check-outline',
    accent: '#FFF7ED',
  },
];
const inspirationAccentsDark = ['#1E1B4B', '#0F172A', '#1F2937'];

const formatCurrency = (value: number, currency: string) => {
  const mappedCurrency = currency === 'NGN' ? '₦' : currency;
  return `${mappedCurrency}${value.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const DashboardScreen: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [activeTab, setActiveTab] = useState('home');
  const { width } = useWindowDimensions();
  const { mode, palette } = useThemeMode();
  const isDark = mode === 'dark';

  const isWideLayout = width >= 820;
  const containerBackground = palette.background;
  const cardBackground = palette.card;
  const cardMuted = palette.cardMuted;
  const textPrimary = palette.text;
  const textSecondary = palette.textSecondary;
  const borderSubtle = palette.border;
  const sectionAccentColor = isDark ? 'rgba(192, 132, 252, 0.7)' : 'rgba(107, 20, 109, 0.72)';
  const analytics = useMemo(() => {
    if (!user || !('dashboardAnalytics' in user)) {
      return defaultAnalytics;
    }
    return {
      ...defaultAnalytics,
      ...user.dashboardAnalytics,
    };
  }, [user]);

  const goalsInFocus = useMemo(
    () =>
      (analytics.goalProgress || []).map((goal, index) => ({
        ...goal,
        key: `${goal.title}-${index}`,
      })),
    [analytics.goalProgress]
  );

  const activityFeed = useMemo(
    () => [
      {
        id: '1',
        title: 'Savings top-up',
        description: 'Bank transfer • GTB',
        timestamp: '2 hours ago',
        amount: 20000,
        icon: 'arrow-down-bold-circle',
      },
      {
        id: '2',
        title: 'Goal contribution',
        description: 'Ada’s Education dream',
        timestamp: 'Yesterday',
        amount: 10000,
        icon: 'target',
      },
      {
        id: '3',
        title: 'Withdrawal to bank',
        description: 'UBA ••••8190',
        timestamp: 'Jul 12',
        amount: -5000,
        icon: 'bank-transfer-out',
      },
    ],
    []
  );
  const monthlyContributionDisplay = formatCurrency(
    Number(analytics.monthlyContributions) || 0,
    analytics.currency
  );
  const goalsAchievedCopy =
    analytics.goalsAchievedYTD === 1
      ? '1 goal nurtured YTD'
      : `${analytics.goalsAchievedYTD} goals nurtured YTD`;
  const welcomeName =
    (user as any)?.first_name ??
    (user as any)?.name ??
    null;

  const quickActions = useMemo<QuickAction[]>(() => {
    const lightGradients: [string, string][] = [
      ['#F7ECFF', '#FDF2F8'],
      ['#E0F2FE', '#FAF5FF'],
      ['#ECFDF5', '#F5F3FF'],
      ['#FFF7ED', '#FFEDD5'],
    ];
    const darkGradients: [string, string][] = [
      ['#1E1B4B', '#312E81'],
      ['#0F172A', '#1E293B'],
      ['#134E4A', '#0F172A'],
      ['#421F0A', '#1F2937'],
    ];
    const gradients = isDark ? darkGradients : lightGradients;

    return [
      {
        key: 'addSaving',
        label: 'Add savings',
        subtitle: 'Top up instantly',
        icon: 'plus-circle',
        gradient: gradients[0],
      },
      {
        key: 'createGoal',
        label: 'Create goal',
        subtitle: 'Plan a new milestone',
        icon: 'flag-variant',
        gradient: gradients[1],
      },
      {
        key: 'autoSave',
        label: 'Automate saving',
        subtitle: 'Keep momentum effortlessly',
        icon: 'clock-check',
        gradient: gradients[2],
      },
      {
        key: 'withdraw',
        label: 'Withdraw funds',
        subtitle: 'Move money to bank',
        icon: 'bank-transfer-out',
        gradient: gradients[3],
      },
    ];
  }, [isDark]);

  const quickActionCards = useMemo(
    () =>
      quickActions.map((action, index) => {
        const isLast = index === quickActions.length - 1;
        const actionIconColor = isDark ? '#FFFFFF' : palette.primary;

        return (
          <Pressable
            key={action.key}
            style={[
              styles.quickActionPressable,
              isWideLayout && styles.quickActionPressableWide,
              isLast && styles.quickActionPressableLast,
            ]}
            onPress={() => {}}
          >
            <LinearGradient
              colors={action.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.quickActionCard,
                {
                  borderColor: isDark
                    ? 'rgba(148, 163, 184, 0.24)'
                    : 'rgba(148, 163, 184, 0.12)',
                },
              ]}
            >
              <View
                style={[
                  styles.quickActionIconBadge,
                  {
                    backgroundColor: isDark
                      ? 'rgba(192, 132, 252, 0.12)'
                      : 'rgba(107, 20, 109, 0.12)',
                  },
                ]}
              >
                <MaterialCommunityIcons name={action.icon} size={22} color={actionIconColor} />
              </View>
              <RNText
                style={[
                  styles.quickActionLabel,
                  { color: isDark ? '#FDF4FF' : '#0F172A' },
                ]}
              >
                {action.label}
              </RNText>
              <RNText
                style={[
                  styles.quickActionSubtitle,
                  { color: isDark ? '#E0E7FF' : '#475569' },
                ]}
              >
                {action.subtitle}
              </RNText>
            </LinearGradient>
          </Pressable>
        );
      }),
    [isDark, isWideLayout, palette.primary, quickActions]
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: containerBackground }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with welcome and icons */}
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <RNText style={[styles.headerWelcome, { color: textPrimary }]}>
              {welcomeName ? `Welcome back, ${welcomeName}` : 'Welcome back'}
            </RNText>
            <RNText style={[styles.headerTagline, { color: textSecondary }]}>
              Your nest is growing beautifully.
            </RNText>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={[
                styles.headerIcon,
                {
                  backgroundColor: isDark
                    ? 'rgba(148, 163, 184, 0.12)'
                    : 'rgba(100, 116, 139, 0.08)',
                },
              ]}
              onPress={() => {}}
            >
              <MaterialCommunityIcons name="bell-outline" size={20} color={textPrimary} />
            </Pressable>
            <Pressable
              style={[
                styles.headerIcon,
                {
                  backgroundColor: isDark
                    ? 'rgba(192, 132, 252, 0.16)'
                    : 'rgba(107, 20, 109, 0.12)',
                },
              ]}
              onPress={() => {}}
            >
              <MaterialCommunityIcons name="account-circle-outline" size={20} color={palette.primary} />
            </Pressable>
          </View>
        </View>

        {/* Balance card - clean and minimal */}
        <Surface
          style={[
            styles.balanceCard,
            {
              backgroundColor: cardBackground,
              borderColor: borderSubtle,
            },
          ]}
          elevation={0}
        >
          <View style={styles.balanceHeader}>
            <RNText style={[styles.balanceLabel, { color: textSecondary }]}>
              Total balance
            </RNText>
            <MaterialCommunityIcons name="eye-outline" size={18} color={textSecondary} />
          </View>
          <RNText style={[styles.balanceValue, { color: textPrimary }]}>
            {formatCurrency(analytics.totalSavingsBalance, analytics.currency)}
          </RNText>
          <RNText style={[styles.balanceSubtext, { color: textSecondary }]}>
            Across {analytics.activeGoals} {analytics.activeGoals === 1 ? 'goal' : 'goals'}
          </RNText>
        </Surface>

        {/* Stats chips */}
        <View style={styles.statsRow}>
          <Surface
            style={[
              styles.statChip,
              {
                backgroundColor: cardBackground,
                borderColor: borderSubtle,
              },
            ]}
            elevation={0}
          >
            <View
              style={[
                styles.statChipIconWrapper,
                {
                  backgroundColor: isDark
                    ? 'rgba(192, 132, 252, 0.14)'
                    : 'rgba(107, 20, 109, 0.08)',
                },
              ]}
            >
              <MaterialCommunityIcons name="progress-clock" size={16} color={palette.primary} />
            </View>
            <View style={styles.statChipContent}>
              <RNText style={[styles.statChipLabel, { color: textSecondary }]}>
                Monthly
              </RNText>
              <RNText style={[styles.statChipValue, { color: textPrimary }]}>
                {monthlyContributionDisplay}
              </RNText>
            </View>
          </Surface>

          <Surface
            style={[
              styles.statChip,
              {
                backgroundColor: cardBackground,
                borderColor: borderSubtle,
              },
            ]}
            elevation={0}
          >
            <View
              style={[
                styles.statChipIconWrapper,
                {
                  backgroundColor: isDark
                    ? 'rgba(192, 132, 252, 0.14)'
                    : 'rgba(107, 20, 109, 0.08)',
                },
              ]}
            >
              <MaterialCommunityIcons name="sprout" size={16} color={palette.primary} />
            </View>
            <View style={styles.statChipContent}>
              <RNText style={[styles.statChipLabel, { color: textSecondary }]}>
                This year
              </RNText>
              <RNText style={[styles.statChipValue, { color: textPrimary }]}>
                {analytics.goalsAchievedYTD} {analytics.goalsAchievedYTD === 1 ? 'goal' : 'goals'}
              </RNText>
            </View>
          </Surface>
        </View>

        {/* Quick action button */}
        <Button
          mode="contained"
          icon="plus-circle"
          onPress={() => {}}
          style={styles.primaryActionButton}
          labelStyle={styles.primaryActionLabel}
          buttonColor={palette.primary}
        >
          Add savings
        </Button>

        <Surface
          style={[
            styles.verificationCard,
            { backgroundColor: cardMuted, borderColor: borderSubtle },
          ]}
          elevation={0}
        >
          <View style={[styles.verificationAccent, { backgroundColor: sectionAccentColor }]} />
          <View style={styles.verificationContent}>
            <View
              style={[
                styles.verificationIcon,
                { backgroundColor: isDark ? 'rgba(192,132,252,0.16)' : 'rgba(107,20,109,0.12)' },
              ]}
            >
              <MaterialCommunityIcons name="badge-account" size={22} color={palette.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <RNText style={[styles.verificationTitle, { color: textPrimary }]}>
                Verify your account
              </RNText>
              <RNText style={[styles.verificationSubtitle, { color: textSecondary }]}>
                Complete your NIN/KYC to unlock withdrawals and higher limits.
              </RNText>
            </View>
          </View>
          <Button
            mode="outlined"
            onPress={() => {}}
            style={styles.verificationButton}
            textColor={palette.primary}
          >
            Complete KYC
          </Button>
        </Surface>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <RNText style={[styles.sectionTitle, { color: textPrimary }]}>
                Quick actions
              </RNText>
              <View style={[styles.sectionAccent, { backgroundColor: sectionAccentColor }]} />
            </View>
          </View>
          {isWideLayout ? (
            <View style={[styles.quickActionsRow, styles.quickActionsRowWide]}>
              {quickActionCards}
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActionsContent}
              style={styles.quickActionsScroll}
            >
              {quickActionCards}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <RNText style={[styles.sectionTitle, { color: textPrimary }]}>
                Goals
              </RNText>
              <View style={[styles.sectionAccent, { backgroundColor: sectionAccentColor }]} />
            </View>
            <Pressable onPress={() => {}}>
              <RNText style={[styles.sectionLink, { color: palette.primary }]}>
                See all goals
              </RNText>
            </Pressable>
          </View>
          {goalsInFocus.length === 0 ? (
            <Surface
              style={[
                styles.emptyStateCard,
                {
                  backgroundColor: isDark ? '#1E1B4B' : '#F9F5FF',
                  borderColor: isDark ? 'rgba(192, 132, 252, 0.24)' : 'rgba(107, 20, 109, 0.16)',
                },
              ]}
              elevation={0}
            >
              <MaterialCommunityIcons name="calendar-plus" size={24} color={palette.primary} />
              <RNText
                style={[
                  styles.emptyStateTitle,
                  { color: textPrimary },
                ]}
              >
                No goals yet
              </RNText>
              <RNText
                style={[
                  styles.emptyStateMessage,
                  { color: isDark ? '#CBD5F5' : '#64748B' },
                ]}
              >
                Start your first nest goal to see progress here.
              </RNText>
              <Button
                mode="contained"
                onPress={() => {}}
                style={styles.emptyStateButton}
                buttonColor={palette.primary}
              >
                Create goal
              </Button>
            </Surface>
          ) : (
            goalsInFocus.map((goal) => (
              <Surface
                key={goal.key}
                style={[
                  styles.goalCard,
                  {
                    backgroundColor: cardBackground,
                    borderColor: borderSubtle,
                  },
                ]}
                elevation={0}
              >
                <View style={styles.goalHeaderRow}>
                  <View style={styles.goalTitleWrap}>
                    <View
                      style={[
                        styles.goalAccentDot,
                        { backgroundColor: sectionAccentColor },
                      ]}
                    />
                    <View>
                      <RNText style={[styles.goalTitle, { color: textPrimary }]}>
                        {goal.title}
                      </RNText>
                      <RNText
                        style={[
                          styles.goalMeta,
                          { color: textSecondary },
                        ]}
                      >
                        {goal.progress >= 1
                          ? 'We made it — time to celebrate!'
                          : `On our way to ${formatCurrency(goal.target || 0, analytics.currency)}`}
                      </RNText>
                    </View>
                  </View>
                  <Surface
                    style={[
                      styles.goalStatusBadge,
                      {
                        backgroundColor: isDark
                          ? 'rgba(192, 132, 252, 0.14)'
                          : 'rgba(107, 20, 109, 0.12)',
                      },
                    ]}
                    elevation={0}
                  >
                    <MaterialCommunityIcons
                      name={goal.progress >= 1 ? 'party-popper' : 'sprout'}
                      size={18}
                      color={palette.primary}
                    />
                  </Surface>
                </View>
                <RNText
                  style={[
                    styles.goalStory,
                    { color: isDark ? '#CBD5F5' : '#475569' },
                  ]}
                >
                  {goal.progress >= 1
                    ? 'Your family rallied together and hit this milestone. What’s the next dream?'
                    : 'A few more joyful contributions and this dream becomes a family moment.'}
                </RNText>
                <Button
                  mode="text"
                  compact
                  onPress={() => {}}
                  textColor={palette.primary}
                  style={styles.goalAction}
                >
                  {goal.progress >= 1 ? 'Share the win' : 'Add a little more'}
                </Button>
              </Surface>
            ))
          )}
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <RNText style={[styles.sectionTitle, { color: textPrimary }]}>
                Transaction history
              </RNText>
              <View style={[styles.sectionAccent, { backgroundColor: sectionAccentColor }]} />
            </View>
            <Pressable onPress={() => {}}>
              <RNText style={[styles.sectionLink, { color: palette.primary }]}>
                View all
              </RNText>
            </Pressable>
          </View>
          <Surface
            style={[
              styles.activityCard,
              {
                backgroundColor: cardBackground,
                borderColor: borderSubtle,
              },
            ]}
            elevation={0}
          >
            {activityFeed.map((activity, index) => {
              const isLast = index === activityFeed.length - 1;
              return (
                <View
                  key={activity.id}
                  style={[
                    styles.activityRow,
                    {
                      borderBottomColor: isLast ? 'transparent' : borderSubtle,
                      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#FFFFFF',
                      marginBottom: isLast ? 0 : 8,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.activityIcon,
                      {
                        backgroundColor: isDark
                          ? 'rgba(192, 132, 252, 0.12)'
                          : 'rgba(107, 20, 109, 0.12)',
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name={activity.icon} size={18} color={palette.primary} />
                  </View>
                  <View style={styles.activityBody}>
                    <RNText style={[styles.activityTitle, { color: textPrimary }]}>
                      {activity.title}
                    </RNText>
                    {activity.description ? (
                      <RNText
                        style={[
                          styles.activitySubtitle,
                          { color: textSecondary },
                        ]}
                      >
                        {activity.description}
                      </RNText>
                    ) : null}
                  </View>
                  <View style={styles.activityMeta}>
                    <RNText
                      style={[
                        styles.activityAmount,
                        activity.amount >= 0
                          ? styles.activityAmountCredit
                          : styles.activityAmountDebit,
                      ]}
                    >
                      {`${activity.amount >= 0 ? '+' : '-'}${formatCurrency(
                        Math.abs(activity.amount),
                        analytics.currency
                      )}`}
                    </RNText>
                    <RNText
                      style={[
                        styles.activityTimestamp,
                        { color: textSecondary },
                      ]}
                    >
                      {activity.timestamp}
                    </RNText>
                  </View>
                </View>
              );
            })}
          </Surface>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <RNText style={[styles.sectionTitle, { color: textPrimary }]}>
                Nest inspiration
              </RNText>
              <View style={[styles.sectionAccent, { backgroundColor: sectionAccentColor }]} />
            </View>
          </View>
          <View
            style={[
              styles.inspirationGrid,
              isWideLayout ? styles.inspirationGridWide : styles.inspirationGridMobile,
            ]}
          >
            {inspirationStories.map((story, index) => {
              const cardAccent = isDark
                ? inspirationAccentsDark[index % inspirationAccentsDark.length]
                : story.accent;
              return (
                <Surface
                  key={story.key}
                  style={[
                    styles.inspirationCard,
                    {
                      backgroundColor: cardAccent,
                      borderColor: borderSubtle,
                    },
                  ]}
                  elevation={0}
                >
                  <View
                    style={[
                      styles.inspirationIconBadge,
                      {
                        backgroundColor: isDark
                          ? 'rgba(192, 132, 252, 0.12)'
                          : 'rgba(107, 20, 109, 0.12)',
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name={story.icon} size={20} color={palette.primary} />
                  </View>
                  <RNText
                    style={[
                      styles.inspirationText,
                      { color: isDark ? '#E2E8F0' : '#0F172A' },
                    ]}
                  >
                    {story.title}
                  </RNText>
                </Surface>
              );
            })}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Surface
        style={[
          styles.bottomNavContainer,
          {
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
            borderColor: borderSubtle,
            shadowColor: isDark ? '#000000' : '#0f172a',
          },
        ]}
        elevation={12}
      >
        <View style={styles.bottomNavInner}>
          {bottomNavItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <Pressable
                key={item.key}
                style={styles.bottomNavItem}
                onPress={() => setActiveTab(item.key)}
              >
                <View
                  style={[
                    styles.bottomNavIconWrapper,
                    isActive && styles.bottomNavIconWrapperActive,
                    isActive && {
                      backgroundColor: isDark
                        ? 'rgba(192, 132, 252, 0.18)'
                        : 'rgba(107, 20, 109, 0.12)',
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={22}
                    color={isActive ? palette.primary : textSecondary}
                  />
                </View>
                <RNText
                  style={[
                    styles.bottomNavLabel,
                    isActive && styles.bottomNavLabelActive,
                    { color: isActive ? palette.primary : textSecondary },
                  ]}
                >
                  {item.label}
                </RNText>
              </Pressable>
            );
          })}
    </View>
        <View style={styles.bottomSafeAreaShim} />
      </Surface>
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 180,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 16,
  },
  headerWelcome: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    letterSpacing: -0.4,
    lineHeight: 32,
  },
  headerTagline: {
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: {
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  balanceLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  balanceValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 40,
    marginBottom: 4,
    letterSpacing: -0.8,
  },
  balanceSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  statChipIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statChipContent: {
    flex: 1,
  },
  statChipLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  statChipValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    marginTop: 2,
  },
  primaryActionButton: {
    borderRadius: 20,
    marginBottom: 24,
  },
  primaryActionLabel: {
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.2,
    paddingVertical: 4,
  },
  verificationCard: {
    marginTop: 20,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  verificationAccent: {
    height: 3,
    width: 36,
    borderRadius: 2,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  verificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  verificationIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  verificationTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  verificationSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  verificationButton: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 18,
  },
  section: {
    marginTop: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitleGroup: {
    alignSelf: 'flex-start',
  },
  sectionAccent: {
    marginTop: 6,
    width: 44,
    height: 3,
    borderRadius: 2,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
  },
  sectionLink: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  quickActionsRow: {
    flexDirection: 'row',
  },
  quickActionsRowWide: {
    justifyContent: 'space-between',
  },
  quickActionsScroll: {
    marginTop: 4,
  },
  quickActionsContent: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  quickActionPressable: {
    marginRight: 16,
    borderRadius: 22,
  },
  quickActionPressableLast: {
    marginRight: 0,
  },
  quickActionPressableWide: {
    flex: 1,
    marginRight: 12,
  },
  quickActionCard: {
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 20,
    minWidth: 200,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 8,
  },
  quickActionIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  quickActionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  goalCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  goalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalTitleWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingRight: 12,
  },
  goalAccentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  goalTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  goalMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 4,
  },
  goalStory: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  goalStatusBadge: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalAction: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderRadius: 16,
  },
  emptyStateCard: {
    borderRadius: 22,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyStateTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    marginTop: 4,
  },
  emptyStateMessage: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyStateButton: {
    marginTop: 10,
    borderRadius: 18,
  },
  activityCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 4,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    borderRadius: 18,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  activityBody: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  activitySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 2,
  },
  activityMeta: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  activityAmount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  activityAmountCredit: {
    color: '#16A34A',
  },
  activityAmountDebit: {
    color: '#DC2626',
  },
  activityTimestamp: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 4,
  },
  bottomSpacer: {
    height: 110,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    borderTopWidth: 1,
  },
  bottomNavInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: 14,
    paddingBottom: 12,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavIconWrapper: {
    width: 52,
    height: 38,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavIconWrapperActive: {},
  bottomNavLabel: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  bottomNavLabelActive: {
    fontFamily: 'Inter_600SemiBold',
  },
  bottomSafeAreaShim: {
    height: Platform.select({ ios: 24, android: 14 }),
  },
  inspirationGrid: {
    gap: 14,
  },
  inspirationGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  inspirationGridMobile: {
    flexDirection: 'column',
  },
  inspirationCard: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  inspirationIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  inspirationText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 21,
  },
});
