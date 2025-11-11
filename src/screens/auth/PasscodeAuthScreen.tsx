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
  const [biometricIcon, setBiometricIcon] = useState<'face-recognition' | 'fingerprint'>('fingerprint');
  const [biometricLabel, setBiometricLabel] = useState('Biometric');

  useEffect(() => {
    checkBiometric();
    // Auto-trigger biometric on mount
    setTimeout(() => {
      handleBiometric();
    }, 500);
  }, []);

  useEffect(() => {
    if (passcode.length === PASSCODE_LENGTH) {
      verifyPasscode();
    }
  }, [passcode]);

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

  const verifyPasscode = () => {
    // TODO: Verify against stored passcode from SecureStore
    const storedPasscode = '123456'; // This should come from SecureStore

    if (passcode === storedPasscode) {
      // Success!
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          // @ts-ignore
          navigation.navigate('MainApp');
        }
      }, 200);
    } else {
      // Wrong passcode
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
    if (!biometricAvailable) return;

    const message = mode === 'verify'
      ? 'Verify your identity to continue'
      : 'Authenticate to access GidiNest';

    const result = await authenticateWithBiometric(message);

    if (result.success) {
      // Success!
      if (onSuccess) {
        onSuccess();
      } else {
        // @ts-ignore
        navigation.navigate('MainApp');
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
});
