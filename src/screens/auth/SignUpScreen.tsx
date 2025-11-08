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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect, { type PickerStyle } from 'react-native-picker-select';
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
import {
  registerUser,
  verifyOtp,
  finalizeSignup,
  clearAuthError,
} from '../../redux/auth';
import type { RootState, AppDispatch } from '../../redux/types';
import { theme } from '../../theme/theme';

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

export default function SignUpScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, registrationMessage } = useSelector((state: RootState) => state.auth);

  const [currentStep, setCurrentStep] = useState<SignUpStep>('register');
  const [sessionId, setSessionId] = useState<string | null>(null);

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

  // Password step state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const navigationTimerRef = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarVisible(true);
    }

    return () => {
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }
    };
  }, [error]);

  const handleDismissSnackbar = () => {
    setSnackbarVisible(false);
    setSnackbarMessage('');
    dispatch(clearAuthError());
  };

  const handleRegister = useCallback(async () => {
    dispatch(clearAuthError());

    if ((!email && !phoneNumber) || !firstName || !lastName) {
      Alert.alert('Incomplete', 'Phone/email, first name and last name are required.');
      return;
    }

    if (phoneNumber && phoneNumber.replace(/\D/g, '').length !== 11) {
      Alert.alert('Invalid phone number', 'Phone number must contain 11 digits.');
      return;
    }

    const registrationData: Record<string, string> = {
      first_name: firstName,
      last_name: lastName,
    };

    if (phoneNumber) {
      registrationData.phone = phoneNumber;
    }
    if (email) {
      registrationData.email = email;
    }

    const result = await dispatch(registerUser(registrationData as any));

    if (registerUser.fulfilled.match(result)) {
      const payload = result.payload as any;
      const session =
        payload?.data?.data?.session_id ??
        payload?.data?.session_id ??
        payload?.session_id ??
        null;

      if (session) {
        setSessionId(session);
      }

      setSnackbarMessage(payload?.message || 'OTP sent. Please verify.');
      setSnackbarVisible(true);
      setCurrentStep('otp');
    }
  }, [dispatch, email, firstName, lastName, phoneNumber]);

  const handleVerifyOtp = useCallback(async () => {
    dispatch(clearAuthError());

    if (!sessionId) {
      Alert.alert('Session expired', 'Please restart the registration process.');
      setCurrentStep('register');
      return;
    }

    if (!otp || otp.trim().length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP sent to you.');
      return;
    }

    const result = await dispatch(verifyOtp({ session_id: sessionId, otp }));

    if (verifyOtp.fulfilled.match(result)) {
      setSnackbarMessage(result.payload?.message || 'OTP verified. Continue to profile details.');
      setSnackbarVisible(true);
      setCurrentStep('profileDetails');
    }
  }, [dispatch, otp, sessionId]);

  const handleCollectProfileDetails = useCallback(() => {
    dispatch(clearAuthError());

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
  }, [address, dispatch, dob, state]);

  const handleFinalizeSignup = useCallback(async () => {
    dispatch(clearAuthError());

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

    const payload: Record<string, string> = {
      session_id: sessionId,
      password,
      country: 'Nigeria',
      state,
      address,
    };

    if (dob) {
      payload.dob = dob.toISOString().split('T')[0];
    }

    const result = await dispatch(finalizeSignup(payload));

    if (finalizeSignup.fulfilled.match(result)) {
      setSnackbarMessage(result.payload?.message || 'Account created successfully.');
      setSnackbarVisible(true);

      navigationTimerRef.current = setTimeout(() => {
        // @ts-ignore - stack param types configured elsewhere
        navigation.replace('Dashboard');
      }, 900);
    }
  }, [address, confirmPassword, dispatch, dob, navigation, password, sessionId, state]);

  const formattedDob = useMemo(() => (dob ? dob.toISOString().split('T')[0] : ''), [dob]);

  const renderRegisterStep = () => (
    <View style={styles.formStep}>
      <Surface style={styles.noticeCard} elevation={0}>
        <Text style={styles.noticeTitle}>Important: Accurate Information Required</Text>
        <Text style={styles.noticeDescription}>
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
        style={styles.input}
        mode="outlined"
        outlineColor={theme.colors.border + '80'}
        activeOutlineColor={theme.colors.primary}
        contentStyle={styles.inputContent}
        maxLength={15}
      />
      <HelperText type="info" style={styles.helperText}>
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
        style={styles.input}
        mode="outlined"
        outlineColor={theme.colors.border + '80'}
        activeOutlineColor={theme.colors.primary}
        contentStyle={styles.inputContent}
      />
      <HelperText type="info" style={styles.helperText}>
        Provide a valid email address for account notifications.
      </HelperText>

      <TextInput
        label="First name"
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
        returnKeyType="next"
        style={styles.input}
        mode="outlined"
        outlineColor={theme.colors.border + '80'}
        activeOutlineColor={theme.colors.primary}
        contentStyle={styles.inputContent}
      />

      <TextInput
        label="Last name"
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
        returnKeyType="done"
        style={styles.input}
        mode="outlined"
        outlineColor={theme.colors.border + '80'}
        activeOutlineColor={theme.colors.primary}
        contentStyle={styles.inputContent}
      />

      <Button
        mode="contained"
        icon="send"
        onPress={handleRegister}
        loading={loading}
        disabled={loading || (!email && !phoneNumber) || !firstName || !lastName}
        style={styles.primaryButton}
        contentStyle={styles.buttonContent}
        buttonColor={theme.colors.primary}
        textColor="#FFFFFF"
        rippleColor="rgba(255,255,255,0.2)"
      >
        {loading ? 'Sending OTP…' : 'Register & Send OTP'}
      </Button>

      <View style={styles.footerTextRow}>
        <Text variant="bodySmall" style={styles.footerText}>
          Already have an account?{' '}
          <Text
            style={styles.footerLink}
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
      <Text style={styles.stepInstruction}>
        Enter the 6-digit one-time password sent to your phone or email.
      </Text>

      <TextInput
        label="One-Time Password"
        value={otp}
        onChangeText={setOtp}
        placeholder="123456"
        keyboardType="number-pad"
        returnKeyType="done"
        style={styles.input}
        mode="outlined"
        outlineColor={theme.colors.border + '80'}
        activeOutlineColor={theme.colors.primary}
        contentStyle={styles.inputContent}
        maxLength={6}
      />

      {registrationMessage ? (
        <HelperText type="info" style={styles.helperText}>
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
        buttonColor={theme.colors.primary}
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
        labelStyle={styles.secondaryTextButtonLabel}
      >
        Resend OTP
      </Button>
    </View>
  );

  const renderProfileDetailsStep = () => (
    <View style={styles.formStep}>
      <Surface style={styles.noticeCard} elevation={0}>
        <Text style={styles.noticeDescription}>
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
            style={styles.input}
            mode="outlined"
            outlineColor={theme.colors.border + '80'}
            activeOutlineColor={theme.colors.primary}
            right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
            pointerEvents="none"
            contentStyle={styles.inputContent}
          />
        </View>
      </TouchableWithoutFeedback>

      <HelperText type="info" style={styles.helperText}>
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

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerFloatingLabel}>State / Province</Text>
        <RNPickerSelect
          onValueChange={(value) => {
            setState(value);
            Keyboard.dismiss();
          }}
          items={nigerianStates.map((stateName) => ({ label: stateName, value: stateName }))}
          placeholder={{ label: 'Select your state', value: '' }}
          value={state}
          style={pickerSelectStyles}
          useNativeAndroidPickerStyle={false}
          textInputProps={{
            returnKeyType: 'next',
          }}
          touchableWrapperProps={{ activeOpacity: 0.7 }}
          Icon={() => (
            <View style={styles.pickerIcon} pointerEvents="none">
              <Text style={styles.pickerIconText}>▼</Text>
            </View>
          )}
        />
      </View>

      <TextInput
        label="Home address"
        value={address}
        onChangeText={setAddress}
        placeholder="House number, street, city"
        autoCapitalize="sentences"
        returnKeyType="done"
        multiline
        style={[styles.input, styles.multilineInput]}
        mode="outlined"
        outlineColor={theme.colors.border + '80'}
        activeOutlineColor={theme.colors.primary}
        contentStyle={[styles.inputContent, styles.multilineContent]}
      />

      <Button
        mode="contained"
        icon="arrow-right"
        onPress={handleCollectProfileDetails}
        loading={loading}
        disabled={loading}
        style={styles.primaryButton}
        contentStyle={styles.buttonContent}
        buttonColor={theme.colors.primary}
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
        style={styles.input}
        mode="outlined"
        outlineColor={theme.colors.border + '80'}
        activeOutlineColor={theme.colors.primary}
        contentStyle={styles.inputContent}
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowPassword(!showPassword)}
            forceTextInputFocus={false}
          />
        }
      />
      <HelperText type="info" style={styles.helperText}>
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
        style={styles.input}
        mode="outlined"
        outlineColor={theme.colors.border + '80'}
        activeOutlineColor={theme.colors.primary}
        contentStyle={styles.inputContent}
        right={
          <TextInput.Icon
            icon={showConfirmPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            forceTextInputFocus={false}
          />
        }
        error={!!passwordError || passwordsMismatch}
      />
      <HelperText
        type={passwordError ? 'error' : 'info'}
        visible={!!passwordError || passwordsMismatch}
        style={styles.helperText}
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
        buttonColor={theme.colors.primary}
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
      <View style={styles.container}>
        <Image
          source={require('../../../assets/background/2149836836.jpg')}
          style={styles.backgroundImage}
          contentFit="cover"
          priority="high"
        />
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.6)', 'rgba(107, 20, 109, 0.15)']}
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
              <Surface style={styles.formCard} elevation={5}>
                <View style={styles.stepHeader}>
                  <Text style={styles.formTitle}>Create your account</Text>
                  <Text style={styles.formSubtitle}>
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
                          isCompleted && styles.stepChipCompleted,
                          isActive && styles.stepChipActive,
                        ]}
                        textStyle={isActive ? styles.stepChipTextActive : styles.stepChipText}
                        compact
                      >
                        {index + 1}. {step.label}
                      </Chip>
                    );
                  })}
                </View>

                <Divider style={styles.divider} />

                <Text style={styles.stepDescription}>
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
          style={styles.snackbar}
        >
          {snackbarMessage || error || 'Something happened.'}
        </Snackbar>
      </View>
    </TouchableWithoutFeedback>
  );
}

const pickerSelectStyles: PickerStyle = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 0,
    paddingHorizontal: 0,
    paddingRight: 32,
    borderWidth: 0,
    color: '#000000',
    backgroundColor: 'transparent',
    height: 40,
    lineHeight: 24,
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 0,
    paddingRight: 32,
    borderWidth: 0,
    color: '#000000',
    backgroundColor: 'transparent',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  placeholder: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  viewContainer: {
    width: '100%',
  },
};

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
  multilineInput: {
    minHeight: 90,
  },
  inputContent: {
    fontSize: 16,
  },
  multilineContent: {
    paddingTop: theme.spacing.sm,
  },
  helperText: {
    marginBottom: theme.spacing.sm,
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
  pickerIcon: {
    position: 'absolute',
    right: 0,
    height: '100%',
    justifyContent: 'center',
    paddingRight: theme.spacing.sm,
  },
  pickerIconText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
  },
  snackbar: {
    marginBottom: theme.spacing.xl,
  },
});


