import React, { useCallback, useMemo, useRef, useState } from 'react';
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
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Text,
  TextInput,
  Button,
  Snackbar,
  Surface,
  HelperText,
  Chip,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';
import { useThemeMode } from '../../theme/ThemeProvider';

const { width, height } = Dimensions.get('window');

type SignUpStep = 'register' | 'otp' | 'profileDetails' | 'setPassword';

type StepMeta = {
  key: SignUpStep;
  label: string;
  description: string;
};

const steps: StepMeta[] = [
  {
    key: 'register',
    label: 'Sign up',
    description: 'Provide contact details to receive an OTP.',
  },
  {
    key: 'otp',
    label: 'Verify',
    description: 'Enter the one-time password sent to you.',
  },
  {
    key: 'profileDetails',
    label: 'Profile',
    description: 'Share a few personal details for KYC.',
  },
  {
    key: 'setPassword',
    label: 'Security',
    description: 'Create a strong password to secure your account.',
  },
];

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized.length === 3
    ? normalized.replace(/./g, (c) => c + c)
    : normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function SignUpScreen() {
  const navigation = useNavigation();

  const [currentStep, setCurrentStep] = useState<SignUpStep>('register');
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState('');

  // Register step state
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // OTP step state
  const [otp, setOtp] = useState('');

  // Profile step state
  const [dob, setDob] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [stateModalVisible, setStateModalVisible] = useState(false);

  // Password step state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const navigationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { mode, palette } = useThemeMode();
  const isDark = mode === 'dark';
  const borderNeutral = isDark ? 'rgba(148, 163, 184, 0.42)' : 'rgba(148, 163, 184, 0.45)';
  const borderSoft = isDark ? 'rgba(148, 163, 184, 0.28)' : 'rgba(148, 163, 184, 0.16)';
  const cardBackground = isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255,255,255,0.94)';
  const stepChipBackground = isDark ? 'rgba(15, 23, 42, 0.6)' : '#F4F4F6';
  const stepChipActiveBackground = isDark
    ? hexToRgba(palette.primary, 0.2)
    : hexToRgba(palette.primary, 0.1);
  const stepChipCompletedBorder = isDark
    ? hexToRgba(palette.primary, 0.32)
    : hexToRgba(palette.primary, 0.27);
  const noticeBackground = isDark
    ? hexToRgba(palette.primary, 0.12)
    : hexToRgba(palette.primary, 0.06);
  const pickerBackground = isDark ? palette.card : '#FFFFFF';
  const gradientColors: [string, string] = isDark
    ? ['rgba(2, 6, 23, 0.82)', 'rgba(76, 29, 149, 0.35)']
    : ['rgba(15, 23, 42, 0.6)', 'rgba(107, 20, 109, 0.15)'];

  const dynamicStyles = useMemo(
    () => ({
      container: {
        backgroundColor: palette.background,
      },
      overlay: {},
      formCard: {
        backgroundColor: cardBackground,
        borderColor: stepChipCompletedBorder,
      },
      formTitle: {
        color: palette.primary,
      },
      formSubtitle: {
        color: palette.textSecondary,
      },
      stepChip: {
        backgroundColor: stepChipBackground,
      },
      stepChipCompleted: {
        borderColor: stepChipCompletedBorder,
      },
      stepChipActive: {
        backgroundColor: stepChipActiveBackground,
      },
      stepChipText: {
        color: palette.textSecondary,
      },
      stepChipTextActive: {
        color: palette.primary,
      },
      divider: {
        backgroundColor: borderSoft,
      },
      stepDescription: {
        color: palette.textSecondary,
      },
      stepInstruction: {
        color: palette.textSecondary,
      },
      noticeCard: {
        backgroundColor: noticeBackground,
      },
      noticeTitle: {
        color: palette.primary,
      },
      noticeDescription: {
        color: palette.textSecondary,
      },
      helperText: {
        color: palette.textSecondary,
      },
      input: {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.65)' : '#FFFFFF',
      },
      footerText: {
        color: palette.textSecondary,
      },
      footerLink: {
        color: palette.primary,
      },
      secondaryTextButtonLabel: {
        color: palette.primary,
      },
      pickerFloatingLabel: {
        color: palette.textSecondary,
      },
      customPicker: {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.65)' : '#FFFFFF',
        borderColor: borderNeutral,
      },
      customPickerValue: {
        color: palette.text,
      },
      customPickerPlaceholder: {
        color: palette.textSecondary,
      },
      customPickerIcon: {
        color: palette.textSecondary,
      },
      iosPickerButton: {
        borderColor: hexToRgba(palette.primary, isDark ? 0.35 : 0.33),
      },
      snackbar: {
        backgroundColor: isDark ? palette.surface : undefined,
      },
      pickerModalContent: {
        backgroundColor: pickerBackground,
      },
      pickerModalHandle: {
        backgroundColor: borderNeutral,
      },
      pickerModalTitle: {
        color: palette.text,
      },
      pickerOption: {
        borderColor: borderSoft,
      },
      pickerOptionSelected: {
        backgroundColor: hexToRgba(palette.primary, isDark ? 0.15 : 0.05),
      },
      pickerOptionLabel: {
        color: palette.text,
      },
      pickerOptionLabelSelected: {
        color: palette.primary,
      },
      pickerOptionCheck: {
        color: palette.primary,
      },
      pickerModalCloseLabel: {
        color: palette.primary,
      },
    }),
    [
      borderNeutral,
      borderSoft,
      cardBackground,
      isDark,
      palette.background,
      palette.primary,
      palette.surface,
      palette.text,
      palette.textSecondary,
      pickerBackground,
      stepChipActiveBackground,
      stepChipBackground,
      stepChipCompletedBorder,
    ]
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

  React.useEffect(() => {
    return () => {
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }
    };
  }, []);

  const handleDismissSnackbar = () => {
    setSnackbarVisible(false);
    setSnackbarMessage('');
  };

  const handleRegister = useCallback(async () => {
    if ((!email && !phoneNumber) || !firstName || !lastName) {
      Alert.alert('Incomplete', 'Phone/email, first name and last name are required.');
      return;
    }

    if (phoneNumber && phoneNumber.replace(/\D/g, '').length !== 11) {
      Alert.alert('Invalid phone number', 'Phone number must contain 11 digits.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const session = `session-${Date.now()}`;
      setSessionId(session);
      setRegistrationMessage('OTP sent successfully. Please verify.');
      setSnackbarMessage('OTP sent successfully.');
      setSnackbarVisible(true);
      setCurrentStep('otp');
      setLoading(false);
    }, 900);
  }, [email, firstName, lastName, phoneNumber]);

  const handleVerifyOtp = useCallback(async () => {
    if (!sessionId) {
      Alert.alert('Session expired', 'Please restart the registration process.');
      setCurrentStep('register');
      return;
    }

    if (!otp || otp.trim().length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP sent to you.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setSnackbarMessage('OTP verified. Continue to profile details.');
      setSnackbarVisible(true);
      setCurrentStep('profileDetails');
      setLoading(false);
    }, 800);
  }, [otp, sessionId]);

  const handleCollectProfileDetails = useCallback(() => {
    if (!dob) {
      Alert.alert('Missing date of birth', 'Please select your date of birth.');
      return;
    }

    if (!state) {
      Alert.alert('Missing state', 'Please select the state you reside in.');
      return;
    }

    if (!address) {
      Alert.alert('Missing address', 'Kindly provide your home address.');
      return;
    }

    setCurrentStep('setPassword');
  }, [address, dob, state]);

  const handleFinalizeSignup = useCallback(async () => {
    if (!sessionId) {
      Alert.alert('Session expired', 'Please restart the registration process.');
      setCurrentStep('register');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }

    if (!/[0-9]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setPasswordError('Must include at least one number and one special character.');
      return;
    }

    setPasswordError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSnackbarMessage('Account created successfully.');
      setSnackbarVisible(true);

      navigationTimerRef.current = setTimeout(() => {
        // @ts-ignore - stack param types configured elsewhere
        navigation.replace('Dashboard');
      }, 900);
    }, 1000);
  }, [address, confirmPassword, navigation, password, sessionId, state, dob]);

  const formattedDob = useMemo(() => (dob ? dob.toISOString().split('T')[0] : ''), [dob]);

  const handleSelectState = (value: string) => {
    setState(value);
    setStateModalVisible(false);
  };

  const renderRegisterStep = () => (
    <View style={styles.formStep}>
      <Surface style={[styles.noticeCard, dynamicStyles.noticeCard]} elevation={0}>
        <Text style={[styles.noticeTitle, dynamicStyles.noticeTitle]}>
          Important: Accurate Information Required
        </Text>
        <Text style={[styles.noticeDescription, dynamicStyles.noticeDescription]}>
          Please provide accurate information as it will be used for Know Your Customer verification.
          Ensure your details match your official documents.
        </Text>
      </Surface>

      <TextInput
        label="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="08082737272"
        keyboardType="phone-pad"
        autoCapitalize="none"
        returnKeyType="next"
        style={[styles.input, dynamicStyles.input]}
        mode="outlined"
        outlineColor={borderNeutral}
        activeOutlineColor={palette.primary}
        contentStyle={styles.inputContent}
        maxLength={15}
        theme={inputTheme}
      />
      <HelperText type="info" style={[styles.helperText, dynamicStyles.helperText]}>
        Enter your active phone number (11 digits) to receive OTP.
      </HelperText>

      <TextInput
        label="Email address"
        value={email}
        onChangeText={setEmail}
        placeholder="name@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        style={[styles.input, dynamicStyles.input]}
        mode="outlined"
        outlineColor={borderNeutral}
        activeOutlineColor={palette.primary}
        contentStyle={styles.inputContent}
        theme={inputTheme}
      />
      <HelperText type="info" style={[styles.helperText, dynamicStyles.helperText]}>
        Provide a valid email address for account notifications.
      </HelperText>

      <TextInput
        label="First name"
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
        returnKeyType="next"
        style={[styles.input, dynamicStyles.input]}
        mode="outlined"
        outlineColor={borderNeutral}
        activeOutlineColor={palette.primary}
        contentStyle={styles.inputContent}
        theme={inputTheme}
      />

      <TextInput
        label="Last name"
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
        returnKeyType="done"
        style={[styles.input, dynamicStyles.input]}
        mode="outlined"
        outlineColor={borderNeutral}
        activeOutlineColor={palette.primary}
        contentStyle={styles.inputContent}
        theme={inputTheme}
      />

      <Button
        mode="contained"
        icon="send"
        onPress={handleRegister}
        loading={loading}
        disabled={loading || (!email && !phoneNumber) || !firstName || !lastName}
        style={styles.primaryButton}
        contentStyle={styles.buttonContent}
        buttonColor={palette.primary}
        textColor="#FFFFFF"
        rippleColor="rgba(255,255,255,0.2)"
      >
        {loading ? 'Sending OTP…' : 'Register & Send OTP'}
      </Button>

      <View style={styles.footerTextRow}>
        <Text variant="bodySmall" style={[styles.footerText, dynamicStyles.footerText]}>
          Already have an account?{' '}
          <Text
            style={[styles.footerLink, dynamicStyles.footerLink]}
            onPress={() => {
              Keyboard.dismiss();
              // @ts-ignore
              navigation.navigate('SignIn');
            }}
          >
            Sign in
          </Text>
        </Text>
      </View>
    </View>
  );

  const renderOtpStep = () => (
    <View style={styles.formStep}>
      <Text style={[styles.stepInstruction, dynamicStyles.stepInstruction]}>
        Enter the 6-digit one-time password sent to your phone or email.
      </Text>

      <TextInput
        label="One-Time Password"
        value={otp}
        onChangeText={setOtp}
        placeholder="123456"
        keyboardType="number-pad"
        returnKeyType="done"
        style={[styles.input, dynamicStyles.input]}
        mode="outlined"
        outlineColor={borderNeutral}
        activeOutlineColor={palette.primary}
        contentStyle={styles.inputContent}
        maxLength={6}
        theme={inputTheme}
      />

      {registrationMessage ? (
        <HelperText type="info" style={[styles.helperText, dynamicStyles.helperText]}>
          {registrationMessage}
        </HelperText>
      ) : null}

      <Button
        mode="contained"
        icon="check"
        onPress={handleVerifyOtp}
        loading={loading}
        disabled={loading || otp.trim().length !== 6}
        style={styles.primaryButton}
        contentStyle={styles.buttonContent}
        buttonColor={palette.primary}
        textColor="#FFFFFF"
        rippleColor="rgba(255,255,255,0.2)"
      >
        {loading ? 'Verifying…' : 'Verify OTP'}
      </Button>

      <Button
        mode="text"
        onPress={handleRegister}
        disabled={loading}
        style={styles.secondaryTextButton}
        labelStyle={[styles.secondaryTextButtonLabel, dynamicStyles.secondaryTextButtonLabel]}
      >
        Resend OTP
      </Button>
    </View>
  );

  const renderProfileDetailsStep = () => (
    <View style={styles.formStep}>
      <Surface style={[styles.noticeCard, dynamicStyles.noticeCard]} elevation={0}>
        <Text style={[styles.noticeDescription, dynamicStyles.noticeDescription]}>
          Provide accurate information. This must match your government-issued identification.
        </Text>
      </Surface>

      <TouchableWithoutFeedback onPress={() => setShowDatePicker(true)}>
        <View>
          <TextInput
            label="Date of birth"
            value={formattedDob}
            placeholder="YYYY-MM-DD"
            editable={false}
            style={[styles.input, dynamicStyles.input]}
            mode="outlined"
            outlineColor={borderNeutral}
            activeOutlineColor={palette.primary}
            right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
            pointerEvents="none"
            contentStyle={styles.inputContent}
            theme={inputTheme}
          />
        </View>
      </TouchableWithoutFeedback>

      <HelperText type="info" style={[styles.helperText, dynamicStyles.helperText]}>
        Enter your date of birth as it appears on official documents.
      </HelperText>

      {showDatePicker && (
        <DateTimePicker
          value={dob || new Date(new Date().setFullYear(new Date().getFullYear() - 25))}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 16))}
          minimumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 100))}
          onChange={(event, selectedDate) => {
            if (Platform.OS === 'android') {
              setShowDatePicker(false);
            }

            if (event.type === 'set' && selectedDate) {
              setDob(selectedDate);
            }

            if (event.type === 'dismissed' && Platform.OS === 'android') {
              setShowDatePicker(false);
            }
          }}
        />
      )}

      {showDatePicker && Platform.OS === 'ios' && (
        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(false)}
          style={[styles.iosPickerButton, dynamicStyles.iosPickerButton]}
          textColor={palette.primary}
        >
          Done
        </Button>
      )}

      <View style={styles.pickerContainer}>
        <Text style={[styles.pickerFloatingLabel, dynamicStyles.pickerFloatingLabel]}>
          State / Province
        </Text>
        <Pressable
          style={[styles.customPicker, dynamicStyles.customPicker]}
          onPress={() => {
            Keyboard.dismiss();
            setStateModalVisible(true);
          }}
        >
          <Text
            style={[
              styles.customPickerValue,
              dynamicStyles.customPickerValue,
              !state && styles.customPickerPlaceholder,
              !state && dynamicStyles.customPickerPlaceholder,
            ]}
          >
            {state || 'Select your state'}
          </Text>
          <Text style={[styles.customPickerIcon, dynamicStyles.customPickerIcon]}>▼</Text>
        </Pressable>
      </View>

      <TextInput
        label="Home address"
        value={address}
        onChangeText={setAddress}
        placeholder="House number, street, city"
        autoCapitalize="sentences"
        returnKeyType="done"
        style={[styles.input, dynamicStyles.input]}
        mode="outlined"
        outlineColor={borderNeutral}
        activeOutlineColor={palette.primary}
        contentStyle={styles.inputContent}
        theme={inputTheme}
      />

      <Button
        mode="contained"
        icon="arrow-right"
        onPress={handleCollectProfileDetails}
        loading={loading}
        disabled={loading}
        style={styles.primaryButton}
        contentStyle={styles.buttonContent}
        buttonColor={palette.primary}
        textColor="#FFFFFF"
        rippleColor="rgba(255,255,255,0.2)"
      >
        Continue
      </Button>
    </View>
  );

  const passwordsMismatch = Boolean(password) && Boolean(confirmPassword) && password !== confirmPassword;

  const renderSetPasswordStep = () => (
    <View style={styles.formStep}>
      <TextInput
        label="New password"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          setPasswordError('');
        }}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        style={[styles.input, dynamicStyles.input]}
        mode="outlined"
        outlineColor={borderNeutral}
        activeOutlineColor={palette.primary}
        contentStyle={styles.inputContent}
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowPassword(!showPassword)}
            forceTextInputFocus={false}
          />
        }
        theme={inputTheme}
      />
      <HelperText type="info" style={[styles.helperText, dynamicStyles.helperText]}>
        Must be at least 8 characters long, contain a number, and a special character.
      </HelperText>

      <TextInput
        label="Confirm password"
        value={confirmPassword}
        onChangeText={(value) => {
          setConfirmPassword(value);
          setPasswordError('');
        }}
        secureTextEntry={!showConfirmPassword}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        style={[styles.input, dynamicStyles.input]}
        mode="outlined"
        outlineColor={borderNeutral}
        activeOutlineColor={palette.primary}
        contentStyle={styles.inputContent}
        right={
          <TextInput.Icon
            icon={showConfirmPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            forceTextInputFocus={false}
          />
        }
        error={!!passwordError || passwordsMismatch}
        theme={inputTheme}
      />
      <HelperText
        type={passwordError ? 'error' : 'info'}
        visible={!!passwordError || passwordsMismatch}
        style={[
          styles.helperText,
          !passwordError && dynamicStyles.helperText,
        ]}
      >
        {passwordError || (passwordsMismatch ? 'Passwords do not match.' : '')}
      </HelperText>

      <Button
        mode="contained"
        icon="check-circle"
        onPress={handleFinalizeSignup}
        loading={loading}
        disabled={
          loading ||
          !password ||
          !confirmPassword ||
          passwordsMismatch ||
          !!passwordError
        }
        style={styles.primaryButton}
        contentStyle={styles.buttonContent}
        buttonColor={palette.primary}
        textColor="#FFFFFF"
        rippleColor="rgba(255,255,255,0.2)"
      >
        {loading ? 'Creating account…' : 'Set password & finish'}
      </Button>
    </View>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 'register':
        return renderRegisterStep();
      case 'otp':
        return renderOtpStep();
      case 'profileDetails':
        return renderProfileDetailsStep();
      case 'setPassword':
        return renderSetPasswordStep();
      default:
        return renderRegisterStep();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, dynamicStyles.container]}>
        <Image
          source={require('../../../assets/background/2149836836.jpg')}
          style={styles.backgroundImage}
          contentFit="cover"
          priority="high"
        />
        <LinearGradient
          colors={gradientColors}
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
              <Surface style={[styles.formCard, dynamicStyles.formCard]} elevation={5}>
                <View style={styles.stepHeader}>
                  <Text style={[styles.formTitle, dynamicStyles.formTitle]}>Create your account</Text>
                  <Text style={[styles.formSubtitle, dynamicStyles.formSubtitle]}>
                    Follow the steps below to complete your registration.
                  </Text>
                </View>

                <View style={styles.stepChipsRow}>
                  {steps.map((step, index) => {
                    const isActive = step.key === currentStep;
                    const isCompleted = steps.findIndex((item) => item.key === currentStep) > index;

                    return (
                      <Chip
                        key={step.key}
                        selected={isActive}
                        mode={isCompleted ? 'outlined' : 'flat'}
                        style={[
                          styles.stepChip,
                          dynamicStyles.stepChip,
                          isCompleted && styles.stepChipCompleted,
                          isCompleted && dynamicStyles.stepChipCompleted,
                          isActive && styles.stepChipActive,
                          isActive && dynamicStyles.stepChipActive,
                        ]}
                        textStyle={[
                          isActive ? styles.stepChipTextActive : styles.stepChipText,
                          isActive ? dynamicStyles.stepChipTextActive : dynamicStyles.stepChipText,
                        ]}
                        compact
                      >
                        {index + 1}. {step.label}
                      </Chip>
                    );
                  })}
                </View>

                <Divider style={[styles.divider, dynamicStyles.divider]} />

                <Text style={[styles.stepDescription, dynamicStyles.stepDescription]}>
                  {steps.find((step) => step.key === currentStep)?.description}
                </Text>

                {renderContent()}
              </Surface>
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
          {snackbarMessage || 'Something happened.'}
        </Snackbar>

        <Modal
          visible={stateModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setStateModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setStateModalVisible(false)}>
            <View style={styles.pickerModalBackdrop} />
          </TouchableWithoutFeedback>
            <View style={[styles.pickerModalContent, dynamicStyles.pickerModalContent]}>
            <View style={[styles.pickerModalHandle, dynamicStyles.pickerModalHandle]} />
            <Text style={[styles.pickerModalTitle, dynamicStyles.pickerModalTitle]}>
              Select your state
            </Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              {nigerianStates.map((stateName) => {
                const isSelected = state === stateName;
                return (
                  <Pressable
                    key={stateName}
                    style={[
                      styles.pickerOption,
                      dynamicStyles.pickerOption,
                      isSelected && styles.pickerOptionSelected,
                      isSelected && dynamicStyles.pickerOptionSelected,
                    ]}
                    onPress={() => handleSelectState(stateName)}
                  >
                    <Text
                      style={[
                        styles.pickerOptionLabel,
                        isSelected && styles.pickerOptionLabelSelected,
                        dynamicStyles.pickerOptionLabel,
                        isSelected && dynamicStyles.pickerOptionLabelSelected,
                      ]}
                    >
                      {stateName}
                    </Text>
                    {isSelected ? (
                      <Text style={[styles.pickerOptionCheck, dynamicStyles.pickerOptionCheck]}>✓</Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
            <Button
              mode="text"
              onPress={() => setStateModalVisible(false)}
              style={styles.pickerModalClose}
              labelStyle={[styles.pickerModalCloseLabel, dynamicStyles.pickerModalCloseLabel]}
            >
              Cancel
            </Button>
          </View>
        </Modal>
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    paddingBottom: theme.spacing.xl * 2,
    justifyContent: 'center',
  },
  formCard: {
    borderRadius: theme.borderRadius.xl + 8,
    padding: theme.spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: theme.colors.primary + '1A',
  },
  stepHeader: {
    marginBottom: theme.spacing.lg,
    alignItems: 'flex-start',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  formSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  stepChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  stepChip: {
    backgroundColor: '#F4F4F6',
  },
  stepChipCompleted: {
    borderColor: theme.colors.primary + '44',
  },
  stepChipActive: {
    backgroundColor: theme.colors.primary + '1A',
  },
  stepChipText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  stepChipTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  divider: {
    marginVertical: theme.spacing.md,
    backgroundColor: theme.colors.border + '55',
  },
  stepDescription: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  formStep: {
    gap: theme.spacing.sm,
  },
  noticeCard: {
    backgroundColor: theme.colors.primary + '0F',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  noticeTitle: {
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  noticeDescription: {
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  input: {
    marginBottom: theme.spacing.xs,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.md,
  },
  inputContent: {
    fontSize: 16,
  },
  helperText: {
    marginBottom: theme.spacing.sm,
  },
  iosPickerButton: {
    alignSelf: 'flex-end',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderColor: theme.colors.primary + '55',
  },
  primaryButton: {
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  buttonContent: {
    paddingVertical: theme.spacing.md,
  },
  footerTextRow: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  footerText: {
    color: theme.colors.textSecondary,
  },
  footerLink: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  stepInstruction: {
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  secondaryTextButton: {
    alignSelf: 'flex-start',
  },
  secondaryTextButtonLabel: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  pickerContainer: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  pickerFloatingLabel: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontSize: 13,
  },
  customPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: Platform.OS === 'ios' ? theme.spacing.sm : theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border + 'A0',
    backgroundColor: '#FFFFFF',
  },
  customPickerValue: {
    fontSize: 16,
    color: '#101828',
  },
  customPickerPlaceholder: {
    color: '#8E8E93',
  },
  customPickerIcon: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  snackbar: {
    marginBottom: theme.spacing.xl,
  },
  pickerModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  pickerModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.xl : theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  pickerModalHandle: {
    width: 48,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.border + '80',
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  pickerModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: theme.colors.border + '33',
  },
  pickerOptionSelected: {
    backgroundColor: theme.colors.primary + '0D',
  },
  pickerOptionLabel: {
    fontSize: 16,
    color: theme.colors.text,
  },
  pickerOptionLabelSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  pickerOptionCheck: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  pickerModalClose: {
    marginTop: theme.spacing.md,
  },
  pickerModalCloseLabel: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});


