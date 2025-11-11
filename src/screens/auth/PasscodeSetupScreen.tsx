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
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import PasscodeInput from '../../components/PasscodeInput';
import NumPad from '../../components/NumPad';

const PASSCODE_LENGTH = 6;

export default function PasscodeSetupScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const navigation = useNavigation();
  const route = useRoute();

  // @ts-ignore
  const params = route.params || {};
  const isChangeMode = params.mode === 'change';

  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [error, setError] = useState('');
  const [shakeAnimation] = useState(new Animated.Value(0));

  const currentPasscode = step === 'create' ? passcode : confirmPasscode;
  const title = step === 'create'
    ? (isChangeMode ? 'Change Passcode' : 'Create Passcode')
    : 'Confirm Passcode';
  const subtitle =
    step === 'create'
      ? (isChangeMode ? 'Enter your new 6-digit passcode' : 'Enter a 6-digit passcode')
      : 'Re-enter your passcode to confirm';

  useEffect(() => {
    if (step === 'create' && passcode.length === PASSCODE_LENGTH) {
      // Move to confirmation step
      setTimeout(() => {
        setStep('confirm');
      }, 200);
    } else if (step === 'confirm' && confirmPasscode.length === PASSCODE_LENGTH) {
      // Verify passcodes match
      if (passcode === confirmPasscode) {
        // Success! Save passcode and navigate
        setTimeout(() => {
          handleSuccess();
        }, 200);
      } else {
        // Passcodes don't match
        setError('Passcodes do not match');
        Vibration.vibrate([0, 50, 50, 50]);
        shake();
        setTimeout(() => {
          setConfirmPasscode('');
          setError('');
        }, 1000);
      }
    }
  }, [passcode, confirmPasscode, step]);

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

  const handleSuccess = () => {
    // TODO: Save passcode securely (use SecureStore)
    console.log('Passcode saved:', passcode);

    if (isChangeMode) {
      // Show transaction limit notice for security
      Alert.alert(
        'Passcode Changed Successfully',
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
      // Initial setup - navigate to PIN setup
      if (params.onSuccess) {
        params.onSuccess();
      } else {
        // @ts-ignore
        navigation.navigate('PINSetup');
      }
    }
  };

  const handleNumberPress = (num: string) => {
    if (step === 'create') {
      if (passcode.length < PASSCODE_LENGTH) {
        setPasscode(passcode + num);
      }
    } else {
      if (confirmPasscode.length < PASSCODE_LENGTH) {
        setConfirmPasscode(confirmPasscode + num);
      }
    }
  };

  const handleBackspace = () => {
    if (step === 'create') {
      setPasscode(passcode.slice(0, -1));
    } else {
      setConfirmPasscode(confirmPasscode.slice(0, -1));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <RNText style={[styles.title, { color: palette.text }]}>
              {title}
            </RNText>
            <RNText style={[styles.subtitle, { color: palette.textSecondary }]}>
              {subtitle}
            </RNText>
          </View>

          {/* Passcode Input */}
          <Animated.View
            style={[
              styles.inputContainer,
              { transform: [{ translateX: shakeAnimation }] },
            ]}
          >
            <PasscodeInput length={PASSCODE_LENGTH} value={currentPasscode} />
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
