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

export default function VerificationStatusScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const navigation = useNavigation();
  const {
    verificationStatus,
    verificationLoading,
    getVerificationStatus,
    verificationError,
  } = useAccount();

  const [refreshing, setRefreshing] = useState(false);

  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';

  useEffect(() => {
    getVerificationStatus();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await getVerificationStatus();
    setRefreshing(false);
  };

  const maskNumber = (number: string) => {
    if (!number || number.length < 4) return '***';
    return '*'.repeat(number.length - 4) + number.slice(-4);
  };

  const renderVerificationCard = (
    type: 'BVN' | 'NIN',
    verified: boolean,
    data?: {
      number?: string;
      verified_name?: string;
      dob?: string;
    }
  ) => {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: featureTint,
            borderColor: verified
              ? isDark
                ? 'rgba(34,197,94,0.3)'
                : 'rgba(34,197,94,0.2)'
              : isDark
              ? 'rgba(148, 163, 184, 0.2)'
              : 'rgba(148, 163, 184, 0.15)',
            borderWidth: verified ? 1.5 : 1,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <MaterialCommunityIcons
              name={type === 'BVN' ? 'bank' : 'card-account-details'}
              size={24}
              color={verified ? '#22C55E' : palette.textSecondary}
            />
            <RNText style={[styles.cardTitle, { color: palette.text }]}>
              {type} Verification
            </RNText>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: verified
                  ? isDark
                    ? 'rgba(34,197,94,0.15)'
                    : 'rgba(34,197,94,0.1)'
                  : isDark
                  ? 'rgba(239,68,68,0.15)'
                  : 'rgba(239,68,68,0.1)',
              },
            ]}
          >
            <MaterialCommunityIcons
              name={verified ? 'check-circle' : 'close-circle'}
              size={16}
              color={verified ? '#22C55E' : '#EF4444'}
            />
            <RNText
              style={[
                styles.statusText,
                { color: verified ? '#22C55E' : '#EF4444' },
              ]}
            >
              {verified ? 'Verified' : 'Not Verified'}
            </RNText>
          </View>
        </View>

        {/* Details */}
        {verified && data ? (
          <View style={styles.cardContent}>
            {data.number && (
              <View style={styles.detailRow}>
                <RNText style={[styles.detailLabel, { color: palette.textSecondary }]}>
                  {type} Number
                </RNText>
                <RNText style={[styles.detailValue, { color: palette.text }]}>
                  {maskNumber(data.number)}
                </RNText>
              </View>
            )}
            {data.verified_name && (
              <View style={styles.detailRow}>
                <RNText style={[styles.detailLabel, { color: palette.textSecondary }]}>
                  Verified Name
                </RNText>
                <RNText style={[styles.detailValue, { color: palette.text }]}>
                  {data.verified_name}
                </RNText>
              </View>
            )}
            {data.dob && (
              <View style={styles.detailRow}>
                <RNText style={[styles.detailLabel, { color: palette.textSecondary }]}>
                  Date of Birth
                </RNText>
                <RNText style={[styles.detailValue, { color: palette.text }]}>
                  {new Date(data.dob).toLocaleDateString()}
                </RNText>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.cardContent}>
            <RNText style={[styles.notVerifiedText, { color: palette.textSecondary }]}>
              Complete {type} verification to unlock higher transaction limits and access more features.
            </RNText>

            <Pressable
              style={[styles.verifyButton, { backgroundColor: palette.primary }]}
              onPress={() => {
                // @ts-ignore
                navigation.navigate(type === 'BVN' ? 'BVNVerification' : 'NINVerification');
              }}
            >
              <RNText style={styles.verifyButtonText}>
                Verify {type}
              </RNText>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        )}
      </View>
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
            Verification Status
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
          {verificationError ? (
            <View style={[styles.errorCard, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
              <MaterialCommunityIcons name="alert-circle" size={24} color="#EF4444" />
              <RNText style={[styles.errorText, { color: '#EF4444' }]}>
                {verificationError}
              </RNText>
            </View>
          ) : verificationStatus ? (
            <>
              {/* BVN Verification Card */}
              {renderVerificationCard(
                'BVN',
                verificationStatus.bvn.verified,
                verificationStatus.bvn.verified
                  ? {
                      number: verificationStatus.bvn.bvn_number,
                      verified_name: verificationStatus.bvn.verified_name,
                      dob: verificationStatus.bvn.dob,
                    }
                  : undefined
              )}

              {/* NIN Verification Card */}
              {renderVerificationCard(
                'NIN',
                verificationStatus.nin.verified,
                verificationStatus.nin.verified
                  ? {
                      number: verificationStatus.nin.nin_number,
                      verified_name: verificationStatus.nin.verified_name,
                      dob: verificationStatus.nin.dob,
                    }
                  : undefined
              )}

              {/* Account Info Card */}
              <View style={[styles.card, { backgroundColor: featureTint }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <MaterialCommunityIcons
                      name="account"
                      size={24}
                      color={palette.text}
                    />
                    <RNText style={[styles.cardTitle, { color: palette.text }]}>
                      Account Information
                    </RNText>
                  </View>
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.detailRow}>
                    <RNText style={[styles.detailLabel, { color: palette.textSecondary }]}>
                      Account Tier
                    </RNText>
                    <RNText style={[styles.detailValue, { color: palette.text }]}>
                      {verificationStatus.account_info.account_tier}
                    </RNText>
                  </View>

                  <View style={styles.detailRow}>
                    <RNText style={[styles.detailLabel, { color: palette.textSecondary }]}>
                      Virtual Wallet
                    </RNText>
                    <View style={styles.detailValueWithIcon}>
                      <MaterialCommunityIcons
                        name={
                          verificationStatus.account_info.has_virtual_wallet
                            ? 'check-circle'
                            : 'close-circle'
                        }
                        size={16}
                        color={
                          verificationStatus.account_info.has_virtual_wallet
                            ? '#22C55E'
                            : '#EF4444'
                        }
                      />
                      <RNText style={[styles.detailValue, { color: palette.text }]}>
                        {verificationStatus.account_info.has_virtual_wallet ? 'Active' : 'Inactive'}
                      </RNText>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <RNText style={[styles.detailLabel, { color: palette.textSecondary }]}>
                      Profile Name
                    </RNText>
                    <RNText style={[styles.detailValue, { color: palette.text }]}>
                      {verificationStatus.account_info.profile_name}
                    </RNText>
                  </View>

                  {verificationStatus.account_info.profile_dob && (
                    <View style={styles.detailRow}>
                      <RNText style={[styles.detailLabel, { color: palette.textSecondary }]}>
                        Date of Birth
                      </RNText>
                      <RNText style={[styles.detailValue, { color: palette.text }]}>
                        {new Date(verificationStatus.account_info.profile_dob).toLocaleDateString()}
                      </RNText>
                    </View>
                  )}
                </View>
              </View>

              {/* Info Card */}
              <View
                style={[
                  styles.infoCard,
                  {
                    backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)',
                    borderColor: isDark ? 'rgba(147,197,253,0.2)' : 'rgba(59,130,246,0.15)',
                  },
                ]}
              >
                <MaterialCommunityIcons name="information-outline" size={20} color="#3B82F6" />
                <RNText style={[styles.infoText, { color: palette.textSecondary }]}>
                  Verifying your BVN and NIN unlocks higher transaction limits and allows you to access more features.
                </RNText>
              </View>
            </>
          ) : (
            <View style={styles.loadingContainer}>
              <RNText style={[styles.loadingText, { color: palette.textSecondary }]}>
                {verificationLoading ? 'Loading verification status...' : 'Pull to refresh'}
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
  card: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  cardTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 12,
  },
  cardContent: {
    gap: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  detailValue: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 13,
    textAlign: 'right',
  },
  detailValueWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  notVerifiedText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  verifyButtonText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  infoCard: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
  },
  infoText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
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
