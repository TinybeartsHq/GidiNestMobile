import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text as RNText,
  Vibration,
  Animated,
  Pressable,
  Platform,
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

interface PINAuthScreenProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  amount?: number;
  category?: string;
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
    // TODO: Verify against stored PIN from SecureStore
    const storedPin = '1234'; // This should come from SecureStore

    if (pin === storedPin) {
      // Success!
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          navigation.goBack();
        }
      }, 200);
    } else {
      // Wrong PIN
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        setError('Too many attempts. Operation cancelled.');
        Vibration.vibrate([0, 100, 100, 100]);
        setTimeout(() => {
          if (onCancel) {
            onCancel();
          } else {
            navigation.goBack();
          }
        }, 2000);
      } else {
        setError(`Incorrect PIN (${newAttempts}/${MAX_ATTEMPTS})`);
        Vibration.vibrate([0, 50, 50, 50]);
        shake();

        setTimeout(() => {
          setPin('');
          if (newAttempts < MAX_ATTEMPTS) {
            setError('');
          }
        }, 1000);
      }
    }
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
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
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
                size={40}
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

          {/* NumPad */}
          <View style={styles.numPadContainer}>
            <NumPad
              onNumberPress={handleNumberPress}
              onBackspace={handleBackspace}
              onBiometric={handleBiometric}
              showBiometric={biometricAvailable}
              biometricIcon={biometricIcon}
            />
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.lg : theme.spacing.md,
    paddingBottom: theme.spacing.xl * 2,
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: theme.spacing.xs,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xl,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 24,
    textAlign: 'center',
  },
  amount: {
    fontFamily: 'NeuzeitGro-ExtraBold',
    fontSize: 32,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 15,
    textAlign: 'center',
  },
  inputContainer: {
    alignItems: 'center',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.xl * 2,
  },
  errorText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
    textAlign: 'center',
  },
  numPadContainer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
});
