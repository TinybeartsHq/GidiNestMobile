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

export default function BVNVerificationScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const navigation = useNavigation();
  const { verifyBVN, verificationLoading, verificationError, getProfile, getVerificationStatus } = useAccount();

  const [bvn, setBvn] = useState('');

  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';

  const handleSubmit = async () => {
    if (bvn.length !== 11) {
      Alert.alert('Invalid BVN', 'BVN must be exactly 11 digits');
      return;
    }

    try {
      await verifyBVN({ bvn }).unwrap();

      // Refresh profile and verification status
      await getProfile();
      await getVerificationStatus();

      Alert.alert(
        'Verification Submitted',
        'Your BVN verification has been submitted successfully. You will be notified once verification is complete.',
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
      Alert.alert('Verification Failed', verificationError || 'Failed to verify BVN. Please try again.');
    }
  };

  const isFormValid = () => {
    return bvn.length === 11 && /^\d+$/.test(bvn);
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
            Verify BVN
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
              <MaterialCommunityIcons name="bank" size={48} color="#3B82F6" />
            </View>
          </View>

          {/* Title and Description */}
          <View style={styles.titleContainer}>
            <RNText style={[styles.title, { color: palette.text }]}>
              Verify Your BVN
            </RNText>
            <RNText style={[styles.description, { color: palette.textSecondary }]}>
              Your Bank Verification Number (BVN) helps us verify your identity and unlock more features.
            </RNText>
          </View>

          {/* BVN Input */}
          <View style={styles.formContainer}>
            <TextInput
              label="BVN Number *"
              value={bvn}
              onChangeText={(text) => setBvn(text.replace(/[^0-9]/g, ''))}
              mode="outlined"
              keyboardType="numeric"
              maxLength={11}
              placeholder="Enter 11-digit BVN"
              style={styles.input}
              outlineColor={isDark ? palette.border : '#E2E8F0'}
              activeOutlineColor={palette.primary}
              textColor={palette.text}
              right={
                bvn.length === 11 ? (
                  <TextInput.Icon
                    icon="check-circle"
                    color="#22C55E"
                  />
                ) : undefined
              }
            />

            <RNText style={[styles.helperText, { color: palette.textSecondary }]}>
              {bvn.length}/11 digits
            </RNText>
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
                Benefits of BVN Verification
              </RNText>
            </View>

            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#22C55E" />
                <RNText style={[styles.benefitText, { color: palette.text }]}>
                  Unlock higher transaction limits
                </RNText>
              </View>

              <View style={styles.benefitItem}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#22C55E" />
                <RNText style={[styles.benefitText, { color: palette.text }]}>
                  Upgrade your account tier
                </RNText>
              </View>

              <View style={styles.benefitItem}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#22C55E" />
                <RNText style={[styles.benefitText, { color: palette.text }]}>
                  Access premium features
                </RNText>
              </View>

              <View style={styles.benefitItem}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#22C55E" />
                <RNText style={[styles.benefitText, { color: palette.text }]}>
                  Faster withdrawals and transfers
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
                Your BVN is securely encrypted and stored. We only use it to verify your identity.
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
            {verificationLoading ? 'Verifying...' : 'Verify BVN'}
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
  },
  helperText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
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
