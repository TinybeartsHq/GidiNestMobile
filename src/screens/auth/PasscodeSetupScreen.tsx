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
import { usePasscode } from '../../hooks/useAuthV2';
import * as SecureStore from 'expo-secure-store';

const PASSCODE_LENGTH = 6;

export default function PasscodeSetupScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const navigation = useNavigation();
  const route = useRoute();
  const { setup, change, verify, loading } = usePasscode();

  // @ts-ignore
  const params = route.params || {};
  const isChangeMode = params.mode === 'change';

  const [step, setStep] = useState<'verifyOld' | 'create' | 'confirm' | 'success'>(
    isChangeMode ? 'verifyOld' : 'create'
  );
  const [oldPasscode, setOldPasscode] = useState('');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [error, setError] = useState('');
  const [shakeAnimation] = useState(new Animated.Value(0));

  const currentPasscode =
    step === 'verifyOld' ? oldPasscode :
    step === 'create' ? passcode : confirmPasscode;

  const title =
    step === 'verifyOld' ? 'Verify Current Passcode' :
    step === 'create' ? (isChangeMode ? 'New Passcode' : 'Create Passcode') :
    'Confirm Passcode';

  const subtitle =
    step === 'verifyOld' ? 'Enter your current 6-digit passcode' :
    step === 'create'
      ? (isChangeMode ? 'Enter your new 6-digit passcode' : 'Enter a 6-digit passcode')
      : 'Re-enter your passcode to confirm';

  useEffect(() => {
    if (step === 'verifyOld' && oldPasscode.length === PASSCODE_LENGTH) {
      // Verify old passcode with API
      setTimeout(() => {
        verifyOldPasscode();
      }, 200);
    } else if (step === 'create' && passcode.length === PASSCODE_LENGTH) {
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
  }, [oldPasscode, passcode, confirmPasscode, step]);

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

  const verifyOldPasscode = async () => {
    try {
      // Verify the old passcode with the API
      await verify({ passcode: oldPasscode }).unwrap();

      // If successful, move to create new passcode step
      setStep('create');
    } catch (err: any) {
      // Wrong old passcode
      setError('Incorrect passcode');
      Vibration.vibrate([0, 50, 50, 50]);
      shake();
      setTimeout(() => {
        setOldPasscode('');
        setError('');
      }, 1000);
    }
  };

  const handleSuccess = async () => {
    try {
      if (isChangeMode) {
        // Change existing passcode
        await change({
          old_passcode: oldPasscode,
          new_passcode: passcode,
          new_passcode_confirmation: confirmPasscode,
        }).unwrap();

        // Update stored passcode for biometric authentication
        await SecureStore.setItemAsync('user_passcode', passcode);
        // Store flag indicating passcode is set up
        await SecureStore.setItemAsync('has_passcode_setup', 'true');

        // Show success screen
        setStep('success');

        // Auto-navigate after 2 seconds
        setTimeout(() => {
          if (params.onSuccess) {
            params.onSuccess();
          } else {
            navigation.goBack();
          }
        }, 2000);
      } else {
        // Initial setup - save passcode
        await setup({
          passcode,
          passcode_confirmation: confirmPasscode,
        }).unwrap();

        // Store passcode securely for biometric authentication
        await SecureStore.setItemAsync('user_passcode', passcode);
        // Store flag indicating passcode is set up
        await SecureStore.setItemAsync('has_passcode_setup', 'true');

        // Show success screen
        setStep('success');

        // Auto-navigate after 2 seconds
        setTimeout(() => {
          if (params.onSuccess) {
            params.onSuccess();
          } else {
            // @ts-ignore
            navigation.navigate('PINSetup');
          }
        }, 2000);
      }
    } catch (err: any) {
      setError(err || 'Failed to save passcode');
      Vibration.vibrate([0, 50, 50, 50]);
      shake();
      setTimeout(() => {
        setPasscode('');
        setConfirmPasscode('');
        setStep('create');
        setError('');
      }, 2000);
    }
  };

  const handleNumberPress = (num: string) => {
    if (step === 'verifyOld') {
      if (oldPasscode.length < PASSCODE_LENGTH) {
        setOldPasscode(oldPasscode + num);
      }
    } else if (step === 'create') {
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
    if (step === 'verifyOld') {
      setOldPasscode(oldPasscode.slice(0, -1));
    } else if (step === 'create') {
      setPasscode(passcode.slice(0, -1));
    } else {
      setConfirmPasscode(confirmPasscode.slice(0, -1));
    }
  };

  // Success screen
  if (step === 'success') {
    return (
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.successContainer}>
            <View style={[styles.successIconWrapper, { backgroundColor: '#10B981' + '20' }]}>
              <MaterialCommunityIcons name="check-circle" size={80} color="#10B981" />
            </View>
            <RNText style={[styles.successTitle, { color: palette.text }]}>
              {isChangeMode ? 'Passcode Changed!' : 'Passcode Created!'}
            </RNText>
            <RNText style={[styles.successSubtitle, { color: palette.textSecondary }]}>
              {isChangeMode
                ? 'Your login passcode has been updated successfully. For security, your transaction limit is temporarily ₦10,000 for 24 hours.'
                : 'Your login passcode has been set up successfully. You can now use it for quick login.'}
            </RNText>
          </View>
        </SafeAreaView>
      </View>
    );
  }

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
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  successIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 28,
    textAlign: 'center',
  },
  successSubtitle: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
