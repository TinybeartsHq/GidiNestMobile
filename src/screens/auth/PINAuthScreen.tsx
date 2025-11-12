import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text as RNText,
  Vibration,
  Animated,
  Pressable,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import PasscodeInput from '../../components/PasscodeInput';
import NumPad from '../../components/NumPad';
import {
  authenticateWithBiometric,
  getBiometricType,
  isBiometricAvailable,
  getBiometricLabel,
} from '../../utils/biometric';

const PIN_LENGTH = 4;
const MAX_ATTEMPTS = 3;

interface WithdrawalDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  amount: number;
  isVerified: boolean;
}

interface PINAuthScreenProps {
  onSuccess?: (pin?: string) => void;
  onCancel?: () => void;
  amount?: number;
  category?: string;
  withdrawalDetails?: WithdrawalDetails;
}

export default function PINAuthScreen(props?: PINAuthScreenProps) {
  const navigation = useNavigation();
  const route = useRoute();

  // Get params from either props or route params
  const params = (route.params as PINAuthScreenProps) || {};
  const onSuccess = props?.onSuccess || params.onSuccess;
  const onCancel = props?.onCancel || params.onCancel;
  const amount = props?.amount || params.amount;
  const category = props?.category || params.category || 'withdrawal';
  const withdrawalDetails = params.withdrawalDetails;
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [shakeAnimation] = useState(new Animated.Value(0));
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricIcon, setBiometricIcon] = useState<'face-recognition' | 'fingerprint'>('fingerprint');
  const [biometricLabel, setBiometricLabel] = useState('Biometric');

  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';

  useEffect(() => {
    checkBiometric();
    // Auto-trigger biometric on mount
    setTimeout(() => {
      handleBiometric();
    }, 500);
  }, []);

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      verifyPin();
    }
  }, [pin]);

  const checkBiometric = async () => {
    const available = await isBiometricAvailable();
    setBiometricAvailable(available);

    if (available) {
      const type = await getBiometricType();
      const label = await getBiometricLabel();
      setBiometricLabel(label);
      setBiometricIcon(
        type === 'FaceID' ? 'face-recognition' : 'fingerprint'
      );
    }
  };

  const verifyPin = () => {
    // For withdrawal transactions, the PIN is verified by the backend
    // Just pass it through to the onSuccess callback
    setTimeout(() => {
      if (onSuccess) {
        onSuccess(pin);
      } else {
        navigation.goBack();
      }
    }, 200);
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleBiometric = async () => {
    if (!biometricAvailable) return;

    const result = await authenticateWithBiometric(
      `Authenticate to confirm ${category}`
    );

    if (result.success) {
      // Success!
      if (onSuccess) {
        onSuccess();
      } else {
        navigation.goBack();
      }
    }
    // If failed, user can continue with PIN
  };

  const handleNumberPress = (num: string) => {
    if (pin.length < PIN_LENGTH && attempts < MAX_ATTEMPTS) {
      setPin(pin + num);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={[styles.closeButton, { backgroundColor: featureTint }]}
            onPress={() => {
              if (onCancel) {
                onCancel();
              } else {
                navigation.goBack();
              }
            }}
          >
            <MaterialCommunityIcons name="close" size={20} color={palette.text} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Content */}
          <View style={styles.mainContent}>
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)' },
              ]}
            >
              <MaterialCommunityIcons
                name="lock"
                size={32}
                color={isDark ? '#FCA5A5' : '#EF4444'}
              />
            </View>
            <RNText style={[styles.title, { color: palette.text }]}>
              Confirm {category.charAt(0).toUpperCase() + category.slice(1)}
            </RNText>
            {amount && (
              <RNText style={[styles.amount, { color: palette.text }]}>
                {formatCurrency(amount)}
              </RNText>
            )}

            {/* Withdrawal Details */}
            {withdrawalDetails && (
              <View style={[styles.detailsCard, { backgroundColor: featureTint }]}>
                {!withdrawalDetails.isVerified && (
                  <View style={[styles.warningBadge, { backgroundColor: '#F9731620' }]}>
                    <MaterialCommunityIcons name="alert-circle" size={14} color="#F97316" />
                    <RNText style={[styles.warningText, { color: '#F97316' }]}>
                      Unverified Account
                    </RNText>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <RNText style={[styles.detailLabel, { color: palette.textSecondary }]}>
                    Send to
                  </RNText>
                  <RNText style={[styles.detailValue, { color: palette.text }]}>
                    {withdrawalDetails.accountName}
                  </RNText>
                </View>
                <View style={styles.detailRow}>
                  <RNText style={[styles.detailLabel, { color: palette.textSecondary }]}>
                    Account
                  </RNText>
                  <RNText style={[styles.detailValue, { color: palette.text }]}>
                    {withdrawalDetails.accountNumber}
                  </RNText>
                </View>
                <View style={styles.detailRow}>
                  <RNText style={[styles.detailLabel, { color: palette.textSecondary }]}>
                    Bank
                  </RNText>
                  <RNText style={[styles.detailValue, { color: palette.text }]}>
                    {withdrawalDetails.bankName}
                  </RNText>
                </View>
              </View>
            )}

            <RNText style={[styles.subtitle, { color: palette.textSecondary }]}>
              {biometricAvailable
                ? `Use ${biometricLabel} or enter your PIN`
                : 'Enter your PIN to continue'}
            </RNText>
          </View>

          {/* PIN Input */}
          <Animated.View
            style={[
              styles.inputContainer,
              { transform: [{ translateX: shakeAnimation }] },
            ]}
          >
            <PasscodeInput length={PIN_LENGTH} value={pin} />
            {error ? (
              <RNText style={[styles.errorText, { color: '#EF4444' }]}>
                {error}
              </RNText>
            ) : null}
          </Animated.View>
        </ScrollView>

        {/* NumPad - Fixed at bottom */}
        <View style={styles.numPadContainer}>
          <NumPad
            onNumberPress={handleNumberPress}
            onBackspace={handleBackspace}
            onBiometric={handleBiometric}
            showBiometric={biometricAvailable}
            biometricIcon={biometricIcon}
          />
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
    paddingHorizontal: theme.spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: theme.spacing.sm,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  mainContent: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 20,
    textAlign: 'center',
  },
  amount: {
    fontFamily: 'NeuzeitGro-ExtraBold',
    fontSize: 28,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  errorText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 13,
    textAlign: 'center',
  },
  numPadContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  detailsCard: {
    width: '100%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  warningText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 11,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  detailValue: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 13,
    maxWidth: '60%',
    textAlign: 'right',
  },
});
