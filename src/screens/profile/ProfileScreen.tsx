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
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import type { RootState } from '../../redux/types';

const formatCurrency = (value: number) => {
  return `₦${value.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export default function ProfileScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { palette, mode, toggleTheme } = useThemeMode();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';

  const bottomContentPadding = useMemo(
    () => insets.bottom + (Platform.OS === 'ios' ? 120 : 108),
    [insets.bottom]
  );

  // Mock user data
  const userName = user?.first_name || user?.name || 'GidiNest User';
  const userEmail = user?.email || 'user@gidinest.com';
  const userPhone = user?.phone || '+234 800 000 0000';

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
      { id: '1', icon: 'account-edit', label: 'Edit Profile', action: () => {} },
      { id: '2', icon: 'lock-reset', label: 'Change Password', action: () => {} },
      { id: '3', icon: 'shield-check', label: 'Security Settings', action: () => {} },
      { id: '4', icon: 'bank', label: 'Payment Methods', action: () => {} },
    ],
    []
  );

  const preferences = useMemo(
    () => [
      { id: '1', icon: 'bell-outline', label: 'Notifications', action: () => {} },
      { id: '2', icon: 'translate', label: 'Language', value: 'English', action: () => {} },
      { id: '3', icon: 'currency-ngn', label: 'Currency', value: 'NGN (₦)', action: () => {} },
    ],
    []
  );

  const supportOptions = useMemo(
    () => [
      { id: '1', icon: 'help-circle-outline', label: 'Help Center', action: () => {} },
      { id: '2', icon: 'message-text-outline', label: 'Contact Support', action: () => {} },
      { id: '3', icon: 'star-outline', label: 'Rate GidiNest', action: () => {} },
      { id: '4', icon: 'share-variant', label: 'Refer a Friend', action: () => {} },
    ],
    []
  );

  const legalOptions = useMemo(
    () => [
      { id: '1', icon: 'file-document-outline', label: 'Terms of Service', action: () => {} },
      { id: '2', icon: 'shield-lock-outline', label: 'Privacy Policy', action: () => {} },
      { id: '3', icon: 'information-outline', label: 'About GidiNest', value: 'v1.0.0', action: () => {} },
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
          onPress: () => {
            // Handle logout
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
