import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text as RNText,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import type { ProfileStackParamList } from '../../navigation/ProfileNavigator';

type ChangePasswordNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ChangePassword'>;

export default function ChangePasswordScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ChangePasswordNavigationProp>();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';

  const bottomContentPadding = useMemo(
    () => insets.bottom + (Platform.OS === 'ios' ? 120 : 108),
    [insets.bottom]
  );

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    Alert.alert('Success', 'Your password has been changed successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
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
            <RNText style={[styles.headerTitle, { color: palette.text }]}>Change Password</RNText>
            <View style={[styles.headerAccent, { backgroundColor: palette.primary }]} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomContentPadding }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Card */}
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(37,99,235,0.06)',
                borderColor: isDark ? 'rgba(147,197,253,0.3)' : 'rgba(37,99,235,0.2)',
              },
            ]}
          >
            <MaterialCommunityIcons name="information" size={20} color={palette.primary} />
            <RNText style={[styles.infoText, { color: palette.textSecondary }]}>
              Choose a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.
            </RNText>
          </View>

          {/* Password Fields */}
          <View style={styles.section}>
            <View style={styles.inputGroup}>
              <RNText style={[styles.inputLabel, { color: palette.text }]}>Current Password</RNText>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: featureTint,
                      borderColor: separatorColor,
                      color: palette.text,
                    },
                  ]}
                  placeholder="Enter current password"
                  placeholderTextColor={palette.textSecondary}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrent}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowCurrent(!showCurrent)}
                >
                  <MaterialCommunityIcons
                    name={showCurrent ? 'eye-off' : 'eye'}
                    size={20}
                    color={palette.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <RNText style={[styles.inputLabel, { color: palette.text }]}>New Password</RNText>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: featureTint,
                      borderColor: separatorColor,
                      color: palette.text,
                    },
                  ]}
                  placeholder="Enter new password"
                  placeholderTextColor={palette.textSecondary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNew}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowNew(!showNew)}
                >
                  <MaterialCommunityIcons
                    name={showNew ? 'eye-off' : 'eye'}
                    size={20}
                    color={palette.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <RNText style={[styles.inputLabel, { color: palette.text }]}>Confirm New Password</RNText>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: featureTint,
                      borderColor: separatorColor,
                      color: palette.text,
                    },
                  ]}
                  placeholder="Re-enter new password"
                  placeholderTextColor={palette.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowConfirm(!showConfirm)}
                >
                  <MaterialCommunityIcons
                    name={showConfirm ? 'eye-off' : 'eye'}
                    size={20}
                    color={palette.textSecondary}
                  />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Update Button */}
          <Pressable
            style={[styles.updateButton, { backgroundColor: palette.primary }]}
            onPress={handleChangePassword}
          >
            <MaterialCommunityIcons name="lock-reset" size={20} color="#FFFFFF" />
            <RNText style={styles.updateButtonText}>Update Password</RNText>
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
  infoCard: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    gap: theme.spacing.lg,
  },
  inputGroup: {
    gap: theme.spacing.xs,
  },
  inputLabel: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
  passwordContainer: {
    position: 'relative',
  },
  input: {
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    paddingRight: 48,
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 15,
  },
  eyeButton: {
    position: 'absolute',
    right: theme.spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  updateButton: {
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
  updateButtonText: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
