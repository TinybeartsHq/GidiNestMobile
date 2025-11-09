import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  Snackbar,
  Surface,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';

const { width, height } = Dimensions.get('window');

export default function SignInScreen() {
  const navigation = useNavigation();
  const passwordInputRef = useRef<any>(null);

  const [loginType, setLoginType] = useState<'email' | 'phone'>('phone');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const { mode, palette } = useThemeMode();
  const isDark = mode === 'dark';

  const borderNeutral = isDark ? 'rgba(148, 163, 184, 0.42)' : 'rgba(148, 163, 184, 0.45)';
  const cardBackground = isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255,255,255,0.92)';
  const segmentedBackground = isDark ? 'rgba(15, 23, 42, 0.6)' : '#F4F4F6';
  const textSecondaryColor = isDark ? palette.textSecondary : theme.colors.textSecondary;
  const overlayColors: [string, string] = isDark
    ? ['rgba(2, 6, 23, 0.82)', 'rgba(76, 29, 149, 0.38)']
    : ['rgba(15, 23, 42, 0.55)', 'rgba(107, 20, 109, 0.18)'];

  const dynamicStyles = useMemo(
    () => ({
      container: {
        backgroundColor: palette.background,
      },
      formCard: {
        backgroundColor: cardBackground,
        borderColor: isDark ? 'rgba(148, 163, 184, 0.32)' : 'rgba(107, 20, 109, 0.12)',
      },
      title: {
        color: palette.primary,
      },
      subtitle: {
        color: textSecondaryColor,
      },
      segmentedButtons: {
        backgroundColor: segmentedBackground,
      },
      input: {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.65)' : '#FFFFFF',
      },
      forgotPassword: {
        color: palette.primary,
      },
      divider: {
        backgroundColor: isDark ? 'rgba(148,163,184,0.32)' : theme.colors.border + '66',
      },
      dividerLabel: {
        color: textSecondaryColor,
      },
      socialButton: {
        borderColor: borderNeutral,
      },
      registerText: {
        color: textSecondaryColor,
      },
      registerLink: {
        color: palette.primary,
      },
      termsText: {
        color: textSecondaryColor,
      },
      link: {
        color: palette.primary,
      },
      snackbar: {
        backgroundColor: isDark ? palette.surface : undefined,
      },
    }),
    [borderNeutral, cardBackground, isDark, palette.primary, palette.surface, palette.background, segmentedBackground, textSecondaryColor]
  );

  const inputTheme = useMemo(
    () => ({
      colors: {
        text: isDark ? '#F8FAFC' : '#0F172A',
        placeholder: isDark ? '#94A3B8' : '#94A3B8',
      },
    }),
    [isDark]
  );

  const handleSignIn = useCallback(async () => {
    Keyboard.dismiss();

    if (!loginIdentifier || !password) {
      Alert.alert('Error', 'Email/Phone number and password are required.');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      setLoading(false);
      setSnackbarVisible(true);
      setError('');
      // @ts-ignore - navigation typing configured elsewhere
      navigation.replace('Dashboard');
    }, 1200);
  }, [navigation, loginIdentifier, password, loginType]);

  const handleLoginTypeToggle = (value: string) => {
    if (value === 'email' || value === 'phone') {
      setLoginType(value);
      setLoginIdentifier('');
      Keyboard.dismiss();
    }
  };

  const handleDismissSnackbar = () => {
    setSnackbarVisible(false);
    setError('');
  };

  const handleIdentifierSubmit = () => {
    passwordInputRef.current?.focus();
  };

  const handlePasswordSubmit = () => {
    handleSignIn();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={[styles.container, dynamicStyles.container]}>
        <Image
          source={require('../../../assets/background/2147919267.jpg')}
          style={styles.backgroundImage}
          contentFit="cover"
          priority="high"
        />
        <LinearGradient
          colors={overlayColors}
          style={styles.overlay}
        />

        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.contentContainer}>
                <Surface style={[styles.formCard, dynamicStyles.formCard]} elevation={4}>
                  <View style={styles.header}>
                    <Text variant="headlineMedium" style={[styles.title, dynamicStyles.title]}>
                      Sign in
                    </Text>
                    <Text variant="bodySmall" style={[styles.subtitle, dynamicStyles.subtitle]}>
                      Access your dashboard in seconds
                    </Text>
                  </View>

                  <View style={styles.form}>
                    <SegmentedButtons
                      value={loginType}
                      onValueChange={handleLoginTypeToggle}
                      buttons={[
                        {
                          value: 'phone',
                          label: 'Phone',
                        },
                        {
                          value: 'email',
                          label: 'Email',
                        },
                      ]}
                      density="small"
                      style={[styles.segmentedButtons, dynamicStyles.segmentedButtons]}
                    />

                    <TextInput
                      label={loginType === 'email' ? 'Email address' : 'Phone Number'}
                      value={loginIdentifier}
                      onChangeText={setLoginIdentifier}
                      placeholder={
                        loginType === 'email' ? 'name@example.com' : '0809 876 5432'
                      }
                      keyboardType={loginType === 'email' ? 'email-address' : 'phone-pad'}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete={loginType === 'email' ? 'email' : 'tel'}
                      returnKeyType="next"
                      onSubmitEditing={handleIdentifierSubmit}
                      blurOnSubmit={false}
                      style={[styles.input, dynamicStyles.input]}
                      mode="outlined"
                      outlineColor={borderNeutral}
                      activeOutlineColor={palette.primary}
                      theme={inputTheme}
                      contentStyle={styles.inputContent}
                      textContentType={loginType === 'email' ? 'emailAddress' : 'telephoneNumber'}
                    />

                    <TextInput
                      ref={passwordInputRef}
                      label="Password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="password"
                      returnKeyType="done"
                      onSubmitEditing={handlePasswordSubmit}
                      right={
                        <TextInput.Icon
                          icon={showPassword ? 'eye-off' : 'eye'}
                          onPress={() => setShowPassword(!showPassword)}
                          forceTextInputFocus={false}
                        />
                      }
                      style={[styles.input, dynamicStyles.input]}
                      mode="outlined"
                      outlineColor={borderNeutral}
                      activeOutlineColor={palette.primary}
                      theme={inputTheme}
                      contentStyle={styles.inputContent}
                      textContentType="password"
                    />

                    <Text
                      variant="bodySmall"
                      style={[styles.forgotPassword, dynamicStyles.forgotPassword]}
                      onPress={() => {
                        Keyboard.dismiss();
                        // @ts-ignore
                        navigation.navigate('ForgotPassword');
                      }}
                    >
                      Forgot password?
                    </Text>

                    <Button
                      mode="contained"
                      onPress={handleSignIn}
                      loading={loading}
                      disabled={loading || !loginIdentifier || !password}
                      style={styles.button}
                      contentStyle={styles.buttonContent}
                      buttonColor={palette.primary}
                      textColor="#FFFFFF"
                      icon="lock-outline"
                      accessibilityLabel="Sign in"
                      accessibilityHint="Press to sign in to your account"
                    >
                      {loading ? 'Signing in...' : 'Sign in securely'}
                    </Button>

                    <View style={styles.dividerRow}>
                      <Divider style={[styles.divider, dynamicStyles.divider]} bold />
                      <Text style={[styles.dividerLabel, dynamicStyles.dividerLabel]}>
                        or continue with
                      </Text>
                      <Divider style={[styles.divider, dynamicStyles.divider]} bold />
                    </View>

                    <View style={styles.socialButtonsRow}>
                      <Button
                        mode="outlined"
                        icon="google"
                        style={[styles.socialButton, dynamicStyles.socialButton]}
                        labelStyle={styles.socialLabel}
                        onPress={() => Alert.alert('Coming soon', 'Google sign-in coming soon.')}
                      >
                        Google
                      </Button>
                      <Button
                        mode="outlined"
                        icon="apple"
                        style={[styles.socialButton, dynamicStyles.socialButton]}
                        labelStyle={styles.socialLabel}
                        onPress={() => Alert.alert('Coming soon', 'Apple sign-in coming soon.')}
                      >
                        Apple
                      </Button>
                    </View>

                    <View style={styles.registerContainer}>
                      <Text variant="bodySmall" style={[styles.registerText, dynamicStyles.registerText]}>
                        Don&apos;t have an account?{' '}
                        <Text
                          style={[styles.registerLink, dynamicStyles.registerLink]}
                          onPress={() => {
                            Keyboard.dismiss();
                            // @ts-ignore
                            navigation.navigate('Register');
                          }}
                        >
                          Create one now
                        </Text>
                      </Text>
                    </View>

                    <View style={styles.termsContainer}>
                      <Text variant="bodySmall" style={[styles.termsText, dynamicStyles.termsText]}>
                        By signing in, you agree to our{' '}
                        <Text
                          style={[styles.link, dynamicStyles.link]}
                          onPress={() => {
                            Keyboard.dismiss();
                            // @ts-ignore
                            navigation.navigate('PrivacyPolicy');
                          }}
                        >
                          Privacy Policy
                        </Text>{' '}
                        and{' '}
                        <Text
                          style={[styles.link, dynamicStyles.link]}
                          onPress={() => {
                            Keyboard.dismiss();
                            // @ts-ignore
                            navigation.navigate('TermsAndConditions');
                          }}
                        >
                          Terms & Conditions
                        </Text>
                      </Text>
                    </View>
                  </View>
                </Surface>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={handleDismissSnackbar}
          duration={4000}
          action={{
            label: 'Dismiss',
            onPress: handleDismissSnackbar,
          }}
          style={[styles.snackbar, dynamicStyles.snackbar]}
        >
          {error || 'Welcome back! Redirecting…'}
        </Snackbar>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
  },
  overlay: {
    position: 'absolute',
    width: width,
    height: height,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: height,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  contentContainer: {
    width: '100%',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  formCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: theme.borderRadius.xl + 6,
    padding: theme.spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: theme.colors.primary + '14',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  segmentedButtons: {
    marginBottom: theme.spacing.md,
    backgroundColor: '#F4F4F6',
    borderRadius: theme.borderRadius.lg,
  },
  input: {
    marginBottom: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.md,
  },
  inputContent: {
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.md,
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  button: {
    marginTop: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  buttonContent: {
    paddingVertical: theme.spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginVertical: theme.spacing.md,
  },
  divider: {
    flex: 1,
    backgroundColor: theme.colors.border + '66',
  },
  dividerLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  socialButton: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    borderColor: theme.colors.border + '80',
  },
  socialLabel: {
    fontSize: 14,
  },
  registerContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  registerText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  registerLink: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  termsContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  termsText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  link: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  snackbar: {
    marginBottom: theme.spacing.xl,
  },
});
