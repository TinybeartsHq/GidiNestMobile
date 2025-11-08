import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import {
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  Snackbar,
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

  // State for login type and identifier
  const [loginType, setLoginType] = useState<'email' | 'phone'>('phone');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      // @ts-ignore - navigation type will be set up properly
      navigation.replace('Dashboard');
    }
  }, [isAuthenticated, navigation]);

  // Show snackbar when error changes
  React.useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

  const handleSignIn = useCallback(async () => {
    // Basic validation
    if (!loginIdentifier || !password) {
      Alert.alert('Error', 'Email/Phone number and password are required.');
      return;
    }

    const credentials = {
      login_type: 'password' as const,
      password,
      login_with: loginType,
      email: loginType === 'email' ? loginIdentifier : undefined,
      phone: loginType === 'phone' ? loginIdentifier : undefined,
    };

    const result = await dispatch(loginUser(credentials));
    
    if (loginUser.fulfilled.match(result)) {
      // Navigation will happen automatically via useEffect
      // @ts-ignore
      navigation.replace('Dashboard');
    }
  }, [dispatch, navigation, loginIdentifier, password, loginType]);

  const handleLoginTypeToggle = (value: string) => {
    if (value === 'email' || value === 'phone') {
      setLoginType(value);
      setLoginIdentifier(''); // Clear identifier when toggling type
    }
  };

  const handleDismissSnackbar = () => {
    setSnackbarVisible(false);
    dispatch(clearError());
  };

  return (
    <View style={styles.container}>
      {/* Background Image - Mother/Child theme */}
      <Image
        source={require('../../../assets/background/2147919267.jpg')}
        style={styles.backgroundImage}
        contentFit="cover"
        priority="high"
      />
      
      {/* Gradient Overlay */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.contentContainer}>
            {/* Form Card - Centered */}
            <View style={styles.formCard}>
              <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.title}>
                  Sign in
                </Text>
                <Text variant="bodySmall" style={styles.subtitle}>
                  Welcome back! Sign in to continue
                </Text>
              </View>

              <View style={styles.form}>
                {/* Login Type Toggle */}
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
                  style={styles.segmentedButtons}
                />

                {/* Dynamic Login Identifier Field */}
                <TextInput
                  label={loginType === 'email' ? 'Email address' : 'Phone Number'}
                  value={loginIdentifier}
                  onChangeText={setLoginIdentifier}
                  placeholder={
                    loginType === 'email' ? 'Enter your email address' : '08098XXXXXXX'
                  }
                  keyboardType={loginType === 'email' ? 'email-address' : 'phone-pad'}
                  autoCapitalize="none"
                  style={styles.input}
                  mode="outlined"
                  outlineColor={theme.colors.border}
                  activeOutlineColor={theme.colors.primary}
                  contentStyle={styles.inputContent}
                />

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  style={styles.input}
                  mode="outlined"
                  outlineColor={theme.colors.border}
                  activeOutlineColor={theme.colors.primary}
                  contentStyle={styles.inputContent}
                />

                <Text
                  variant="bodySmall"
                  style={styles.forgotPassword}
                  onPress={() => {
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
                  disabled={loading}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  buttonColor={theme.colors.primary}
                  textColor="#FFFFFF"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>

                <View style={styles.registerContainer}>
                  <Text variant="bodySmall" style={styles.registerText}>
                    Don't have an account?{' '}
                    <Text
                      style={styles.registerLink}
                      onPress={() => {
                        // @ts-ignore
                        navigation.navigate('Register');
                      }}
                    >
                      Register here
                    </Text>
                  </Text>
                </View>

                <View style={styles.termsContainer}>
                  <Text variant="bodySmall" style={styles.termsText}>
                    By signing in, you agree to our{' '}
                    <Text
                      style={styles.link}
                      onPress={() => {
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
                        // @ts-ignore
                        navigation.navigate('TermsAndConditions');
                      }}
                    >
                      Terms & Conditions
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: 'rgba(107, 20, 109, 0.65)', // Brand color overlay
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.xl + 4,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
    color: theme.colors.primary,
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
  },
  input: {
    marginBottom: theme.spacing.md,
    backgroundColor: '#FFFFFF',
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
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  buttonContent: {
    paddingVertical: theme.spacing.sm + 4,
  },
  registerContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
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
    marginTop: theme.spacing.sm,
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
