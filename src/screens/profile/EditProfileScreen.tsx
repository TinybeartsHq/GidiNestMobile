import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text as RNText,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import type { ProfileStackParamList } from '../../navigation/ProfileNavigator';
import type { RootState } from '../../redux/types';

type EditProfileNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'EditProfile'>;

const formatCurrency = (value: number) => {
  return `₦${value.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export default function EditProfileScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<EditProfileNavigationProp>();
  const user = useSelector((state: RootState) => state.auth.user);

  // Mock verification status - in real app, this would come from user state
  const [isVerified, setIsVerified] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'bvn' | 'nin' | null>(null);

  // Transaction limits based on verification status
  const limits = useMemo(() => {
    if (isVerified) {
      return {
        daily: 1000000,
        perTransaction: 500000,
        monthly: 10000000,
      };
    } else {
      return {
        daily: 50000,
        perTransaction: 10000,
        monthly: 500000,
      };
    }
  }, [isVerified]);

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';

  const bottomContentPadding = useMemo(
    () => insets.bottom + (Platform.OS === 'ios' ? 120 : 108),
    [insets.bottom]
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={[styles.backButton, { backgroundColor: featureTint }]}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color={palette.text} />
          </Pressable>
          <View style={styles.headerLeading}>
            <RNText style={[styles.headerTitle, { color: palette.text }]}>Profile</RNText>
            <View style={[styles.headerAccent, { backgroundColor: palette.primary }]} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomContentPadding }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatar, { backgroundColor: palette.primary + '1F' }]}>
              <RNText style={[styles.avatarText, { color: palette.primary }]}>
                {(user?.first_name || 'G').charAt(0).toUpperCase()}
              </RNText>
            </View>
            <RNText style={[styles.userName, { color: palette.text }]}>
              {user?.first_name} {user?.last_name}
            </RNText>
            <RNText style={[styles.userEmail, { color: palette.textSecondary }]}>
              {user?.email}
            </RNText>
          </View>

          {/* Verification Status */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Account Verification
            </RNText>
            <View
              style={[
                styles.verificationCard,
                {
                  backgroundColor: isVerified
                    ? isDark
                      ? 'rgba(16,185,129,0.1)'
                      : 'rgba(5,150,105,0.05)'
                    : isDark
                    ? 'rgba(251,191,36,0.1)'
                    : 'rgba(217,119,6,0.05)',
                  borderColor: isVerified
                    ? isDark
                      ? 'rgba(110,231,183,0.2)'
                      : 'rgba(5,150,105,0.15)'
                    : isDark
                    ? 'rgba(253,230,138,0.2)'
                    : 'rgba(217,119,6,0.15)',
                },
              ]}
            >
              <View
                style={[
                  styles.verificationIcon,
                  {
                    backgroundColor: isVerified
                      ? isDark
                        ? 'rgba(16,185,129,0.2)'
                        : 'rgba(5,150,105,0.1)'
                      : isDark
                      ? 'rgba(251,191,36,0.2)'
                      : 'rgba(217,119,6,0.1)',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={isVerified ? 'shield-check' : 'shield-alert-outline'}
                  size={24}
                  color={isVerified ? (isDark ? '#6EE7B7' : '#059669') : (isDark ? '#FDE68A' : '#D97706')}
                />
              </View>
              <View style={styles.verificationInfo}>
                <RNText style={[styles.verificationTitle, { color: palette.text }]}>
                  {isVerified ? 'Verified Account' : 'Unverified Account'}
                </RNText>
                <RNText style={[styles.verificationSubtitle, { color: palette.textSecondary }]}>
                  {isVerified
                    ? `Verified with ${verificationMethod === 'bvn' ? 'BVN' : 'NIN'}`
                    : 'Complete verification to increase limits'}
                </RNText>
              </View>
              <MaterialCommunityIcons
                name={isVerified ? 'check-circle' : 'chevron-right'}
                size={20}
                color={isVerified ? '#10B981' : palette.textSecondary}
              />
            </View>
          </View>

          {/* Transaction Limits */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Transaction Limits
            </RNText>
            <View
              style={[
                styles.limitsCard,
                {
                  backgroundColor: cardBackground,
                  borderColor: separatorColor,
                },
              ]}
            >
              <LimitRow
                icon="calendar-today"
                label="Daily Limit"
                value={formatCurrency(limits.daily)}
                palette={palette}
              />
              <View style={[styles.divider, { backgroundColor: separatorColor }]} />
              <LimitRow
                icon="cash-multiple"
                label="Per Transaction"
                value={formatCurrency(limits.perTransaction)}
                palette={palette}
              />
              <View style={[styles.divider, { backgroundColor: separatorColor }]} />
              <LimitRow
                icon="calendar-month"
                label="Monthly Limit"
                value={formatCurrency(limits.monthly)}
                palette={palette}
              />
            </View>
          </View>

          {/* Increase Limit Card */}
          {!isVerified && (
            <Pressable
              style={[
                styles.increaseLimitCard,
                {
                  backgroundColor: isDark ? 'rgba(124,58,237,0.1)' : 'rgba(139,92,246,0.05)',
                  borderColor: isDark ? 'rgba(167,139,250,0.25)' : 'rgba(139,92,246,0.2)',
                },
              ]}
              onPress={() => {
                // @ts-ignore
                navigation.navigate('SelectVerificationMethod');
              }}
            >
              <View
                style={[
                  styles.increaseLimitIcon,
                  { backgroundColor: isDark ? 'rgba(167,139,250,0.18)' : 'rgba(139,92,246,0.12)' },
                ]}
              >
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={24}
                  color={palette.primary}
                />
              </View>
              <View style={styles.increaseLimitContent}>
                <RNText style={[styles.increaseLimitTitle, { color: palette.text }]}>
                  Increase Your Limits
                </RNText>
                <RNText style={[styles.increaseLimitSubtitle, { color: palette.textSecondary }]}>
                  Complete KYC verification to unlock higher transaction limits
                </RNText>
              </View>
              <MaterialCommunityIcons name="arrow-right" size={20} color={palette.primary} />
            </Pressable>
          )}

          {/* Profile Actions */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Profile Settings
            </RNText>
            <View
              style={[
                styles.actionsCard,
                {
                  backgroundColor: cardBackground,
                  borderColor: separatorColor,
                },
              ]}
            >
              <Pressable
                style={styles.actionItem}
                onPress={() => {
                  // @ts-ignore
                  navigation.navigate('EditProfileDetails');
                }}
              >
                <View style={[styles.actionIcon, { backgroundColor: featureTint }]}>
                  <MaterialCommunityIcons name="account-edit" size={20} color={palette.primary} />
                </View>
                <View style={styles.actionContent}>
                  <RNText style={[styles.actionLabel, { color: palette.text }]}>
                    Edit Profile Details
                  </RNText>
                  <RNText style={[styles.actionDescription, { color: palette.textSecondary }]}>
                    Update your personal information
                  </RNText>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={palette.textSecondary} />
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function LimitRow({ icon, label, value, palette }: { icon: string; label: string; value: string; palette: any }) {
  return (
    <View style={styles.limitRow}>
      <View style={styles.limitLeft}>
        <MaterialCommunityIcons name={icon as any} size={20} color={palette.textSecondary} />
        <RNText style={[styles.limitLabel, { color: palette.textSecondary }]}>
          {label}
        </RNText>
      </View>
      <RNText style={[styles.limitValue, { color: palette.text }]}>
        {value}
      </RNText>
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLeading: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  headerTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  headerAccent: {
    height: 2,
    width: 28,
    borderRadius: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 32,
  },
  userName: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 20,
    marginTop: theme.spacing.xs,
  },
  userEmail: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  verificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  verificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationInfo: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  verificationTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 16,
  },
  verificationSubtitle: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  limitsCard: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  limitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  limitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  limitLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 15,
  },
  limitValue: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  increaseLimitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  increaseLimitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  increaseLimitContent: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  increaseLimitTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 16,
  },
  increaseLimitSubtitle: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  actionsCard: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.lg,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  actionLabel: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
  },
  actionDescription: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
});
