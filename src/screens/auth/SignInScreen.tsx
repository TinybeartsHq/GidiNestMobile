import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TextInput, Button, Snackbar, HelperText, Checkbox, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginUser, clearError } from '../../redux/auth';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import type { RootState, AppDispatch } from '../../redux/types';

const { height } = Dimensions.get('window');

const PHONE_REGEX = /^\+?[0-9]{7,15}$/;

export default function SignInScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { mode, palette } = useThemeMode();
  const isDark = mode === 'dark';

  const passwordInputRef = useRef<any>(null);
  const textInputTheme = useMemo(
    () => ({
      roundness: theme.borderRadius.lg,
    }),
    []
  );

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [touched, setTouched] = useState<{ phone: boolean; password: boolean }>({
    phone: false,
    password: false,
  });

  const borderNeutral = isDark ? 'rgba(148, 163, 184, 0.45)' : 'rgba(148, 163, 184, 0.32)';
  const inputBackground = isDark ? 'rgba(15, 23, 42, 0.72)' : '#FFFFFF';
  const heroBackdropGradient = isDark
    ? (['rgba(12, 10, 30, 0.94)', 'rgba(15, 23, 42, 0.9)', 'rgba(15, 23, 42, 0.86)'] as const)
    : (['rgba(246, 245, 255, 0.9)', 'rgba(252, 252, 255, 0.9)', 'rgba(255, 255, 255, 1)'] as const);

  const dynamicStyles = useMemo(
    () => ({
      container: {
        backgroundColor: palette.background,
      },
      formCard: {
        backgroundColor: 'transparent',
        borderColor: borderNeutral,
        shadowColor: isDark ? '#000000' : 'rgba(15, 23, 42, 0.08)',
      },
      title: {
        color: palette.text,
      },
      subtitle: {
        color: palette.textSecondary,
      },
      segmentedButtons: {
        backgroundColor: 'transparent',
      },
      input: {
        backgroundColor: inputBackground,
      },
      forgotPassword: {
        color: palette.primary,
      },
      divider: {
        backgroundColor: isDark ? 'rgba(148,163,184,0.32)' : theme.colors.border + '66',
      },
      dividerLabel: {
        color: palette.textSecondary,
      },
      socialButton: {
        borderColor: borderNeutral,
      },
      registerText: {
        color: palette.textSecondary,
      },
      registerLink: {
        color: palette.primary,
      },
      termsText: {
        color: palette.textSecondary,
      },
      link: {
        color: palette.primary,
      },
      snackbar: {
        backgroundColor: isDark ? palette.surface : undefined,
      },
    }),
    [palette, isDark, borderNeutral, inputBackground]
  );

  React.useEffect(() => {
    if (isAuthenticated) {
      // @ts-ignore - navigation type will be configured later
      navigation.replace('Dashboard');
    }
  }, [isAuthenticated, navigation]);

  React.useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

  const phoneError = useMemo(() => {
    if (!touched.phone) return '';
    if (!phoneNumber.trim()) return 'Phone number is required.';
    if (!PHONE_REGEX.test(phoneNumber.trim())) return 'Enter a valid phone number.';
    return '';
  }, [phoneNumber, touched.phone]);

  const passwordError = useMemo(() => {
    if (!touched.password) return '';
    if (!password.trim()) return 'Password is required.';
    if (password.trim().length < 6) return 'Password must be at least 6 characters.';
    return '';
  }, [password, touched.password]);

  const isFormValid = !phoneError && !passwordError && !!phoneNumber.trim() && !!password.trim();

  const handleSignIn = useCallback(async () => {
    Keyboard.dismiss();

    if (!isFormValid) {
      setTouched({ phone: true, password: true });
      return;
    }

    const credentials = {
      login_type: 'password' as const,
      password: password.trim(),
      login_with: 'phone' as const,
      phone: phoneNumber.trim(),
      remember: rememberMe,
    };

    const result = await dispatch(loginUser(credentials));

    if (loginUser.fulfilled.match(result)) {
      // @ts-ignore - navigation type will be configured later
      navigation.replace('Dashboard');
    }
  }, [dispatch, navigation, isFormValid, phoneNumber, password, rememberMe]);

  const handleDismissSnackbar = () => {
    setSnackbarVisible(false);
    dispatch(clearError());
  };

  const handlePhoneSubmit = () => {
    setTouched((prev) => ({ ...prev, phone: true }));
    passwordInputRef.current?.focus();
  };

  const handlePasswordSubmit = () => {
    setTouched((prev) => ({ ...prev, password: true }));
    handleSignIn();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleBack = useCallback(() => {
    // @ts-ignore
    if ('canGoBack' in navigation && navigation.canGoBack()) {
      // @ts-ignore
      navigation.goBack();
    } else {
      // @ts-ignore
      navigation.navigate('AuthLanding');
    }
  }, [navigation]);

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={[styles.container, dynamicStyles.container]}>
        <LinearGradient colors={heroBackdropGradient} style={styles.backdropGradient} />
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
              <View style={styles.contentShell}>
                <View style={styles.headingBlock}>
                  <IconButton icon="arrow-left" onPress={handleBack} accessibilityLabel="Go back" />
                  <Text style={[styles.heroTitle, dynamicStyles.title]}>Welcome back, guardian</Text>
                  <Text style={[styles.heroSubtitle, dynamicStyles.subtitle]}>
                    Sign in with your phone number to keep your nest growing steadily.
                  </Text>
                </View>

                <View style={[styles.formBlock, dynamicStyles.formCard]}>
                  <Text style={[styles.fieldTitle, { color: palette.text }]}>Phone number</Text>
                  <TextInput
                    theme={textInputTheme}
                    value={phoneNumber}
                    onChangeText={(value) => setPhoneNumber(value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                    placeholder="+234 812 345 6789"
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="tel"
                    returnKeyType="next"
                    onSubmitEditing={handlePhoneSubmit}
                    blurOnSubmit={false}
                    style={[styles.input, dynamicStyles.input]}
                    mode="outlined"
                    outlineColor={borderNeutral}
                    activeOutlineColor={palette.primary}
                    contentStyle={styles.inputContent}
                    textContentType="telephoneNumber"
                    error={!!phoneError}
                  />
                  <HelperText type="error" visible={!!phoneError} style={[styles.helperText, dynamicStyles.helperError]}>
                    {phoneError}
                  </HelperText>

                  <Text style={[styles.fieldTitle, { color: palette.text }]}>Password</Text>
                  <TextInput
                    ref={passwordInputRef}
                    theme={textInputTheme}
                    value={password}
                    onChangeText={(value) => setPassword(value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    returnKeyType="done"
                    onSubmitEditing={handlePasswordSubmit}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword((prev) => !prev)}
                        forceTextInputFocus={false}
                      />
                    }
                    style={[styles.input, styles.passwordInput, dynamicStyles.input]}
                    mode="outlined"
                    outlineColor={borderNeutral}
                    activeOutlineColor={palette.primary}
                    contentStyle={styles.inputContent}
                    textContentType="password"
                    error={!!passwordError}
                  />
                  <HelperText type="error" visible={!!passwordError} style={[styles.helperText, dynamicStyles.helperError]}>
                    {passwordError}
                  </HelperText>

                  <View style={styles.optionsRow}>
                    <View style={styles.rememberRow}>
                      <Checkbox status={rememberMe ? 'checked' : 'unchecked'} onPress={() => setRememberMe((prev) => !prev)} />
                      <Text style={[styles.rememberLabel, { color: palette.textSecondary }]}>Remember me</Text>
                    </View>
                    <Button
                      mode="text"
                      compact
                      textColor={palette.primary}
                      labelStyle={styles.linkText}
                      onPress={() => {
                        Keyboard.dismiss();
                        // @ts-ignore - navigation type will be configured later
                        navigation.navigate('ForgotPassword');
                      }}
                    >
                      Forgot password?
                    </Button>
                  </View>

                  <Button
                    mode="contained"
                    onPress={handleSignIn}
                    loading={loading}
                    disabled={loading || !isFormValid}
                    style={[styles.button, dynamicStyles.button]}
                    contentStyle={styles.buttonContent}
                    buttonColor={palette.primary}
                    textColor="#FFFFFF"
                    icon="lock-outline"
                    accessibilityLabel="Sign in"
                    accessibilityHint="Press to sign in to your account"
                  >
                    {loading ? 'Signing in...' : 'Sign in securely'}
                  </Button>
                </View>

                <View style={styles.registerContainer}>
                  <Text style={[styles.registerText, dynamicStyles.registerText]}>
                    New to GidiNest?{' '}
                    <Text
                      style={[styles.registerLink, dynamicStyles.registerLink]}
                      onPress={() => {
                        Keyboard.dismiss();
                        // @ts-ignore - navigation type will be configured later
                        navigation.navigate('SignUp');
                      }}
                    >
                      Create an account
                    </Text>
                  </Text>
                </View>

                <Text style={[styles.termsText, dynamicStyles.termsText]}>
                  By continuing you agree to our{' '}
                  <Text style={[styles.linkText, dynamicStyles.link]}>Privacy Policy</Text> and{' '}
                  <Text style={[styles.linkText, dynamicStyles.link]}>Terms & Conditions</Text>.
                </Text>
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
          {error || 'An error occurred'}
        </Snackbar>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdropGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Math.max(height * 0.35, 260),
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl * 2,
  },
  contentShell: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  headingBlock: {
    gap: theme.spacing.xs,
    alignItems: 'flex-start',
  },
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
    letterSpacing: 0.8,
  },
  brandAction: {
    fontFamily: 'NeuzeitGro-Medium',
    fontSize: 14,
  },
  heroTitle: {
    fontFamily: 'NeuzeitGro-ExtraBold',
    fontSize: 28,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  formBlock: {
    width: '100%',
    gap: theme.spacing.xs * 0.75,
  },
  input: {
    marginBottom: theme.spacing.xs * 0.15,
    borderRadius: theme.borderRadius.lg,
  },
  passwordInput: {
    marginTop: theme.spacing.xs * 0.15,
  },
  helperText: {
    marginBottom: theme.spacing.xs * 0.15,
  },
  fieldTitle: {
    fontFamily: 'NeuzeitGro-Medium',
    fontSize: 13,
    letterSpacing: 0.4,
    marginTop: theme.spacing.xs * 0.6,
  },
  inputContent: {
    fontSize: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  rememberLabel: {
    fontFamily: 'NeuzeitGro-Medium',
    fontSize: 13,
  },
  linkText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 13,
  },
  button: {
    borderRadius: theme.borderRadius.lg,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5,
    marginTop: theme.spacing.xs,
  },
  buttonContent: {
    paddingVertical: theme.spacing.sm * 0.75,
  },
  registerContainer: {
    alignItems: 'center',
    marginTop: 0,
  },
  registerText: {
    fontSize: 14,
    textAlign: 'center',
  },
  registerLink: {
    fontFamily: 'NeuzeitGro-SemiBold',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 0,
  },
  snackbar: {
    marginBottom: theme.spacing.xl,
  },
});

