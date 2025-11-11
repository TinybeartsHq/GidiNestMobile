import React, { useState, useMemo, useEffect } from 'react';
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
import { Switch } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import {
  isBiometricAvailable,
  getBiometricLabel,
  authenticateWithBiometric,
} from '../../utils/biometric';
import { useAuthV2, usePasscode, usePin } from '../../hooks/useAuthV2';
import * as SecureStore from 'expo-secure-store';

export default function SecuritySettingsScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuthV2();
  const { hasPasscode: hasPasscodeV2 } = usePasscode();
  const { hasPin: hasPinV2, checkStatus } = usePin();

  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Biometric');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  // Use V2 user data for passcode/PIN status
  const hasPasscode = user?.has_passcode || hasPasscodeV2;
  const hasPIN = user?.has_pin || hasPinV2;

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';

  const bottomContentPadding = useMemo(
    () => insets.bottom + (Platform.OS === 'ios' ? 120 : 108),
    [insets.bottom]
  );

  useEffect(() => {
    checkBiometric();
    checkBiometricSettings();
    checkStatus();
  }, []);

  const checkBiometric = async () => {
    const available = await isBiometricAvailable();
    setBiometricAvailable(available);

    if (available) {
      const label = await getBiometricLabel();
      setBiometricLabel(label);
    }
  };

  const checkBiometricSettings = async () => {
    try {
      const enabled = await SecureStore.getItemAsync('biometric_enabled');
      setBiometricEnabled(enabled === 'true');
    } catch (error) {
      console.error('Error checking biometric settings:', error);
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    if (value) {
      // Enabling biometric - authenticate first
      const result = await authenticateWithBiometric(
        `Enable ${biometricLabel} for quick login`
      );

      if (result.success) {
        setBiometricEnabled(true);
        await SecureStore.setItemAsync('biometric_enabled', 'true');
        Alert.alert(
          'Success',
          `${biometricLabel} authentication enabled successfully!`
        );
      } else {
        Alert.alert('Authentication Failed', result.error || 'Please try again');
      }
    } else {
      // Disabling biometric - show confirmation
      Alert.alert(
        `Disable ${biometricLabel}`,
        `Are you sure you want to disable ${biometricLabel} authentication?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              setBiometricEnabled(false);
              await SecureStore.setItemAsync('biometric_enabled', 'false');
            },
          },
        ]
      );
    }
  };

  const handleManagePasscode = () => {
    if (hasPasscode) {
      // Change passcode
      // @ts-ignore
      navigation.navigate('PasscodeSetup', { mode: 'change' });
    } else {
      // Setup passcode
      // @ts-ignore
      navigation.navigate('PasscodeSetup');
    }
  };

  const handleManagePIN = () => {
    if (hasPIN) {
      // Change PIN
      // @ts-ignore
      navigation.navigate('PINSetup', { mode: 'change' });
    } else {
      // Setup PIN
      // @ts-ignore
      navigation.navigate('PINSetup');
    }
  };

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
          {/* Passcode & PIN */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Passcode & PIN
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
              {/* Login Passcode */}
              <Pressable style={styles.menuItem} onPress={handleManagePasscode}>
                <View style={[styles.menuIcon, { backgroundColor: featureTint }]}>
                  <MaterialCommunityIcons name="lock" size={20} color={palette.primary} />
                </View>
                <View style={styles.menuContent}>
                  <RNText style={[styles.settingLabel, { color: palette.text }]}>
                    Login Passcode
                  </RNText>
                  <RNText style={[styles.settingDescription, { color: palette.textSecondary }]}>
                    {hasPasscode ? '6-digit passcode is set' : 'Set up your login passcode'}
                  </RNText>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={palette.textSecondary} />
              </Pressable>

              <View style={[styles.divider, { backgroundColor: separatorColor }]} />

              {/* Withdrawal PIN */}
              <Pressable style={styles.menuItem} onPress={handleManagePIN}>
                <View style={[styles.menuIcon, { backgroundColor: featureTint }]}>
                  <MaterialCommunityIcons name="shield-lock" size={20} color={palette.primary} />
                </View>
                <View style={styles.menuContent}>
                  <RNText style={[styles.settingLabel, { color: palette.text }]}>
                    Withdrawal PIN
                  </RNText>
                  <RNText style={[styles.settingDescription, { color: palette.textSecondary }]}>
                    {hasPIN ? '4-digit PIN is set' : 'Set up your withdrawal PIN'}
                  </RNText>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={palette.textSecondary} />
              </Pressable>
            </View>
          </View>

          {/* Biometric Authentication */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Biometric Authentication
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
                <View style={[styles.menuIcon, { backgroundColor: featureTint }]}>
                  <MaterialCommunityIcons
                    name={Platform.OS === 'ios' ? 'face-recognition' : 'fingerprint'}
                    size={20}
                    color={palette.primary}
                  />
                </View>
                <View style={styles.settingInfo}>
                  <RNText style={[styles.settingLabel, { color: palette.text }]}>
                    {biometricLabel}
                  </RNText>
                  <RNText style={[styles.settingDescription, { color: palette.textSecondary }]}>
                    {biometricAvailable
                      ? `Use ${biometricLabel} for authentication`
                      : 'Biometric authentication not available'}
                  </RNText>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleToggleBiometric}
                  disabled={!biometricAvailable}
                />
              </View>
            </View>
          </View>

          {/* Additional Security */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Additional Security
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
                <View style={[styles.menuIcon, { backgroundColor: featureTint }]}>
                  <MaterialCommunityIcons name="shield-check" size={20} color={palette.text} />
                </View>
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  menuContent: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
