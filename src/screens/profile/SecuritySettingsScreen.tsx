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
import { Switch } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';

export default function SecuritySettingsScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

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
            <RNText style={[styles.headerTitle, { color: palette.text }]}>Security Settings</RNText>
            <View style={[styles.headerAccent, { backgroundColor: palette.primary }]} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomContentPadding }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Security Options */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Authentication
            </RNText>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: cardBackground,
                  borderColor: separatorColor,
                },
              ]}
            >
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <RNText style={[styles.settingLabel, { color: palette.text }]}>
                    Biometric Login
                  </RNText>
                  <RNText style={[styles.settingDescription, { color: palette.textSecondary }]}>
                    Use fingerprint or Face ID to login
                  </RNText>
                </View>
                <Switch value={biometricEnabled} onValueChange={setBiometricEnabled} />
              </View>

              <View style={[styles.divider, { backgroundColor: separatorColor }]} />

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <RNText style={[styles.settingLabel, { color: palette.text }]}>
                    Two-Factor Authentication
                  </RNText>
                  <RNText style={[styles.settingDescription, { color: palette.textSecondary }]}>
                    Add an extra layer of security
                  </RNText>
                </View>
                <Switch value={twoFactorEnabled} onValueChange={setTwoFactorEnabled} />
              </View>
            </View>
          </View>

          {/* Alerts */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>Alerts</RNText>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: cardBackground,
                  borderColor: separatorColor,
                },
              ]}
            >
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <RNText style={[styles.settingLabel, { color: palette.text }]}>
                    Login Alerts
                  </RNText>
                  <RNText style={[styles.settingDescription, { color: palette.textSecondary }]}>
                    Get notified of new login attempts
                  </RNText>
                </View>
                <Switch value={loginAlerts} onValueChange={setLoginAlerts} />
              </View>
            </View>
          </View>

          {/* Active Sessions */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Active Sessions
            </RNText>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: cardBackground,
                  borderColor: separatorColor,
                },
              ]}
            >
              <View style={styles.sessionRow}>
                <View style={[styles.sessionIcon, { backgroundColor: featureTint }]}>
                  <MaterialCommunityIcons name="cellphone" size={20} color={palette.text} />
                </View>
                <View style={styles.sessionInfo}>
                  <RNText style={[styles.sessionLabel, { color: palette.text }]}>
                    iPhone 14 Pro
                  </RNText>
                  <RNText style={[styles.sessionDescription, { color: palette.textSecondary }]}>
                    Lagos, Nigeria • Active now
                  </RNText>
                </View>
                <Pressable>
                  <RNText style={[styles.endSessionText, { color: '#EF4444' }]}>End</RNText>
                </Pressable>
              </View>
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
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  card: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  settingInfo: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  settingLabel: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
  },
  settingDescription: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionInfo: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  sessionLabel: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
  },
  sessionDescription: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
  },
  endSessionText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
});
