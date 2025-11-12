import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text as RNText,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import { useAccount } from '../../hooks/useAccount';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function NINVerificationScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const navigation = useNavigation();
  const { verifyNIN, verificationLoading, verificationError, getProfile, getVerificationStatus } = useAccount();

  const [nin, setNin] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSubmit = async () => {
    if (nin.length !== 11) {
      Alert.alert('Invalid NIN', 'NIN must be exactly 11 digits');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Missing Information', 'Please enter your first name and last name');
      return;
    }

    try {
      // Format date to ISO format with time component as required by API
      const isoDate = dob.toISOString().split('.')[0]; // Remove milliseconds

      await verifyNIN({
        nin,
        firstname: firstName.trim(),
        lastname: lastName.trim(),
        dob: isoDate,
      }).unwrap();

      // Refresh profile and verification status
      await getProfile();
      await getVerificationStatus();

      Alert.alert(
        'Verification Submitted',
        'Your NIN verification has been submitted successfully. You will be notified once verification is complete.',
        [
          {
            text: 'OK',
            onPress: () => {
              // @ts-ignore
              navigation.navigate('VerificationStatus');
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Verification Failed', verificationError || 'Failed to verify NIN. Please try again.');
    }
  };

  const isFormValid = () => {
    return nin.length === 11 && /^\d+$/.test(nin) && firstName.trim().length > 0 && lastName.trim().length > 0;
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
            Verify NIN
          </RNText>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconWrapper,
                {
                  backgroundColor: isDark
                    ? 'rgba(59,130,246,0.15)'
                    : 'rgba(59,130,246,0.1)',
                },
              ]}
            >
              <MaterialCommunityIcons name="card-account-details" size={48} color="#3B82F6" />
            </View>
          </View>

          {/* Title and Description */}
          <View style={styles.titleContainer}>
            <RNText style={[styles.title, { color: palette.text }]}>
              Verify Your NIN
            </RNText>
            <RNText style={[styles.description, { color: palette.textSecondary }]}>
              Your National Identification Number (NIN) helps us verify your identity and unlock more features.
            </RNText>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <TextInput
              label="NIN Number *"
              value={nin}
              onChangeText={(text) => setNin(text.replace(/[^0-9]/g, ''))}
              mode="outlined"
              keyboardType="numeric"
              maxLength={11}
              placeholder="Enter 11-digit NIN"
              style={styles.input}
              outlineColor={isDark ? palette.border : '#E2E8F0'}
              activeOutlineColor={palette.primary}
              textColor={palette.text}
              right={
                nin.length === 11 ? (
                  <TextInput.Icon
                    icon="check-circle"
                    color="#22C55E"
                  />
                ) : undefined
              }
            />

            <RNText style={[styles.helperText, { color: palette.textSecondary }]}>
              {nin.length}/11 digits
            </RNText>

            <TextInput
              label="First Name *"
              value={firstName}
              onChangeText={setFirstName}
              mode="outlined"
              placeholder="As it appears on your NIN"
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
              placeholder="As it appears on your NIN"
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
                  Date of Birth *
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
                value={dob}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Benefits Card */}
          <View
            style={[
              styles.benefitsCard,
              {
                backgroundColor: isDark
                  ? 'rgba(34,197,94,0.1)'
                  : 'rgba(34,197,94,0.05)',
                borderColor: isDark
                  ? 'rgba(34,197,94,0.2)'
                  : 'rgba(34,197,94,0.15)',
              },
            ]}
          >
            <View style={styles.benefitsHeader}>
              <MaterialCommunityIcons name="star-circle" size={24} color="#22C55E" />
              <RNText style={[styles.benefitsTitle, { color: palette.text }]}>
                Benefits of NIN Verification
              </RNText>
            </View>

            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#22C55E" />
                <RNText style={[styles.benefitText, { color: palette.text }]}>
                  Unlock maximum transaction limits
                </RNText>
              </View>

              <View style={styles.benefitItem}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#22C55E" />
                <RNText style={[styles.benefitText, { color: palette.text }]}>
                  Upgrade to Tier 3
                </RNText>
              </View>

              <View style={styles.benefitItem}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#22C55E" />
                <RNText style={[styles.benefitText, { color: palette.text }]}>
                  Access all premium features
                </RNText>
              </View>

              <View style={styles.benefitItem}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#22C55E" />
                <RNText style={[styles.benefitText, { color: palette.text }]}>
                  Complete identity verification
                </RNText>
              </View>
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
            <MaterialCommunityIcons name="shield-check" size={20} color="#3B82F6" />
            <View style={{ flex: 1 }}>
              <RNText style={[styles.infoTitle, { color: palette.text }]}>
                Your Information is Secure
              </RNText>
              <RNText style={[styles.infoText, { color: palette.textSecondary }]}>
                Your NIN and personal information are securely encrypted. We only use them to verify your identity.
              </RNText>
            </View>
          </View>
        </ScrollView>

        {/* Submit Button - Fixed at bottom */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={verificationLoading}
            disabled={!isFormValid() || verificationLoading}
            style={styles.submitButton}
            contentStyle={styles.buttonContent}
            buttonColor={palette.primary}
            textColor="#FFFFFF"
          >
            {verificationLoading ? 'Verifying...' : 'Verify NIN'}
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
    paddingVertical: theme.spacing.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: theme.spacing.lg,
  },
  input: {
    backgroundColor: 'transparent',
    marginBottom: theme.spacing.md,
  },
  helperText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
    marginTop: -8,
    marginBottom: theme.spacing.md,
    marginLeft: 12,
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
  benefitsCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  benefitsTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
  },
  benefitsList: {
    gap: theme.spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  benefitText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
  },
  infoTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 13,
    marginBottom: 4,
  },
  infoText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  buttonContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  submitButton: {
    borderRadius: theme.borderRadius.lg,
  },
  buttonContent: {
    paddingVertical: theme.spacing.sm,
  },
});
