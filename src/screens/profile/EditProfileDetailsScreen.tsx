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
import { useSelector } from 'react-redux';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import type { RootState } from '../../redux/types';

export default function EditProfileDetailsScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.auth.user);

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');

  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';

  const bottomContentPadding = useMemo(
    () => insets.bottom + (Platform.OS === 'ios' ? 120 : 108),
    [insets.bottom]
  );

  const handleSave = () => {
    Alert.alert('Success', 'Your profile has been updated successfully!', [
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
            <RNText style={[styles.headerTitle, { color: palette.text }]}>Edit Profile</RNText>
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
                {(firstName || 'G').charAt(0).toUpperCase()}
              </RNText>
            </View>
            <Pressable style={[styles.changePhotoButton, { borderColor: separatorColor }]}>
              <MaterialCommunityIcons name="camera" size={20} color={palette.primary} />
              <RNText style={[styles.changePhotoText, { color: palette.primary }]}>
                Change Photo
              </RNText>
            </Pressable>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Personal Information
            </RNText>

            <View style={styles.inputGroup}>
              <RNText style={[styles.inputLabel, { color: palette.text }]}>First Name</RNText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: featureTint,
                    borderColor: separatorColor,
                    color: palette.text,
                  },
                ]}
                placeholder="Enter first name"
                placeholderTextColor={palette.textSecondary}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            <View style={styles.inputGroup}>
              <RNText style={[styles.inputLabel, { color: palette.text }]}>Last Name</RNText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: featureTint,
                    borderColor: separatorColor,
                    color: palette.text,
                  },
                ]}
                placeholder="Enter last name"
                placeholderTextColor={palette.textSecondary}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            <View style={styles.inputGroup}>
              <RNText style={[styles.inputLabel, { color: palette.text }]}>Date of Birth</RNText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: featureTint,
                    borderColor: separatorColor,
                    color: palette.text,
                  },
                ]}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={palette.textSecondary}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
              />
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Contact Information
            </RNText>

            <View style={styles.inputGroup}>
              <RNText style={[styles.inputLabel, { color: palette.text }]}>Email</RNText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: featureTint,
                    borderColor: separatorColor,
                    color: palette.text,
                  },
                ]}
                placeholder="Enter email"
                placeholderTextColor={palette.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <RNText style={[styles.inputLabel, { color: palette.text }]}>Phone Number</RNText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: featureTint,
                    borderColor: separatorColor,
                    color: palette.text,
                  },
                ]}
                placeholder="Enter phone number"
                placeholderTextColor={palette.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <RNText style={[styles.inputLabel, { color: palette.text }]}>
                Address (Optional)
              </RNText>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: featureTint,
                    borderColor: separatorColor,
                    color: palette.text,
                  },
                ]}
                placeholder="Enter your address"
                placeholderTextColor={palette.textSecondary}
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Save Button */}
          <Pressable
            style={[styles.saveButton, { backgroundColor: palette.primary }]}
            onPress={handleSave}
          >
            <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" />
            <RNText style={styles.saveButtonText}>Save Changes</RNText>
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
  avatarSection: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 40,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
  },
  changePhotoText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  inputGroup: {
    gap: theme.spacing.xs,
  },
  inputLabel: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
  input: {
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 15,
  },
  textArea: {
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
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
  saveButtonText: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
