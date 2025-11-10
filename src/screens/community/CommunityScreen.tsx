import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text as RNText,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';

const formatCurrency = (value: number) => {
  return `₦${value.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export default function CommunityScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();

  const [selectedTab, setSelectedTab] = useState<'groups' | 'challenges' | 'leaderboard'>('groups');

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';

  const myGroups = useMemo(() => [
    {
      id: 'group-1',
      name: 'Expecting Moms Lagos',
      members: 156,
      totalSaved: 45000000,
      icon: 'account-heart',
      color: isDark ? '#93C5FD' : '#2563EB',
      badge: 'Active',
      description: 'Pregnancy support & tips',
    },
    {
      id: 'group-2',
      name: 'New Parents 2025',
      members: 89,
      totalSaved: 12500000,
      icon: 'baby-face',
      color: isDark ? '#FCA5A5' : '#DC2626',
      badge: 'Popular',
      description: 'First-time parents journey',
    },
    {
      id: 'group-3',
      name: 'Childbirth Savers',
      members: 234,
      totalSaved: 78000000,
      icon: 'hospital-building',
      color: isDark ? '#6EE7B7' : '#059669',
      badge: 'Featured',
      description: 'Saving for delivery together',
    },
  ], [isDark]);

  const challenges = useMemo(() => [
    {
      id: 'challenge-1',
      title: 'Hospital Bills Challenge',
      participants: 124,
      daysLeft: 12,
      reward: 50000,
      progress: 65,
      icon: 'hospital-building',
      color: isDark ? '#FCA5A5' : '#DC2626',
    },
    {
      id: 'challenge-2',
      title: 'Baby Essentials Sprint',
      participants: 87,
      daysLeft: 25,
      reward: 100000,
      progress: 42,
      icon: 'baby-carriage',
      color: isDark ? '#FDE68A' : '#D97706',
    },
    {
      id: 'challenge-3',
      title: 'Emergency Fund Builder',
      participants: 156,
      daysLeft: 8,
      reward: 75000,
      progress: 88,
      icon: 'shield-heart',
      color: isDark ? '#6EE7B7' : '#059669',
    },
  ], [isDark]);

  const leaderboard = useMemo(() => [
    {
      id: 'user-1',
      name: 'Chinyere O.',
      savings: 2450000,
      rank: 1,
      badge: '🥇',
      trend: 'up',
    },
    {
      id: 'user-2',
      name: 'Emeka A.',
      savings: 2180000,
      rank: 2,
      badge: '🥈',
      trend: 'up',
    },
    {
      id: 'user-3',
      name: 'Amina K.',
      savings: 1950000,
      rank: 3,
      badge: '🥉',
      trend: 'down',
    },
    {
      id: 'user-4',
      name: 'Oluwaseun B.',
      savings: 1720000,
      rank: 4,
      badge: '4',
      trend: 'up',
    },
    {
      id: 'user-5',
      name: 'You',
      savings: 850000,
      rank: 12,
      badge: '12',
      trend: 'up',
      isCurrentUser: true,
    },
  ], []);

  const communityStats = useMemo(() => ({
    totalMembers: 12458,
    totalSaved: 450000000,
    activeGroups: 342,
  }), []);

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
            <RNText style={[styles.headerTitle, { color: palette.text }]}>
              Community
            </RNText>
            <View style={[styles.headerAccent, { backgroundColor: palette.primary }]} />
          </View>
          <Pressable style={[styles.headerIcon, { backgroundColor: featureTint }]}>
            <MaterialCommunityIcons name="magnify" size={20} color={palette.text} />
          </Pressable>
        </View>

        {/* Community Stats Banner */}
        <View style={styles.statsSection}>
          <View
            style={[
              styles.statsBanner,
              {
                backgroundColor: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.06)',
                borderColor: isDark ? 'rgba(167,139,250,0.25)' : 'rgba(139,92,246,0.2)',
              },
            ]}
          >
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="account-group" size={20} color={palette.primary} />
              <View>
                <RNText style={[styles.statValue, { color: palette.text }]}>
                  {communityStats.totalMembers.toLocaleString()}
                </RNText>
                <RNText style={[styles.statLabel, { color: palette.textSecondary }]}>
                  Members
                </RNText>
              </View>
            </View>
            <View style={[styles.statDivider, { backgroundColor: separatorColor }]} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="wallet" size={20} color={palette.primary} />
              <View>
                <RNText style={[styles.statValue, { color: palette.text }]}>
                  {formatCurrency(communityStats.totalSaved)}
                </RNText>
                <RNText style={[styles.statLabel, { color: palette.textSecondary }]}>
                  Total Saved
                </RNText>
              </View>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, { backgroundColor: featureTint }]}>
          <Pressable
            style={[
              styles.tab,
              selectedTab === 'groups' && [
                styles.tabActive,
                { backgroundColor: palette.primary },
              ],
            ]}
            onPress={() => setSelectedTab('groups')}
          >
            <RNText
              style={[
                styles.tabText,
                { color: selectedTab === 'groups' ? '#FFFFFF' : palette.text },
              ]}
            >
              My Groups
            </RNText>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              selectedTab === 'challenges' && [
                styles.tabActive,
                { backgroundColor: palette.primary },
              ],
            ]}
            onPress={() => setSelectedTab('challenges')}
          >
            <RNText
              style={[
                styles.tabText,
                { color: selectedTab === 'challenges' ? '#FFFFFF' : palette.text },
              ]}
            >
              Challenges
            </RNText>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              selectedTab === 'leaderboard' && [
                styles.tabActive,
                { backgroundColor: palette.primary },
              ],
            ]}
            onPress={() => setSelectedTab('leaderboard')}
          >
            <RNText
              style={[
                styles.tabText,
                { color: selectedTab === 'leaderboard' ? '#FFFFFF' : palette.text },
              ]}
            >
              Leaderboard
            </RNText>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomContentPadding }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Groups Tab */}
          {selectedTab === 'groups' && (
            <>
              {myGroups.map((group) => (
                <Pressable
                  key={group.id}
                  style={[
                    styles.groupCard,
                    {
                      backgroundColor: cardBackground,
                      borderColor: separatorColor,
                    },
                  ]}
                  onPress={() => {}}
                >
                  <View style={styles.groupHeader}>
                    <View style={[styles.groupIcon, { backgroundColor: group.color + '1F' }]}>
                      <MaterialCommunityIcons
                        name={group.icon as any}
                        size={24}
                        color={isDark ? '#F8FAFC' : group.color}
                      />
                    </View>
                    <View style={styles.groupInfo}>
                      <View style={styles.groupTitleRow}>
                        <RNText style={[styles.groupName, { color: palette.text }]}>
                          {group.name}
                        </RNText>
                        <View style={[styles.groupBadge, { backgroundColor: group.color + '1F' }]}>
                          <RNText style={[styles.groupBadgeText, { color: group.color }]}>
                            {group.badge}
                          </RNText>
                        </View>
                      </View>
                      <RNText style={[styles.groupDescription, { color: palette.textSecondary }]}>
                        {group.description}
                      </RNText>
                    </View>
                  </View>

                  <View style={[styles.groupStats, { borderTopColor: separatorColor }]}>
                    <View style={styles.groupStatItem}>
                      <MaterialCommunityIcons name="account-multiple" size={16} color={palette.textSecondary} />
                      <RNText style={[styles.groupStatText, { color: palette.textSecondary }]}>
                        {group.members} members
                      </RNText>
                    </View>
                    <View style={styles.groupStatItem}>
                      <MaterialCommunityIcons name="piggy-bank" size={16} color={palette.textSecondary} />
                      <RNText style={[styles.groupStatText, { color: palette.textSecondary }]}>
                        {formatCurrency(group.totalSaved)} saved
                      </RNText>
                    </View>
                  </View>
                </Pressable>
              ))}

              {/* Discover Groups Section */}
              <View style={styles.discoverSection}>
                <RNText style={[styles.sectionTitle, { color: palette.text }]}>
                  Discover groups
                </RNText>
                <Pressable
                  style={[
                    styles.discoverCard,
                    {
                      backgroundColor: featureTint,
                      borderColor: separatorColor,
                    },
                  ]}
                  onPress={() => {}}
                >
                  <MaterialCommunityIcons name="magnify" size={24} color={palette.primary} />
                  <View style={styles.discoverContent}>
                    <RNText style={[styles.discoverTitle, { color: palette.text }]}>
                      Explore more groups
                    </RNText>
                    <RNText style={[styles.discoverSubtitle, { color: palette.textSecondary }]}>
                      Find communities that match your goals
                    </RNText>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={palette.textSecondary} />
                </Pressable>
              </View>
            </>
          )}

          {/* Challenges Tab */}
          {selectedTab === 'challenges' && (
            <>
              {challenges.map((challenge) => (
                <View
                  key={challenge.id}
                  style={[
                    styles.challengeCard,
                    {
                      backgroundColor: cardBackground,
                      borderColor: separatorColor,
                    },
                  ]}
                >
                  <View style={styles.challengeHeader}>
                    <View style={[styles.challengeIcon, { backgroundColor: challenge.color + '1F' }]}>
                      <MaterialCommunityIcons
                        name={challenge.icon as any}
                        size={22}
                        color={isDark ? '#F8FAFC' : challenge.color}
                      />
                    </View>
                    <View style={styles.challengeInfo}>
                      <RNText style={[styles.challengeTitle, { color: palette.text }]}>
                        {challenge.title}
                      </RNText>
                      <View style={styles.challengeMeta}>
                        <View style={styles.challengeMetaItem}>
                          <MaterialCommunityIcons name="account-multiple" size={14} color={palette.textSecondary} />
                          <RNText style={[styles.challengeMetaText, { color: palette.textSecondary }]}>
                            {challenge.participants}
                          </RNText>
                        </View>
                        <View style={styles.challengeMetaItem}>
                          <MaterialCommunityIcons name="clock-outline" size={14} color={palette.textSecondary} />
                          <RNText style={[styles.challengeMetaText, { color: palette.textSecondary }]}>
                            {challenge.daysLeft} days left
                          </RNText>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.challengeProgress}>
                    <View style={styles.challengeProgressHeader}>
                      <RNText style={[styles.challengeProgressLabel, { color: palette.textSecondary }]}>
                        Progress
                      </RNText>
                      <RNText style={[styles.challengeProgressValue, { color: challenge.color }]}>
                        {challenge.progress}%
                      </RNText>
                    </View>
                    <View
                      style={[
                        styles.challengeProgressTrack,
                        { backgroundColor: isDark ? 'rgba(148,163,184,0.15)' : 'rgba(148,163,184,0.2)' },
                      ]}
                    >
                      <View
                        style={[
                          styles.challengeProgressFill,
                          {
                            width: `${Math.min(challenge.progress, 100)}%`,
                            backgroundColor: challenge.color,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={[styles.challengeReward, { backgroundColor: featureTint }]}>
                    <MaterialCommunityIcons name="gift" size={16} color={palette.primary} />
                    <RNText style={[styles.challengeRewardText, { color: palette.text }]}>
                      Win {formatCurrency(challenge.reward)} reward
                    </RNText>
                  </View>
                </View>
              ))}
            </>
          )}

          {/* Leaderboard Tab */}
          {selectedTab === 'leaderboard' && (
            <>
              {leaderboard.map((user) => (
                <Pressable
                  key={user.id}
                  style={[
                    styles.leaderboardCard,
                    {
                      backgroundColor: user.isCurrentUser ? palette.primary + '0F' : cardBackground,
                      borderColor: user.isCurrentUser ? palette.primary + '33' : separatorColor,
                      borderWidth: user.isCurrentUser ? 1.5 : StyleSheet.hairlineWidth,
                    },
                  ]}
                  onPress={() => {}}
                >
                  <View style={styles.leaderboardRank}>
                    <RNText style={[styles.leaderboardBadge, { color: palette.text }]}>
                      {user.badge}
                    </RNText>
                  </View>
                  <View style={styles.leaderboardInfo}>
                    <View style={styles.leaderboardNameRow}>
                      <RNText style={[styles.leaderboardName, { color: palette.text }]}>
                        {user.name}
                      </RNText>
                      {user.isCurrentUser && (
                        <View style={[styles.youBadge, { backgroundColor: palette.primary }]}>
                          <RNText style={styles.youBadgeText}>You</RNText>
                        </View>
                      )}
                    </View>
                    <RNText style={[styles.leaderboardSavings, { color: palette.textSecondary }]}>
                      {formatCurrency(user.savings)} saved
                    </RNText>
                  </View>
                  <MaterialCommunityIcons
                    name={user.trend === 'up' ? 'trending-up' : 'trending-down'}
                    size={20}
                    color={user.trend === 'up' ? (isDark ? '#6EE7B7' : '#059669') : (isDark ? '#FCA5A5' : '#DC2626')}
                  />
                </Pressable>
              ))}
            </>
          )}

          {/* Success Story Card */}
          <View
            style={[
              styles.storyCard,
              {
                backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(5,150,105,0.06)',
                borderColor: isDark ? 'rgba(110,231,183,0.2)' : 'rgba(5,150,105,0.15)',
              },
            ]}
          >
            <View style={[styles.storyIcon, { backgroundColor: palette.primary + '1F' }]}>
              <MaterialCommunityIcons name="star" size={20} color={palette.primary} />
            </View>
            <View style={styles.storyContent}>
              <RNText style={[styles.storyTitle, { color: palette.text }]}>
                Success Story
              </RNText>
              <RNText style={[styles.storyText, { color: palette.textSecondary }]}>
                "Thanks to GidiNest, I had everything ready when my baby arrived. The community support kept me motivated to save!" - Adeola M.
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
  statsSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  statValue: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
  },
  statLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderRadius: theme.borderRadius.xl,
    padding: 4,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
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
    fontSize: 12,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  groupCard: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupInfo: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  groupName: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 16,
    flex: 1,
  },
  groupBadge: {
    paddingHorizontal: theme.spacing.xs + 2,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
  },
  groupBadgeText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  groupDescription: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  groupStats: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  groupStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  groupStatText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
  },
  discoverSection: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
  },
  discoverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  discoverContent: {
    flex: 1,
    gap: theme.spacing.xs / 4,
  },
  discoverTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
  discoverSubtitle: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
  },
  challengeCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: theme.spacing.md,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  challengeHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  challengeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeInfo: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  challengeTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
  },
  challengeMeta: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  challengeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  challengeMetaText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
  },
  challengeProgress: {
    gap: theme.spacing.xs / 2,
  },
  challengeProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeProgressLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
  },
  challengeProgressValue: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 14,
  },
  challengeProgressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  challengeProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  challengeReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  challengeRewardText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 13,
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  leaderboardRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardBadge: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  leaderboardInfo: {
    flex: 1,
    gap: theme.spacing.xs / 4,
  },
  leaderboardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  leaderboardName: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
  youBadge: {
    paddingHorizontal: theme.spacing.xs + 2,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
  },
  youBadgeText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  leaderboardSavings: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
  },
  storyCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    marginTop: theme.spacing.sm,
  },
  storyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyContent: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  storyTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
  },
  storyText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
});




