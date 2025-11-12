import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text as RNText,
  Pressable,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import { useAccount } from '../../hooks/useAccount';

const formatCurrency = (value: number) => {
  return `₦${value.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export default function TierInfoScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const navigation = useNavigation();
  const { tierInfo, tierInfoLoading, getTierInfo, error } = useAccount();

  const [refreshing, setRefreshing] = useState(false);
  const [expandedTier, setExpandedTier] = useState<string | null>(null);

  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';

  useEffect(() => {
    getTierInfo();
  }, []);

  // Debug log to see what data structure we're getting
  useEffect(() => {
    if (tierInfo) {
      console.log('TierInfo Data:', JSON.stringify(tierInfo, null, 2));
      if (tierInfo.current_tier) {
        console.log('Current Tier Features:', tierInfo.current_tier.features);
        console.log('Current Tier Requirements:', tierInfo.current_tier.requirements);
      }
      if (tierInfo.upgrade_options) {
        console.log('Upgrade Options:', tierInfo.upgrade_options);
      }
    }
  }, [tierInfo]);

  const onRefresh = async () => {
    setRefreshing(true);
    await getTierInfo();
    setRefreshing(false);
  };

  const getTierColor = (tierName: string) => {
    if (tierName.includes('1')) return '#3B82F6'; // Blue
    if (tierName.includes('2')) return '#8B5CF6'; // Purple
    if (tierName.includes('3')) return '#F59E0B'; // Gold
    return '#6B7280'; // Gray
  };

  const getTierIcon = (tierName: string) => {
    if (tierName.includes('1')) return 'numeric-1-circle';
    if (tierName.includes('2')) return 'numeric-2-circle';
    if (tierName.includes('3')) return 'numeric-3-circle';
    return 'circle-outline';
  };

  const renderTierCard = (
    tier: any,
    isCurrent: boolean = false,
    tierKey: string = ''
  ) => {
    const tierColor = getTierColor(tier.name);
    const tierIcon = getTierIcon(tier.name);
    const isExpanded = expandedTier === tierKey;

    return (
      <Pressable
        key={tierKey}
        style={[
          styles.tierCard,
          {
            backgroundColor: featureTint,
            borderColor: isCurrent
              ? tierColor
              : isDark
              ? 'rgba(148, 163, 184, 0.2)'
              : 'rgba(148, 163, 184, 0.15)',
            borderWidth: isCurrent ? 2 : 1,
          },
        ]}
        onPress={() => setExpandedTier(isExpanded ? null : tierKey)}
      >
        {/* Header */}
        <View style={styles.tierHeader}>
          <View style={styles.tierTitleContainer}>
            <MaterialCommunityIcons name={tierIcon} size={28} color={tierColor} />
            <View style={{ flex: 1 }}>
              <RNText style={[styles.tierName, { color: palette.text }]}>
                {tier.name.replace('_', ' ')}
              </RNText>
              {isCurrent && (
                <RNText style={[styles.currentBadgeText, { color: tierColor }]}>
                  Current Tier
                </RNText>
              )}
            </View>
          </View>

          <MaterialCommunityIcons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={palette.textSecondary}
          />
        </View>

        {/* Limits */}
        <View style={styles.limitsContainer}>
          <View style={styles.limitItem}>
            <RNText style={[styles.limitLabel, { color: palette.textSecondary }]}>
              Daily Limit
            </RNText>
            <RNText style={[styles.limitValue, { color: palette.text }]}>
              {formatCurrency(tier.daily_transaction_limit)}
            </RNText>
          </View>

          <View style={styles.limitItem}>
            <RNText style={[styles.limitLabel, { color: palette.textSecondary }]}>
              Cumulative Limit
            </RNText>
            <RNText style={[styles.limitValue, { color: palette.text }]}>
              {formatCurrency(tier.cumulative_transaction_limit)}
            </RNText>
          </View>

          <View style={styles.limitItem}>
            <RNText style={[styles.limitLabel, { color: palette.textSecondary }]}>
              Wallet Balance Limit
            </RNText>
            <RNText style={[styles.limitValue, { color: palette.text }]}>
              {formatCurrency(tier.wallet_balance_limit)}
            </RNText>
          </View>
        </View>

        {/* Expandable Content */}
        {isExpanded && (
          <>
            {/* Features */}
            {tier.features && Array.isArray(tier.features) && tier.features.length > 0 && (
              <View style={styles.expandedSection}>
                <RNText style={[styles.sectionTitle, { color: palette.text }]}>
                  Features
                </RNText>
                <View style={styles.featuresList}>
                  {tier.features.map((feature: any, index: number) => (
                    <View key={index} style={styles.featureItem}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={16}
                        color="#22C55E"
                      />
                      <RNText style={[styles.featureText, { color: palette.text }]}>
                        {typeof feature === 'string' ? feature : feature.description || JSON.stringify(feature)}
                      </RNText>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Requirements */}
            {tier.requirements && Array.isArray(tier.requirements) && tier.requirements.length > 0 && (
              <View style={styles.expandedSection}>
                <RNText style={[styles.sectionTitle, { color: palette.text }]}>
                  Requirements
                </RNText>
                <View style={styles.requirementsList}>
                  {tier.requirements.map((requirement: any, index: number) => (
                    <View key={index} style={styles.requirementItem}>
                      <MaterialCommunityIcons
                        name="circle-small"
                        size={20}
                        color={palette.textSecondary}
                      />
                      <RNText style={[styles.requirementText, { color: palette.textSecondary }]}>
                        {typeof requirement === 'string' ? requirement : requirement.description || JSON.stringify(requirement)}
                      </RNText>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Upgrade Button */}
            {!isCurrent && tier.can_upgrade && (
              <Pressable
                style={[styles.upgradeButton, { backgroundColor: tierColor }]}
                onPress={() => {
                  // @ts-ignore
                  navigation.navigate('VerificationStatus');
                }}
              >
                <RNText style={styles.upgradeButtonText}>
                  Upgrade to {tier.name.replace('_', ' ')}
                </RNText>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
              </Pressable>
            )}
          </>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: featureTint }]}>
          <Pressable
            style={[styles.backButton, { backgroundColor: featureTint }]}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={palette.text} />
          </Pressable>
          <RNText style={[styles.headerTitle, { color: palette.text }]}>
            Account Tier
          </RNText>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {error ? (
            <View style={[styles.errorCard, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
              <MaterialCommunityIcons name="alert-circle" size={24} color="#EF4444" />
              <RNText style={[styles.errorText, { color: '#EF4444' }]}>
                {error}
              </RNText>
            </View>
          ) : tierInfo ? (
            <>
              {/* Current Tier Card */}
              <View style={styles.section}>
                <RNText style={[styles.sectionHeader, { color: palette.text }]}>
                  Your Current Tier
                </RNText>
                {renderTierCard(tierInfo.current_tier, true, 'current')}
              </View>

              {/* Verification Status Card */}
              <View style={styles.section}>
                <RNText style={[styles.sectionHeader, { color: palette.text }]}>
                  Verification Status
                </RNText>
                <View style={[styles.verificationCard, { backgroundColor: featureTint }]}>
                  <View style={styles.verificationItem}>
                    <View style={styles.verificationItemLeft}>
                      <MaterialCommunityIcons name="bank" size={20} color={palette.text} />
                      <RNText style={[styles.verificationLabel, { color: palette.text }]}>
                        BVN Verified
                      </RNText>
                    </View>
                    <View style={styles.verificationStatus}>
                      <MaterialCommunityIcons
                        name={
                          tierInfo.verification_status.has_bvn
                            ? 'check-circle'
                            : 'close-circle'
                        }
                        size={18}
                        color={tierInfo.verification_status.has_bvn ? '#22C55E' : '#EF4444'}
                      />
                      <RNText
                        style={[
                          styles.verificationStatusText,
                          {
                            color: tierInfo.verification_status.has_bvn ? '#22C55E' : '#EF4444',
                          },
                        ]}
                      >
                        {tierInfo.verification_status.has_bvn ? 'Yes' : 'No'}
                      </RNText>
                    </View>
                  </View>

                  <View style={styles.verificationItem}>
                    <View style={styles.verificationItemLeft}>
                      <MaterialCommunityIcons
                        name="card-account-details"
                        size={20}
                        color={palette.text}
                      />
                      <RNText style={[styles.verificationLabel, { color: palette.text }]}>
                        NIN Verified
                      </RNText>
                    </View>
                    <View style={styles.verificationStatus}>
                      <MaterialCommunityIcons
                        name={
                          tierInfo.verification_status.has_nin
                            ? 'check-circle'
                            : 'close-circle'
                        }
                        size={18}
                        color={tierInfo.verification_status.has_nin ? '#22C55E' : '#EF4444'}
                      />
                      <RNText
                        style={[
                          styles.verificationStatusText,
                          {
                            color: tierInfo.verification_status.has_nin ? '#22C55E' : '#EF4444',
                          },
                        ]}
                      >
                        {tierInfo.verification_status.has_nin ? 'Yes' : 'No'}
                      </RNText>
                    </View>
                  </View>

                  <View style={styles.verificationItem}>
                    <View style={styles.verificationItemLeft}>
                      <MaterialCommunityIcons name="wallet" size={20} color={palette.text} />
                      <RNText style={[styles.verificationLabel, { color: palette.text }]}>
                        Virtual Wallet
                      </RNText>
                    </View>
                    <View style={styles.verificationStatus}>
                      <MaterialCommunityIcons
                        name={
                          tierInfo.verification_status.has_virtual_wallet
                            ? 'check-circle'
                            : 'close-circle'
                        }
                        size={18}
                        color={
                          tierInfo.verification_status.has_virtual_wallet ? '#22C55E' : '#EF4444'
                        }
                      />
                      <RNText
                        style={[
                          styles.verificationStatusText,
                          {
                            color: tierInfo.verification_status.has_virtual_wallet
                              ? '#22C55E'
                              : '#EF4444',
                          },
                        ]}
                      >
                        {tierInfo.verification_status.has_virtual_wallet ? 'Active' : 'Inactive'}
                      </RNText>
                    </View>
                  </View>
                </View>
              </View>

              {/* Upgrade Options */}
              {tierInfo.upgrade_options && Array.isArray(tierInfo.upgrade_options) && tierInfo.upgrade_options.length > 0 && (
                <View style={styles.section}>
                  <RNText style={[styles.sectionHeader, { color: palette.text }]}>
                    How to Upgrade
                  </RNText>
                  <View
                    style={[
                      styles.upgradeOptionsCard,
                      {
                        backgroundColor: isDark
                          ? 'rgba(59,130,246,0.1)'
                          : 'rgba(59,130,246,0.05)',
                        borderColor: isDark
                          ? 'rgba(147,197,253,0.2)'
                          : 'rgba(59,130,246,0.15)',
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name="information-outline" size={24} color="#3B82F6" />
                    <View style={{ flex: 1 }}>
                      {tierInfo.upgrade_options.map((option: any, index: number) => (
                        <RNText key={index} style={[styles.upgradeOption, { color: palette.text }]}>
                          • {typeof option === 'string' ? option : option.description || JSON.stringify(option)}
                        </RNText>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* All Tiers */}
              <View style={styles.section}>
                <RNText style={[styles.sectionHeader, { color: palette.text }]}>
                  All Available Tiers
                </RNText>
                {tierInfo.all_tiers.tier_1 && renderTierCard(tierInfo.all_tiers.tier_1, false, 'tier_1')}
                {tierInfo.all_tiers.tier_2 && renderTierCard(tierInfo.all_tiers.tier_2, false, 'tier_2')}
                {tierInfo.all_tiers.tier_3 && renderTierCard(tierInfo.all_tiers.tier_3, false, 'tier_3')}
              </View>
            </>
          ) : (
            <View style={styles.loadingContainer}>
              <RNText style={[styles.loadingText, { color: palette.textSecondary }]}>
                {tierInfoLoading ? 'Loading tier information...' : 'Pull to refresh'}
              </RNText>
            </View>
          )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : theme.spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  tierCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  tierTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  tierName: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  currentBadgeText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 12,
    marginTop: 2,
  },
  limitsContainer: {
    gap: theme.spacing.sm,
  },
  limitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  limitLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  limitValue: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 14,
  },
  expandedSection: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.15)',
  },
  sectionTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 14,
    marginBottom: theme.spacing.sm,
  },
  featuresList: {
    gap: theme.spacing.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  featureText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    flex: 1,
  },
  requirementsList: {
    gap: 4,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  requirementText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    flex: 1,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  upgradeButtonText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  verificationCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verificationItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  verificationLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  verificationStatusText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 13,
  },
  upgradeOptionsCard: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
  },
  upgradeOption: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  errorText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  loadingText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
  },
});
