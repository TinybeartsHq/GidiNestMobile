import React, { useState, useCallback, useRef } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
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
import { loginUser, clearError } from '../../redux/auth';
import { theme } from '../../theme/theme';
import type { RootState, AppDispatch } from '../../redux/types';

const { width, height } = Dimensions.get('window');

export default function SignInScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const passwordInputRef = useRef<any>(null);

  const [loginType, setLoginType] = useState<'email' | 'phone'>('phone');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      // @ts-ignore - navigation type will be configured
      navigation.replace('Dashboard');
    }
  }, [isAuthenticated, navigation]);

  React.useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

  const handleSignIn = useCallback(async () => {
    Keyboard.dismiss();

    if (!loginIdentifier || !password) {
      Alert.alert('Error', 'Email/Phone number and password are required.');
      return;
    }

    const credentials = {
      login_type: 'password' as const,
      password,
      login_with: loginType,
      email: loginType === 'email' ? loginIdentifier.trim() : undefined,
      phone: loginType === 'phone' ? loginIdentifier.trim() : undefined,
    };

    const result = await dispatch(loginUser(credentials));

    if (loginUser.fulfilled.match(result)) {
      // @ts-ignore
      navigation.replace('Dashboard');
    }
  }, [dispatch, navigation, loginIdentifier, password, loginType]);

  const handleLoginTypeToggle = (value: string) => {
    if (value === 'email' || value === 'phone') {
      setLoginType(value);
      setLoginIdentifier('');
      Keyboard.dismiss();
    }
  };

  const handleDismissSnackbar = () => {
    setSnackbarVisible(false);
    dispatch(clearError());
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
      <View style={styles.container}>
        <Image
          source={require('../../../assets/background/2147919267.jpg')}
          style={styles.backgroundImage}
          contentFit="cover"
          priority="high"
        />
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.55)', 'rgba(107, 20, 109, 0.18)']}
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
                <Surface style={styles.formCard} elevation={6}>
                  <View style={styles.header}>
                    <Text variant="headlineMedium" style={styles.title}>
                      Sign in
                    </Text>
                    <Text variant="bodySmall" style={styles.subtitle}>
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
                      style={styles.segmentedButtons}
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
                      style={styles.input}
                      mode="outlined"
                      outlineColor={theme.colors.border + '80'}
                      activeOutlineColor={theme.colors.primary}
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
                      style={styles.input}
                      mode="outlined"
                      outlineColor={theme.colors.border + '80'}
                      activeOutlineColor={theme.colors.primary}
                      contentStyle={styles.inputContent}
                      textContentType="password"
                    />

                    <Text
                      variant="bodySmall"
                      style={styles.forgotPassword}
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
                      buttonColor={theme.colors.primary}
                      textColor="#FFFFFF"
                      icon="lock-outline"
                      accessibilityLabel="Sign in"
                      accessibilityHint="Press to sign in to your account"
                    >
                      {loading ? 'Signing in...' : 'Sign in securely'}
                    </Button>

                    <View style={styles.dividerRow}>
                      <Divider style={styles.divider} bold />
                      <Text style={styles.dividerLabel}>or continue with</Text>
                      <Divider style={styles.divider} bold />
                    </View>

                    <View style={styles.socialButtonsRow}>
                      <Button
                        mode="outlined"
                        icon="google"
                        style={styles.socialButton}
                        labelStyle={styles.socialLabel}
                        onPress={() => Alert.alert('Coming soon', 'Google sign-in coming soon.')}
                      >
                        Google
                      </Button>
                      <Button
                        mode="outlined"
                        icon="apple"
                        style={styles.socialButton}
                        labelStyle={styles.socialLabel}
                        onPress={() => Alert.alert('Coming soon', 'Apple sign-in coming soon.')}
                      >
                        Apple
                      </Button>
                    </View>

                    <View style={styles.registerContainer}>
                      <Text variant="bodySmall" style={styles.registerText}>
                        Don&apos;t have an account?{' '}
                        <Text
                          style={styles.registerLink}
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
                      <Text variant="bodySmall" style={styles.termsText}>
                        By signing in, you agree to our{' '}
                        <Text
                          style={styles.link}
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
                          style={styles.link}
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
          style={styles.snackbar}
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
