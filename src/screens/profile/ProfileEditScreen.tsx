import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text as RNText,
  Alert,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import { useAccount } from '../../hooks/useAccount';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ProfileEditScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const navigation = useNavigation();
  const { profile, profileLoading, updateProfile, getProfile, error } = useAccount();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';

  useEffect(() => {
    getProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPhone(profile.phone || '');
      if (profile.dob) {
        setDob(new Date(profile.dob));
      }
      setAddress(profile.address || '');
      setCity(profile.city || '');
      setState(profile.state || '');
      setCountry(profile.country || '');
    }
  }, [profile]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        dob: dob ? dob.toISOString().split('T')[0] : undefined,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
      }).unwrap();

      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      Alert.alert('Error', error || 'Failed to update profile');
    }
  };

  const isFormValid = () => {
    return firstName.trim().length > 0 && lastName.trim().length > 0;
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
            Edit Profile
          </RNText>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Personal Information Section */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Personal Information
            </RNText>

            <TextInput
              label="First Name *"
              value={firstName}
              onChangeText={setFirstName}
              mode="outlined"
              style={styles.input}
              outlineColor={isDark ? palette.border : '#E2E8F0'}
              activeOutlineColor={palette.primary}
              textColor={palette.text}
            />

            <TextInput
              label="Last Name *"
              value={lastName}
              onChangeText={setLastName}
              mode="outlined"
              style={styles.input}
              outlineColor={isDark ? palette.border : '#E2E8F0'}
              activeOutlineColor={palette.primary}
              textColor={palette.text}
            />

            <TextInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              outlineColor={isDark ? palette.border : '#E2E8F0'}
              activeOutlineColor={palette.primary}
              textColor={palette.text}
            />

            {/* Date of Birth Picker */}
            <Pressable
              style={[styles.datePickerButton, { backgroundColor: featureTint }]}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.datePickerContent}>
                <RNText style={[styles.datePickerLabel, { color: palette.textSecondary }]}>
                  Date of Birth
                </RNText>
                <RNText style={[styles.datePickerValue, { color: palette.text }]}>
                  {formatDate(dob)}
                </RNText>
              </View>
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color={palette.textSecondary}
              />
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={dob || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Address Section */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Address
            </RNText>

            <TextInput
              label="Street Address"
              value={address}
              onChangeText={setAddress}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
              outlineColor={isDark ? palette.border : '#E2E8F0'}
              activeOutlineColor={palette.primary}
              textColor={palette.text}
            />

            <TextInput
              label="City"
              value={city}
              onChangeText={setCity}
              mode="outlined"
              style={styles.input}
              outlineColor={isDark ? palette.border : '#E2E8F0'}
              activeOutlineColor={palette.primary}
              textColor={palette.text}
            />

            <TextInput
              label="State"
              value={state}
              onChangeText={setState}
              mode="outlined"
              style={styles.input}
              outlineColor={isDark ? palette.border : '#E2E8F0'}
              activeOutlineColor={palette.primary}
              textColor={palette.text}
            />

            <TextInput
              label="Country"
              value={country}
              onChangeText={setCountry}
              mode="outlined"
              style={styles.input}
              outlineColor={isDark ? palette.border : '#E2E8F0'}
              activeOutlineColor={palette.primary}
              textColor={palette.text}
            />
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
              Fields marked with * are required. Your information is securely stored and only used to improve your experience.
            </RNText>
          </View>
        </ScrollView>

        {/* Save Button - Fixed at bottom */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={profileLoading}
            disabled={!isFormValid() || profileLoading}
            style={styles.saveButton}
            contentStyle={styles.buttonContent}
            buttonColor={palette.primary}
            textColor="#FFFFFF"
          >
            Save Changes
          </Button>
        </View>
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
    paddingBottom: theme.spacing.xl,
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  input: {
    marginBottom: theme.spacing.md,
    backgroundColor: 'transparent',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  datePickerContent: {
    flex: 1,
  },
  datePickerLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
    marginBottom: 4,
  },
  datePickerValue: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
  infoCard: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    marginTop: theme.spacing.lg,
  },
  infoText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  saveButton: {
    borderRadius: theme.borderRadius.lg,
  },
  buttonContent: {
    paddingVertical: theme.spacing.sm,
  },
});
