import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text as RNText,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';

const NIN_LENGTH = 11;

export default function NINVerificationScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [nin, setNin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [confirmed, setConfirmed] = useState(false);

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';
  const inputBackground = isDark ? 'rgba(15, 23, 42, 0.72)' : '#FFFFFF';

  const bottomContentPadding = useMemo(
    () => insets.bottom + (Platform.OS === 'ios' ? 120 : 108),
    [insets.bottom]
  );

  const canFetch = nin.length === NIN_LENGTH && !userDetails;
  const canVerify = userDetails && confirmed;

  const handleNinChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    if (numeric.length <= NIN_LENGTH) {
      setNin(numeric);
      // Reset details if user changes NIN
      if (userDetails) {
        setUserDetails(null);
        setConfirmed(false);
      }
    }
  };

  const handleFetchDetails = async () => {
    setIsLoading(true);

    // Simulate API call to fetch NIN details
    setTimeout(() => {
      // Mock user details - in real app, this would come from NIN verification API
      setUserDetails({
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'William',
        dateOfBirth: '15-Jan-1990',
        gender: 'Male',
        stateOfOrigin: 'Lagos',
        lga: 'Ikeja',
        address: '123 Main Street, Ikeja, Lagos',
      });
      setIsLoading(false);
    }, 2000);
  };

  const handleVerify = () => {
    // TODO: Submit verification to backend
    Alert.alert(
      'Verification Submitted',
      'Your NIN verification has been submitted successfully. You will be notified once verified.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back to dashboard or profile
            navigation.goBack();
          },
        },
      ]
    );
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
            <RNText style={[styles.headerTitle, { color: palette.text }]}>
              NIN Verification
            </RNText>
            <View style={[styles.headerAccent, { backgroundColor: palette.primary }]} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomContentPadding }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Card */}
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(37,99,235,0.05)',
                borderColor: isDark ? 'rgba(147,197,253,0.2)' : 'rgba(37,99,235,0.15)',
              },
            ]}
          >
            <View
              style={[
                styles.infoIcon,
                { backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(37,99,235,0.1)' },
              ]}
            >
              <MaterialCommunityIcons
                name="card-account-details"
                size={20}
                color={isDark ? '#93C5FD' : '#2563EB'}
              />
            </View>
            <RNText style={[styles.infoText, { color: palette.text }]}>
              Enter your National Identity Number to verify your identity
            </RNText>
          </View>

          {/* NIN Input */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Enter NIN
            </RNText>
            <View
              style={[
                styles.inputCard,
                {
                  backgroundColor: inputBackground,
                  borderColor: separatorColor,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="card-account-details"
                size={20}
                color={palette.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: palette.text }]}
                value={nin}
                onChangeText={handleNinChange}
                placeholder="Enter 11-digit NIN"
                placeholderTextColor={palette.textSecondary}
                keyboardType="number-pad"
                maxLength={NIN_LENGTH}
              />
              {nin.length === NIN_LENGTH && (
                <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
              )}
            </View>
            <RNText style={[styles.helperText, { color: palette.textSecondary }]}>
              Your NIN will not be stored or shared with third parties
            </RNText>

            {/* Fetch Button */}
            {canFetch && (
              <Pressable
                style={({ pressed }) => [
                  styles.fetchButton,
                  {
                    backgroundColor: palette.primary,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
                onPress={handleFetchDetails}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <RNText style={styles.fetchButtonText}>Fetch Details</RNText>
                )}
              </Pressable>
            )}
          </View>

          {/* User Details */}
          {userDetails && (
            <>
              <View style={styles.section}>
                <RNText style={[styles.sectionTitle, { color: palette.text }]}>
                  Confirm Your Details
                </RNText>
                <View
                  style={[
                    styles.detailsCard,
                    {
                      backgroundColor: cardBackground,
                      borderColor: separatorColor,
                    },
                  ]}
                >
                  <DetailRow
                    label="Full Name"
                    value={`${userDetails.firstName} ${userDetails.middleName} ${userDetails.lastName}`}
                    palette={palette}
                  />
                  <View style={[styles.divider, { backgroundColor: separatorColor }]} />
                  <DetailRow
                    label="Date of Birth"
                    value={userDetails.dateOfBirth}
                    palette={palette}
                  />
                  <View style={[styles.divider, { backgroundColor: separatorColor }]} />
                  <DetailRow
                    label="Gender"
                    value={userDetails.gender}
                    palette={palette}
                  />
                  <View style={[styles.divider, { backgroundColor: separatorColor }]} />
                  <DetailRow
                    label="State of Origin"
                    value={userDetails.stateOfOrigin}
                    palette={palette}
                  />
                  <View style={[styles.divider, { backgroundColor: separatorColor }]} />
                  <DetailRow
                    label="LGA"
                    value={userDetails.lga}
                    palette={palette}
                  />
                  <View style={[styles.divider, { backgroundColor: separatorColor }]} />
                  <DetailRow
                    label="Address"
                    value={userDetails.address}
                    palette={palette}
                  />
                </View>
              </View>

              {/* Confirmation */}
              <Pressable
                style={styles.confirmationRow}
                onPress={() => setConfirmed(!confirmed)}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: confirmed ? palette.primary : separatorColor,
                      backgroundColor: confirmed ? palette.primary : 'transparent',
                    },
                  ]}
                >
                  {confirmed && (
                    <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                  )}
                </View>
                <RNText style={[styles.confirmationText, { color: palette.text }]}>
                  I confirm that all the details above are accurate
                </RNText>
              </Pressable>

              {/* Verify Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.verifyButton,
                  {
                    backgroundColor: canVerify ? palette.primary : featureTint,
                    opacity: pressed && canVerify ? 0.9 : 1,
                    transform: [{ scale: pressed && canVerify ? 0.98 : 1 }],
                  },
                ]}
                onPress={handleVerify}
                disabled={!canVerify}
              >
                <RNText
                  style={[
                    styles.verifyButtonText,
                    { color: canVerify ? '#FFFFFF' : palette.textSecondary },
                  ]}
                >
                  Verify NIN
                </RNText>
              </Pressable>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function DetailRow({ label, value, palette }: { label: string; value: string; palette: any }) {
  return (
    <View style={styles.detailRow}>
      <RNText style={[styles.detailLabel, { color: palette.textSecondary }]}>
        {label}
      </RNText>
      <RNText style={[styles.detailValue, { color: palette.text }]}>
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
  infoCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 16,
    padding: 0,
  },
  helperText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
    marginTop: -theme.spacing.xs,
  },
  fetchButton: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  fetchButtonText: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  detailsCard: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  detailRow: {
    gap: theme.spacing.xs / 2,
  },
  detailLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  detailValue: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmationText: {
    flex: 1,
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
  },
  verifyButton: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  verifyButtonText: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
  },
});
