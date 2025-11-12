import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text as RNText,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { Switch } from 'react-native-paper';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import type { RootState } from '../../redux/types';
import type { ProfileStackParamList } from '../../navigation/ProfileNavigator';
import { useAuthV2 } from '../../hooks/useAuthV2';
import RestrictionBanner from '../../components/RestrictionBanner';

const formatCurrency = (value: number) => {
  return `₦${value.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

type ProfileNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileHome'>;

export default function ProfileScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { palette, mode, toggleTheme } = useThemeMode();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ProfileNavigationProp>();
  const { logout, user: userV2, isRestricted } = useAuthV2();

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';

  const bottomContentPadding = useMemo(
    () => insets.bottom + (Platform.OS === 'ios' ? 120 : 108),
    [insets.bottom]
  );

  // User data - prefer V2 if available
  const currentUser = userV2 || user;
  const userName = currentUser?.first_name || currentUser?.name || 'GidiNest User';
  const userEmail = currentUser?.email || 'user@gidinest.com';
  const userPhone = currentUser?.phone || '+234 800 000 0000';
  const accountTier = userV2?.account_tier || 'Tier 1';

  // Mock stats
  const stats = useMemo(
    () => [
      {
        id: '1',
        icon: 'piggy-bank',
        label: 'Total Saved',
        value: formatCurrency(515000),
        color: palette.primary,
      },
      {
        id: '2',
        icon: 'flag-checkered',
        label: 'Active Goals',
        value: '3',
        color: isDark ? '#6EE7B7' : '#059669',
      },
      {
        id: '3',
        icon: 'gift',
        label: 'Gifts Received',
        value: formatCurrency(210000),
        color: isDark ? '#F9A8D4' : '#EC4899',
      },
    ],
    [isDark, palette.primary]
  );

  const accountSettings = useMemo(
    () => [
      { id: '1', icon: 'account-edit', label: 'Edit Profile', action: () => {
        // @ts-ignore - Navigate to root navigator
        const rootNav = navigation.getParent()?.getParent();
        if (rootNav) {
          rootNav.navigate('ProfileEdit');
        }
      }},
      { id: '2', icon: 'shield-check-outline', label: 'Verification Status', action: () => {
        // @ts-ignore - Navigate to root navigator
        const rootNav = navigation.getParent()?.getParent();
        if (rootNav) {
          rootNav.navigate('VerificationStatus');
        }
      }},
      { id: '3', icon: 'trophy', label: 'Account Tier', action: () => {
        // @ts-ignore - Navigate to root navigator
        const rootNav = navigation.getParent()?.getParent();
        if (rootNav) {
          rootNav.navigate('TierInfo');
        }
      }},
      { id: '4', icon: 'lock-reset', label: 'Change Password', action: () => navigation.navigate('ChangePassword') },
      { id: '5', icon: 'shield-check', label: 'Security Settings', action: () => navigation.navigate('SecuritySettings') },
      { id: '6', icon: 'bank', label: 'Payment Methods', action: () => navigation.navigate('PaymentMethods') },
    ],
    [navigation]
  );

  const preferences = useMemo(
    () => [
      { id: '1', icon: 'bell-outline', label: 'Notifications', action: () => navigation.navigate('Notifications') },
      { id: '2', icon: 'translate', label: 'Language', value: 'English', action: () => Alert.alert('Language', 'Language settings coming soon!') },
      { id: '3', icon: 'currency-ngn', label: 'Currency', value: 'NGN (₦)', action: () => Alert.alert('Currency', 'Currency settings coming soon!') },
    ],
    [navigation]
  );

  const supportOptions = useMemo(
    () => [
      { id: '1', icon: 'help-circle-outline', label: 'Help Center', action: () => Alert.alert('Help Center', 'Visit our help center at help.gidinest.com') },
      { id: '2', icon: 'message-text-outline', label: 'Contact Support', action: () => Alert.alert('Contact Support', 'Email us at support@gidinest.com or call +234 800 000 0000') },
      { id: '3', icon: 'star-outline', label: 'Rate GidiNest', action: () => Alert.alert('Rate Us', 'Thank you for using GidiNest! Please rate us on the App Store.') },
      { id: '4', icon: 'share-variant', label: 'Refer a Friend', action: () => Alert.alert('Refer a Friend', 'Share GidiNest: https://gidinest.com/refer') },
    ],
    []
  );

  const legalOptions = useMemo(
    () => [
      { id: '1', icon: 'file-document-outline', label: 'Terms of Service', action: () => Alert.alert('Terms of Service', 'View our terms at gidinest.com/terms') },
      { id: '2', icon: 'shield-lock-outline', label: 'Privacy Policy', action: () => Alert.alert('Privacy Policy', 'View our privacy policy at gidinest.com/privacy') },
      { id: '3', icon: 'information-outline', label: 'About GidiNest', value: 'v1.0.0', action: () => Alert.alert('About GidiNest', 'GidiNest - Your partner in saving for childbirth and your baby.\n\nVersion 1.0.0\n\n© 2024 GidiNest') },
    ],
    []
  );

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout().unwrap();

              // Clear stored credentials for passcode auth
              await SecureStore.deleteItemAsync('user_passcode');
              await SecureStore.deleteItemAsync('user_email');
              await SecureStore.deleteItemAsync('has_passcode_setup');
              // Note: We keep biometric_enabled - it's a user preference that should persist across sessions
              // Only clear it if user explicitly disables it in Security Settings

              // Navigate to root navigator and reset to AuthLanding
              const rootNavigation = navigation.getParent()?.getParent();
              if (rootNavigation) {
                rootNavigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'AuthLanding' }],
                  })
                );
              } else {
                // Fallback: try direct navigation if parent structure is different
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'AuthLanding' }],
                  })
                );
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomContentPadding }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.header}>
            <View style={styles.headerLeading}>
              <RNText style={[styles.headerTitle, { color: palette.text }]}>Profile</RNText>
              <View style={[styles.headerAccent, { backgroundColor: palette.primary }]} />
            </View>
          </View>

          {/* Restriction Banner */}
          {isRestricted && <RestrictionBanner showDetails={true} />}

          {/* User Info Card */}
          <View
            style={[
              styles.userCard,
              {
                backgroundColor: cardBackground,
                borderColor: separatorColor,
              },
            ]}
          >
            <View style={styles.userInfo}>
              <View style={[styles.avatar, { backgroundColor: palette.primary + '1F' }]}>
                <RNText style={[styles.avatarText, { color: palette.primary }]}>
                  {userName.charAt(0).toUpperCase()}
                </RNText>
              </View>
              <View style={styles.userDetails}>
                <RNText style={[styles.userName, { color: palette.text }]}>{userName}</RNText>
                <View style={styles.userContactRow}>
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={14}
                    color={palette.textSecondary}
                  />
                  <RNText style={[styles.userContact, { color: palette.textSecondary }]}>
                    {userEmail}
                  </RNText>
                </View>
                <View style={styles.userContactRow}>
                  <MaterialCommunityIcons
                    name="phone-outline"
                    size={14}
                    color={palette.textSecondary}
                  />
                  <RNText style={[styles.userContact, { color: palette.textSecondary }]}>
                    {userPhone}
                  </RNText>
                </View>
              </View>
            </View>

            {/* Stats */}
            <View style={[styles.divider, { backgroundColor: separatorColor }]} />
            <View style={styles.statsRow}>
              {stats.map((stat) => (
                <View key={stat.id} style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: stat.color + '1F' }]}>
                    <MaterialCommunityIcons name={stat.icon as any} size={20} color={stat.color} />
                  </View>
                  <RNText style={[styles.statValue, { color: palette.text }]}>{stat.value}</RNText>
                  <RNText style={[styles.statLabel, { color: palette.textSecondary }]}>
                    {stat.label}
                  </RNText>
                </View>
              ))}
            </View>
          </View>

          {/* Account Settings */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Account Settings
            </RNText>
            <View
              style={[
                styles.menuCard,
                {
                  backgroundColor: cardBackground,
                  borderColor: separatorColor,
                },
              ]}
            >
              {accountSettings.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index > 0 && <View style={[styles.menuDivider, { backgroundColor: separatorColor }]} />}
                  <Pressable style={styles.menuItem} onPress={item.action}>
                    <View style={[styles.menuIcon, { backgroundColor: featureTint }]}>
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={20}
                        color={palette.text}
                      />
                    </View>
                    <RNText style={[styles.menuLabel, { color: palette.text }]}>
                      {item.label}
                    </RNText>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color={palette.textSecondary}
                    />
                  </Pressable>
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>Preferences</RNText>
            <View
              style={[
                styles.menuCard,
                {
                  backgroundColor: cardBackground,
                  borderColor: separatorColor,
                },
              ]}
            >
              {/* Dark Mode Toggle */}
              <Pressable style={styles.menuItem} onPress={toggleTheme}>
                <View style={[styles.menuIcon, { backgroundColor: featureTint }]}>
                  <MaterialCommunityIcons
                    name={isDark ? 'weather-night' : 'weather-sunny'}
                    size={20}
                    color={palette.text}
                  />
                </View>
                <RNText style={[styles.menuLabel, { color: palette.text }]}>Dark Mode</RNText>
                <Switch value={isDark} onValueChange={toggleTheme} />
              </Pressable>

              <View style={[styles.menuDivider, { backgroundColor: separatorColor }]} />

              {preferences.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index > 0 && <View style={[styles.menuDivider, { backgroundColor: separatorColor }]} />}
                  <Pressable style={styles.menuItem} onPress={item.action}>
                    <View style={[styles.menuIcon, { backgroundColor: featureTint }]}>
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={20}
                        color={palette.text}
                      />
                    </View>
                    <RNText style={[styles.menuLabel, { color: palette.text }]}>
                      {item.label}
                    </RNText>
                    {item.value && (
                      <RNText style={[styles.menuValue, { color: palette.textSecondary }]}>
                        {item.value}
                      </RNText>
                    )}
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color={palette.textSecondary}
                    />
                  </Pressable>
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* Support & Help */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>Support & Help</RNText>
            <View
              style={[
                styles.menuCard,
                {
                  backgroundColor: cardBackground,
                  borderColor: separatorColor,
                },
              ]}
            >
              {supportOptions.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index > 0 && <View style={[styles.menuDivider, { backgroundColor: separatorColor }]} />}
                  <Pressable style={styles.menuItem} onPress={item.action}>
                    <View style={[styles.menuIcon, { backgroundColor: featureTint }]}>
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={20}
                        color={palette.text}
                      />
                    </View>
                    <RNText style={[styles.menuLabel, { color: palette.text }]}>
                      {item.label}
                    </RNText>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color={palette.textSecondary}
                    />
                  </Pressable>
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* Legal & About */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>Legal & About</RNText>
            <View
              style={[
                styles.menuCard,
                {
                  backgroundColor: cardBackground,
                  borderColor: separatorColor,
                },
              ]}
            >
              {legalOptions.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index > 0 && <View style={[styles.menuDivider, { backgroundColor: separatorColor }]} />}
                  <Pressable style={styles.menuItem} onPress={item.action}>
                    <View style={[styles.menuIcon, { backgroundColor: featureTint }]}>
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={20}
                        color={palette.text}
                      />
                    </View>
                    <RNText style={[styles.menuLabel, { color: palette.text }]}>
                      {item.label}
                    </RNText>
                    {item.value && (
                      <RNText style={[styles.menuValue, { color: palette.textSecondary }]}>
                        {item.value}
                      </RNText>
                    )}
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color={palette.textSecondary}
                    />
                  </Pressable>
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* Logout Button */}
          <Pressable
            style={[styles.logoutButton, { backgroundColor: '#EF4444' }]}
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout" size={20} color="#FFFFFF" />
            <RNText style={styles.logoutButtonText}>Logout</RNText>
          </Pressable>
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
  content: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  header: {
    paddingVertical: theme.spacing.md,
  },
  headerLeading: {
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  headerTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 24,
  },
  headerAccent: {
    height: 2,
    width: 36,
    borderRadius: 1,
  },
  userCard: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 32,
  },
  userDetails: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  userName: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 20,
  },
  userContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  userContact: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
  },
  statLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 11,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  menuCard: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
  },
  menuValue: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    marginRight: theme.spacing.xs,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: theme.spacing.lg + 40 + theme.spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md + 2,
    borderRadius: theme.borderRadius.xl,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  logoutButtonText: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
