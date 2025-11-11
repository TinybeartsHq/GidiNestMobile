import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text as RNText,
  Vibration,
  Animated,
  Pressable,
  Platform,
  Alert,
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
import { useAuthV2 } from '../../hooks/useAuthV2';
import * as SecureStore from 'expo-secure-store';

const PASSCODE_LENGTH = 6;
const MAX_ATTEMPTS = 5;

interface PasscodeAuthScreenProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: 'verify' | 'login';
}

export default function PasscodeAuthScreen(props?: PasscodeAuthScreenProps) {
  const navigation = useNavigation();
  const route = useRoute();
  const { signIn, loading, clearAuthError, user } = useAuthV2();

  // Get params from either props or route params
  const params = (route.params as PasscodeAuthScreenProps) || {};
  const onSuccess = props?.onSuccess || params.onSuccess;
  const onCancel = props?.onCancel || params.onCancel;
  const mode = props?.mode || params.mode || 'login';
  const { palette, mode: themeMode } = useThemeMode();
  const isDark = themeMode === 'dark';

  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';

  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [shakeAnimation] = useState(new Animated.Value(0));
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricIcon, setBiometricIcon] = useState<'face-recognition' | 'fingerprint'>('fingerprint');
  const [biometricLabel, setBiometricLabel] = useState('Biometric');

  useEffect(() => {
    checkBiometric();
  }, []);

  // Auto-trigger biometric when both are available and enabled
  useEffect(() => {
    if (biometricAvailable && biometricEnabled && mode === 'login') {
      const timer = setTimeout(() => {
        handleBiometric();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [biometricAvailable, biometricEnabled]);

  useEffect(() => {
    if (passcode.length === PASSCODE_LENGTH) {
      verifyPasscode();
    }
  }, [passcode]);

  const checkBiometric = async () => {
    try {
      const available = await isBiometricAvailable();
      console.log('Biometric hardware available:', available);
      
      // Check if biometric is enabled in app settings
      const enabled = await SecureStore.getItemAsync('biometric_enabled');
      const isEnabled = enabled === 'true';
      console.log('Biometric enabled in settings:', isEnabled);
      
      setBiometricAvailable(available && isEnabled);
      setBiometricEnabled(isEnabled);

      if (available && isEnabled) {
        const type = await getBiometricType();
        const label = await getBiometricLabel();
        setBiometricLabel(label);
        setBiometricIcon(
          type === 'FaceID' ? 'face-recognition' : 'fingerprint'
        );
        console.log('Biometric type:', type, 'Label:', label);
      }
    } catch (error) {
      console.error('Error checking biometric:', error);
      setBiometricAvailable(false);
      setBiometricEnabled(false);
    }
  };

  const verifyPasscode = async () => {
    try {
      // Get user email from SecureStore
      const userEmail = await SecureStore.getItemAsync('user_email');

      if (!userEmail) {
        Alert.alert('Error', 'User email not found. Please sign in with email.');
        // @ts-ignore
        navigation.replace('SignIn');
        return;
      }

      clearAuthError();

      // Sign in with V2 API using passcode
      await signIn({
        email: userEmail,
        passcode: passcode,
      }).unwrap();

      // Store passcode for future biometric authentication
      // This ensures biometric will work on next login
      await SecureStore.setItemAsync('user_passcode', passcode);
      console.log('Passcode stored for biometric authentication');

      // Success!
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          // @ts-ignore
          navigation.replace('MainApp');
        }
      }, 200);
    } catch (err: any) {
      // Check if it's a 401 error (authentication failed)
      if (err?.response?.status === 401 || err?.message?.includes('401')) {
        // Passcode authentication not set up or invalid credentials
        Alert.alert(
          'Authentication Failed',
          'Your passcode may not be set up yet or has expired. Please sign in with your email and password.',
          [
            {
              text: 'Sign in with Email',
              onPress: () => {
                // Clear stored passcode since it's not valid
                SecureStore.deleteItemAsync('user_passcode');
                // @ts-ignore
                navigation.replace('SignIn');
              },
            },
          ]
        );
        return;
      }

      // Wrong passcode or other API error
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        setError('Too many attempts. Please sign in with email.');
        Vibration.vibrate([0, 100, 100, 100]);
        setTimeout(() => {
          // @ts-ignore
          navigation.replace('SignIn');
        }, 2000);
      } else {
        setError(`Incorrect passcode (${newAttempts}/${MAX_ATTEMPTS})`);
        Vibration.vibrate([0, 50, 50, 50]);
        shake();

        setTimeout(() => {
          setPasscode('');
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
    console.log('FaceID button clicked', { biometricAvailable, biometricEnabled });
    
    if (!biometricAvailable || !biometricEnabled) {
      console.log('Biometric not available or not enabled');
      Alert.alert(
        'Biometric Not Enabled',
        'Please enable biometric authentication in Security Settings first.'
      );
      return;
    }

    const message = mode === 'verify'
      ? 'Verify your identity to continue'
      : 'Authenticate to access GidiNest';

    console.log('Starting biometric authentication...');
    const result = await authenticateWithBiometric(message);
    console.log('Biometric authentication result:', result);

    if (result.success) {
      try {
        // Get stored email and passcode
        const userEmail = await SecureStore.getItemAsync('user_email');
        const storedPasscode = await SecureStore.getItemAsync('user_passcode');

        if (!userEmail) {
          Alert.alert('Error', 'User email not found. Please sign in with email.');
          // @ts-ignore
          navigation.replace('SignIn');
          return;
        }

        // If passcode is not stored, user needs to enter it manually
        // This happens after logout when user signs in with email/password again
        // The passcode input is already visible, so user can enter it
        // Once entered successfully, it will be stored for future biometric use
        if (!storedPasscode) {
          console.log('Passcode not stored - user needs to enter it manually');
          // Show a brief message without blocking the UI
          setError('Please enter your passcode to complete authentication');
          setTimeout(() => setError(''), 3000);
          return;
        }

        clearAuthError();

        // Sign in with V2 API using stored passcode
        await signIn({
          email: userEmail,
          passcode: storedPasscode,
        }).unwrap();

        // Success!
        if (onSuccess) {
          onSuccess();
        } else {
          // @ts-ignore
          navigation.replace('MainApp');
        }
      } catch (error: any) {
        // Check if it's a 401 error (authentication failed)
        if (error?.response?.status === 401 || error?.message?.includes('401')) {
          Alert.alert(
            'Authentication Failed',
            'Your passcode may not be set up yet or has expired. Please sign in with your email and password.',
            [
              {
                text: 'Sign in with Email',
                onPress: () => {
                  // Clear stored passcode since it's not valid
                  SecureStore.deleteItemAsync('user_passcode');
                  // @ts-ignore
                  navigation.replace('SignIn');
                },
              },
            ]
          );
        } else {
          Alert.alert('Error', error || 'Authentication failed. Please sign in with email.');
          // @ts-ignore
          navigation.replace('SignIn');
        }
      }
    }
    // If failed, user can continue with passcode
  };

  const handleNumberPress = (num: string) => {
    if (passcode.length < PASSCODE_LENGTH && attempts < MAX_ATTEMPTS) {
      setPasscode(passcode + num);
    }
  };

  const handleBackspace = () => {
    setPasscode(passcode.slice(0, -1));
  };

  const headerTitle = mode === 'verify' ? 'Verify Identity' : 'Welcome Back';
  const headerSubtitle = biometricAvailable
    ? `Use ${biometricLabel} or enter your passcode`
    : 'Enter your passcode to continue';

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* Close button for verify mode */}
          {mode === 'verify' && (
            <View style={styles.closeButtonContainer}>
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
          )}

          {/* Header */}
          <View style={styles.header}>
            <RNText style={[styles.title, { color: palette.text }]}>
              {headerTitle}
            </RNText>
            <RNText style={[styles.subtitle, { color: palette.textSecondary }]}>
              {headerSubtitle}
            </RNText>
          </View>

          {/* Passcode Input */}
          <Animated.View
            style={[
              styles.inputContainer,
              { transform: [{ translateX: shakeAnimation }] },
            ]}
          >
            <PasscodeInput length={PASSCODE_LENGTH} value={passcode} />
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

          {/* Sign in with email link */}
          {mode === 'login' && (
            <Pressable
              style={styles.emailLinkContainer}
              onPress={() => {
                // @ts-ignore
                navigation.replace('SignIn');
              }}
            >
              <RNText style={[styles.emailLinkText, { color: palette.primary }]}>
                Sign in with email instead
              </RNText>
            </Pressable>
          )}
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
  closeButtonContainer: {
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
  header: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xl,
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
  emailLinkContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    padding: theme.spacing.sm,
  },
  emailLinkText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
    textAlign: 'center',
  },
});
