import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text as RNText,
  Vibration,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import PasscodeInput from '../../components/PasscodeInput';
import NumPad from '../../components/NumPad';
import { usePin } from '../../hooks/useAuthV2';

const PIN_LENGTH = 4;

export default function PINSetupScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const navigation = useNavigation();
  const route = useRoute();
  const { setup, change, loading } = usePin();

  // @ts-ignore
  const params = route.params || {};
  const isChangeMode = params.mode === 'change';
  const oldPin = params.oldPin || '';

  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [shakeAnimation] = useState(new Animated.Value(0));

  const currentPin = step === 'create' ? pin : confirmPin;
  const title = step === 'create'
    ? (isChangeMode ? 'Change Withdrawal PIN' : 'Create Withdrawal PIN')
    : 'Confirm PIN';
  const subtitle =
    step === 'create'
      ? (isChangeMode ? 'Enter your new 4-digit PIN' : 'Enter a 4-digit PIN for withdrawals')
      : 'Re-enter your PIN to confirm';

  useEffect(() => {
    if (step === 'create' && pin.length === PIN_LENGTH) {
      // Move to confirmation step
      setTimeout(() => {
        setStep('confirm');
      }, 200);
    } else if (step === 'confirm' && confirmPin.length === PIN_LENGTH) {
      // Verify PINs match
      if (pin === confirmPin) {
        // Success! Save PIN and navigate
        setTimeout(() => {
          handleSuccess();
        }, 200);
      } else {
        // PINs don't match
        setError('PINs do not match');
        Vibration.vibrate([0, 50, 50, 50]);
        shake();
        setTimeout(() => {
          setConfirmPin('');
          setError('');
        }, 1000);
      }
    }
  }, [pin, confirmPin, step]);

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

  const handleSuccess = async () => {
    try {
      if (isChangeMode) {
        // Change existing PIN
        await change({
          old_pin: oldPin,
          new_pin: pin,
          new_pin_confirmation: confirmPin,
        }).unwrap();

        // Show transaction limit notice for security
        Alert.alert(
          'PIN Changed Successfully',
          'For your security, your transaction limit has been temporarily reduced to ₦10,000 for the next 24 hours.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (params.onSuccess) {
                  params.onSuccess();
                } else {
                  navigation.goBack();
                }
              },
            },
          ]
        );
      } else {
        // Initial setup - save PIN
        await setup({
          pin,
          pin_confirmation: confirmPin,
        }).unwrap();

        // Navigate to main app
        if (params.onSuccess) {
          params.onSuccess();
        } else {
          // @ts-ignore
          navigation.navigate('MainApp');
        }
      }
    } catch (err: any) {
      setError(err || 'Failed to save PIN');
      Vibration.vibrate([0, 50, 50, 50]);
      shake();
      setTimeout(() => {
        setPin('');
        setConfirmPin('');
        setStep('create');
        setError('');
      }, 2000);
    }
  };

  const handleNumberPress = (num: string) => {
    if (step === 'create') {
      if (pin.length < PIN_LENGTH) {
        setPin(pin + num);
      }
    } else {
      if (confirmPin.length < PIN_LENGTH) {
        setConfirmPin(confirmPin + num);
      }
    }
  };

  const handleBackspace = () => {
    if (step === 'create') {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)' },
              ]}
            >
              <MaterialCommunityIcons
                name="shield-lock"
                size={40}
                color={palette.primary}
              />
            </View>
            <RNText style={[styles.title, { color: palette.text }]}>
              {title}
            </RNText>
            <RNText style={[styles.subtitle, { color: palette.textSecondary }]}>
              {subtitle}
            </RNText>
          </View>

          {/* PIN Input */}
          <Animated.View
            style={[
              styles.inputContainer,
              { transform: [{ translateX: shakeAnimation }] },
            ]}
          >
            <PasscodeInput length={PIN_LENGTH} value={currentPin} />
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
              showBiometric={false}
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
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xl * 2,
  },
  header: {
    alignItems: 'center',
    gap: theme.spacing.sm,
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
    fontSize: 28,
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
  },
  errorText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
    textAlign: 'center',
  },
  numPadContainer: {
    alignItems: 'center',
  },
});
