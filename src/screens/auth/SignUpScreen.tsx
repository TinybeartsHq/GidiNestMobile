import React, { useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TextInput as RNTextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';

const { height } = Dimensions.get('window');

const PHONE_REGEX = /^\+?[0-9]{7,15}$/;
const EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;

type Step = 'phone' | 'otp' | 'profile' | 'password';

const COUNTRY_CODES = [
  { code: '+234', label: '🇳🇬 Nigeria' },
  { code: '+233', label: '🇬🇭 Ghana' },
  { code: '+44', label: '🇬🇧 UK' },
  { code: '+1', label: '🇺🇸 USA' },
];

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
];

export default function SignUpScreen() {
  const navigation = useNavigation();
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';

  const [step, setStep] = useState<Step>('phone');
  const [countryCode, setCountryCode] = useState('+234');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
  const otpRefs = useRef<Array<RNTextInput | null>>([]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [pendingDob, setPendingDob] = useState<Date>(new Date(1995, 0, 1));
  const [dobPickerVisible, setDobPickerVisible] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [statePickerOpen, setStatePickerOpen] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const borderNeutral = isDark ? 'rgba(148, 163, 184, 0.45)' : 'rgba(148, 163, 184, 0.32)';
  const inputBackground = isDark ? 'rgba(15, 23, 42, 0.72)' : '#FFFFFF';
  const heroBackdropGradient = isDark
    ? (['rgba(12, 10, 30, 0.94)', 'rgba(15, 23, 42, 0.9)', 'rgba(15, 23, 42, 0.86)'] as const)
    : (['rgba(229, 231, 235, 0.94)', 'rgba(238, 235, 247, 0.9)', 'rgba(249, 248, 255, 0.96)'] as const);
  const isPhoneNumberValid = useMemo(() => PHONE_REGEX.test(phoneNumber.trim()), [phoneNumber]);
  const isOtpValid = useMemo(() => otpDigits.every((digit) => digit.trim().length === 1), [otpDigits]);
  const showProfileErrors = submitted && step === 'profile';

  const textInputTheme = useMemo(
    () => ({
      roundness: theme.borderRadius.lg,
    }),
    []
  );

  const handleBack = useCallback(() => {
    if (step === 'otp') {
      setStep('phone');
    } else if (step === 'profile') {
      setStep('otp');
    } else if (step === 'password') {
      setStep('profile');
    } else {
      // @ts-ignore
      if ('canGoBack' in navigation && navigation.canGoBack()) {
        // @ts-ignore
        navigation.goBack();
      } else {
        // @ts-ignore
        navigation.navigate('AuthLanding');
      }
    }
  }, [navigation, step]);

  const profileErrors = useMemo(() => {
    if (!submitted && step !== 'profile') {
      return { firstName: '', lastName: '', email: '', dob: '', state: '', address: '' };
    }
    return {
      firstName: !firstName.trim() ? 'First name is required.' : '',
      lastName: !lastName.trim() ? 'Last name is required.' : '',
      email: !EMAIL_REGEX.test(email.trim()) ? 'Enter a valid email address.' : '',
      dob: dob ? '' : 'Date of birth is required.',
      state: stateRegion ? '' : 'State is required.',
      address: address.trim().length > 5 ? '' : 'Enter your full address.',
    };
  }, [firstName, lastName, email, dob, stateRegion, address, submitted, step]);

  const handleSendCode = () => {
    if (isSendingCode) return;
    Keyboard.dismiss();
    setSubmitted(true);
    if (!isPhoneNumberValid) return;
    setIsSendingCode(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsSendingCode(false);
      setStep('otp');
    }, 450);
  };

  const handleVerifyCode = () => {
    if (isVerifyingOtp) return;
    Keyboard.dismiss();
    setSubmitted(true);
    if (!isOtpValid) return;
    setIsVerifyingOtp(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsVerifyingOtp(false);
      setStep('profile');
    }, 450);
  };

  const handleSaveProfile = () => {
    Keyboard.dismiss();
    setSubmitted(true);
    if (
      profileErrors.firstName ||
      profileErrors.lastName ||
      profileErrors.email ||
      profileErrors.dob ||
      profileErrors.state ||
      profileErrors.address
    ) {
      return;
    }
    setSubmitted(false);
    setStep('password');
  };

  const handleCreatePassword = () => {
    Keyboard.dismiss();
    setSubmitted(true);
    if (password.trim().length < 6 || password !== confirmPassword) return;
    Alert.alert(
      'Account created',
      'Your GidiNest account has been created. Sign in to continue.',
      [
        {
          text: 'Sign in',
          onPress: () => navigation.navigate('SignIn' as never),
        },
      ]
    );
  };

  const handleOtpChange = (value: string, index: number) => {
    const digits = value.replace(/\D/g, '').slice(0, 1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = digits;
    setOtpDigits(nextDigits);

    if (digits && index < otpRefs.current.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (index: number) => {
    if (index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOpenDobPicker = () => {
    setPendingDob(dob || new Date(1995, 0, 1));
    setDobPickerVisible(true);
  };

  const handleConfirmDob = () => {
    setDob(pendingDob);
    setDobPickerVisible(false);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const isPhoneStep = step === 'phone';
  const isOtpStep = step === 'otp';
  const isPasswordStep = step === 'password';
  const passwordInvalid = password.trim().length < 6;
  const confirmInvalid = password !== confirmPassword;

  const getStepTitle = () => {
    switch (step) {
      case 'phone':
        return 'Create your nest';
      case 'otp':
        return 'Verify your number';
      case 'profile':
        return 'Tell us about you';
      case 'password':
        return 'Secure your account';
      default:
        return '';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 'phone':
        return "Start your journey to save for childbirth. We'll send a verification code.";
      case 'otp':
        return `Enter the 6-digit code sent to ${countryCode} ${phoneNumber}`;
      case 'profile':
        return 'We use this to personalize your savings journey.';
      case 'password':
        return "Create a secure password you'll remember.";
    }
  };

  const renderPhoneStep = () => {
    const gradientColors = isDark
      ? ['rgba(15, 23, 42, 0.7)', 'rgba(15, 23, 42, 0.45)']
      : ['rgba(235, 235, 245, 0.95)', 'rgba(245, 242, 255, 0.9)'];
    return (
      <LinearGradient colors={gradientColors} style={[styles.phoneStepCard, { borderColor: borderNeutral }]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={styles.formBlock}>
          <View style={[styles.phoneContainer, { borderColor: borderNeutral, backgroundColor: inputBackground }]}>
            <Pressable style={styles.countryCodeButton} onPress={() => setCountryPickerOpen(!countryPickerOpen)}>
              <Text style={[styles.countryCodeText, { color: palette.text }]}>{countryCode}</Text>
              <MaterialCommunityIcons name={countryPickerOpen ? 'chevron-up' : 'chevron-down'} size={20} color={palette.textSecondary} />
            </Pressable>
            <View style={styles.phoneDivider} />
            <TextInput
              mode="flat"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="812 345 6789"
              keyboardType="phone-pad"
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSendCode}
              style={[styles.phoneInput, { backgroundColor: 'transparent' }]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={palette.text}
              placeholderTextColor={palette.textSecondary}
            />
          </View>
          {countryPickerOpen && (
            <View style={[styles.countryPicker, { borderColor: palette.border, backgroundColor: palette.card }]}>      
              {COUNTRY_CODES.map((item) => (
                <Pressable
                  key={item.code}
                  style={[
                    styles.countryOption,
                    {
                      backgroundColor: item.code === countryCode ? palette.primary : 'transparent',
                      borderBottomColor: palette.border,
                    },
                  ]}
                  onPress={() => {
                    setCountryCode(item.code);
                    setCountryPickerOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.countryOptionText,
                      { color: item.code === countryCode ? '#FFFFFF' : palette.text },
                    ]}
                  >
                    {item.label} ({item.code})
          </Text>
                </Pressable>
              ))}
      </View>
          )}
      </View>
      </LinearGradient>
    );
  };

  const renderOtpStep = () => {
    return (
      <View style={[styles.formBlock, styles.otpBlock]}>
        <Text style={[styles.fieldTitle, { color: palette.text }]}>Verification code</Text>
        <View style={styles.otpRow}>
          {otpDigits.map((digit, index) => (
        <TextInput
              key={index}
          mode="outlined"
              theme={textInputTheme}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !digit) {
                  handleOtpKeyPress(index);
                }
              }}
              ref={(ref) => {
                otpRefs.current[index] = ref;
              }}
              style={[styles.otpInput, { backgroundColor: inputBackground }]}
          contentStyle={styles.otpInputContent}
              textAlign="center"
              keyboardType="number-pad"
              maxLength={1}
              outlineColor={borderNeutral}
              activeOutlineColor={palette.primary}
              textColor={palette.text}
            />
          ))}
        </View>
        <View style={styles.otpActions}>
          <Button mode="text" compact textColor={palette.primary} labelStyle={styles.linkText}>
            Resend code
          </Button>
        </View>
      </View>
    );
  };

  const renderProfileStep = () => {
    const firstNameInvalid = !firstName.trim();
    const lastNameInvalid = !lastName.trim();
    const emailInvalid = !EMAIL_REGEX.test(email.trim());
    const dobInvalid = !dob;
    const stateInvalid = !stateRegion;
    const addressInvalid = address.trim().length <= 5;
    return (
      <View style={[styles.formBlock, styles.profileBlock]}>
        <Text style={[styles.fieldTitleTight, { color: palette.text }]}>First name</Text>
        <TextInput
          value={firstName}
          onChangeText={setFirstName}
          style={[styles.inputTight, { backgroundColor: inputBackground }]}
          mode="outlined"
          theme={textInputTheme}
          autoCapitalize="words"
          error={showProfileErrors && firstNameInvalid}
          outlineColor={borderNeutral}
          activeOutlineColor={palette.primary}
          textColor={palette.text}
        />

        <Text style={[styles.fieldTitleTight, { color: palette.text }]}>Last name</Text>
          <TextInput
          value={lastName}
          onChangeText={setLastName}
          style={[styles.inputTight, { backgroundColor: inputBackground }]}
            mode="outlined"
          theme={textInputTheme}
          autoCapitalize="words"
          error={showProfileErrors && lastNameInvalid}
          outlineColor={borderNeutral}
          activeOutlineColor={palette.primary}
          textColor={palette.text}
        />

        <Text style={[styles.fieldTitleTight, { color: palette.text }]}>Email address</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={[styles.inputTight, { backgroundColor: inputBackground }]}
          mode="outlined"
          theme={textInputTheme}
          keyboardType="email-address"
          autoCapitalize="none"
          error={showProfileErrors && emailInvalid}
          outlineColor={borderNeutral}
          activeOutlineColor={palette.primary}
          textColor={palette.text}
        />

        <Text style={[styles.fieldTitleTight, { color: palette.text }]}>Date of birth</Text>
        <Pressable
          style={[
            styles.selector,
            {
              borderColor: showProfileErrors && dobInvalid ? palette.error : borderNeutral,
              backgroundColor: inputBackground,
            },
          ]}
          onPress={handleOpenDobPicker}
        >
          <Text style={[styles.selectorLabel, { color: palette.textSecondary }]}>Select date</Text>
          <Text style={[styles.selectorValue, { color: dob ? palette.text : palette.textSecondary }]}>
            {dob ? dob.toLocaleDateString() : 'Tap to choose'}
          </Text>
        </Pressable>

        <Text style={[styles.fieldTitleTight, { color: palette.text }]}>State</Text>
        <Pressable
          style={[
            styles.selector,
            {
              borderColor: showProfileErrors && stateInvalid ? palette.error : borderNeutral,
              backgroundColor: inputBackground,
            },
          ]}
          onPress={() => setStatePickerOpen(true)}
        >
          <Text style={[styles.selectorLabel, { color: palette.textSecondary }]}>Select state</Text>
          <Text style={[styles.selectorValue, { color: stateRegion ? palette.text : palette.textSecondary }]}>
            {stateRegion || 'Tap to choose'}
          </Text>
        </Pressable>

        <Text style={[styles.fieldTitleTight, { color: palette.text }]}>Home address</Text>
      <TextInput
        value={address}
        onChangeText={setAddress}
          style={[styles.inputTight, { backgroundColor: inputBackground }]}
        mode="outlined"
          theme={textInputTheme}
          multiline
          numberOfLines={3}
          error={showProfileErrors && addressInvalid}
          outlineColor={borderNeutral}
          activeOutlineColor={palette.primary}
          textColor={palette.text}
        />

      <Button
        mode="contained"
          onPress={handleSaveProfile}
          buttonColor={palette.primary}
          textColor="#FFFFFF"
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          icon="arrow-right"
          disabled={
            firstNameInvalid ||
            lastNameInvalid ||
            emailInvalid ||
            dobInvalid ||
            stateInvalid ||
            addressInvalid
          }
        >
        Continue
      </Button>
    </View>
  );
  };

  const renderPasswordStep = () => {
    return (
      <View style={styles.formBlock}>
        <Text style={[styles.fieldTitleTight, { color: palette.text }]}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          style={[styles.inputTight, { backgroundColor: inputBackground }]}
          mode="outlined"
          theme={textInputTheme}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          error={submitted && isPasswordStep && passwordInvalid}
          outlineColor={borderNeutral}
          activeOutlineColor={palette.primary}
          textColor={palette.text}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
              forceTextInputFocus={false}
            />
          }
        />

        <Text style={[styles.fieldTitleTight, { color: palette.text }]}>Confirm password</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={[styles.inputTight, { backgroundColor: inputBackground }]}
          mode="outlined"
          theme={textInputTheme}
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          error={submitted && isPasswordStep && confirmInvalid}
          outlineColor={borderNeutral}
          activeOutlineColor={palette.primary}
          textColor={palette.text}
          right={
            <TextInput.Icon
              icon={showConfirmPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              forceTextInputFocus={false}
            />
          }
        />
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <LinearGradient colors={heroBackdropGradient} style={styles.backdropGradient} />
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              (isPhoneStep || isOtpStep || isPasswordStep) && { paddingBottom: theme.spacing.xl * 4 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentShell}>
              <View style={styles.headerSection}>
                <IconButton
                  icon="arrow-left"
                  onPress={handleBack}
                  accessibilityLabel="Go back"
                  style={styles.backButton}
                />
                <View style={styles.progressRow}>
                  {(['phone', 'otp', 'profile', 'password'] as Step[]).map((item, index) => (
                    <View
                      key={item}
                      style={[
                        styles.progressBar,
                        {
                          backgroundColor:
                            index <= ['phone', 'otp', 'profile', 'password'].indexOf(step)
                              ? palette.primary
                              : borderNeutral,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.heroTitle, { color: palette.text }]}>
                  {isPhoneStep ? 'Create your nest 🪺' : getStepTitle()}
                </Text>
                <Text style={[styles.heroSubtitle, { color: palette.textSecondary }]}>
                  {isPhoneStep
                    ? 'Add your phone number to begin building your secure GidiNest experience.'
                    : getStepSubtitle() || ''}
                </Text>
              </View>

              {step === 'phone' && renderPhoneStep()}
              {step === 'otp' && renderOtpStep()}
              {step === 'profile' && renderProfileStep()}
              {step === 'password' && renderPasswordStep()}

            </View>
          </ScrollView>

          {isPhoneStep && (
            <View
              style={[styles.bottomCTA, { borderTopColor: borderNeutral, backgroundColor: palette.background }]}
            >
              <Button
                mode="contained"
                onPress={handleSendCode}
                buttonColor={palette.primary}
                textColor="#FFFFFF"
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                loading={isSendingCode}
                disabled={!isPhoneNumberValid || isSendingCode}
              >
                Create your account
              </Button>
              <Text style={[styles.termsText, styles.footerTerms, { color: palette.textSecondary }]}>
                By continuing you agree to our <Text style={[styles.linkText, { color: palette.primary }]}>Privacy Policy</Text> and <Text style={[styles.linkText, { color: palette.primary }]}>Terms & Conditions</Text>.
              </Text>
              <Text style={[styles.secureNote, { color: palette.textSecondary }]}>This form is encrypted for your protection 🛡️</Text>
            </View>
          )}

          {isOtpStep && (
            <View
              style={[styles.bottomCTA, { borderTopColor: borderNeutral, backgroundColor: palette.background }]}
            >
              <Button
                mode="contained"
                onPress={handleVerifyCode}
                buttonColor={palette.primary}
                textColor="#FFFFFF"
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                loading={isVerifyingOtp}
                disabled={!isOtpValid || isVerifyingOtp}
              >
                Verify code
              </Button>
              <Text style={[styles.termsText, styles.footerTerms, { color: palette.textSecondary }]}>
                By continuing you agree to our <Text style={[styles.linkText, { color: palette.primary }]}>Privacy Policy</Text> and <Text style={[styles.linkText, { color: palette.primary }]}>Terms & Conditions</Text>.
              </Text>
              <Text style={[styles.secureNote, { color: palette.textSecondary }]}>We keep your code private and encrypted 🛡️</Text>
            </View>
          )}

          {isPasswordStep && (
            <View
              style={[styles.bottomCTA, { borderTopColor: borderNeutral, backgroundColor: palette.background }]}
            >
              <Button
                mode="contained"
                onPress={handleCreatePassword}
                buttonColor={palette.primary}
                textColor="#FFFFFF"
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                disabled={passwordInvalid || confirmInvalid}
              >
                Create account
              </Button>
              <Text style={[styles.termsText, styles.footerTerms, { color: palette.textSecondary }]}>
                By continuing you agree to our <Text style={[styles.linkText, { color: palette.primary }]}>Privacy Policy</Text> and <Text style={[styles.linkText, { color: palette.primary }]}>Terms & Conditions</Text>.
              </Text>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>

        {dobPickerVisible && (
          <View style={[styles.pickerOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>        
            <TouchableWithoutFeedback
              onPress={() => setDobPickerVisible(false)}
            >
              <View style={styles.pickerOverlayTouchable} />
            </TouchableWithoutFeedback>
            <View style={[styles.pickerModal, { backgroundColor: palette.card }]}>  
              <View style={styles.pickerHeader}>
                <Text style={[styles.pickerTitle, { color: palette.text }]}>Select your date of birth</Text>
                <IconButton icon="close" onPress={() => setDobPickerVisible(false)} />
              </View>
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                  value={pendingDob}
                  onChange={(_, selected) => {
                    if (selected) {
                      setPendingDob(selected);
                    }
                  }}
                  maximumDate={new Date()}
                />
                <Button
                  mode="contained"
                  onPress={handleConfirmDob}
                  buttonColor={palette.primary}
                  textColor="#FFFFFF"
                  style={styles.pickerConfirmButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  Set date
                </Button>
              </View>
            </View>
          </View>
        )}

        {statePickerOpen && (
          <View style={[styles.pickerOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <TouchableWithoutFeedback onPress={() => setStatePickerOpen(false)}>
              <View style={styles.pickerOverlayTouchable} />
            </TouchableWithoutFeedback>
            <View style={[styles.pickerModal, { backgroundColor: palette.card }]}>
              <View style={styles.pickerHeader}>
                <Text style={[styles.pickerTitle, { color: palette.text }]}>Select your state</Text>
                <IconButton icon="close" onPress={() => setStatePickerOpen(false)} />
              </View>
              <ScrollView style={styles.pickerScroll}>
                {NIGERIAN_STATES.map((state) => (
                  <Pressable
                    key={state}
                    style={[
                      styles.pickerOption,
                      {
                        backgroundColor: state === stateRegion ? palette.primary + '20' : 'transparent',
                        borderBottomColor: palette.border,
                      },
                    ]}
                    onPress={() => {
                      setStateRegion(state);
                      setStatePickerOpen(false);
                    }}
                  >
                    <Text style={[styles.pickerOptionText, { color: palette.text }]}>{state}</Text>
                    {state === stateRegion && (
                      <MaterialCommunityIcons name="check" size={20} color={palette.primary} />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
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
  scroll: {
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
  headerSection: {
    gap: theme.spacing.md,
    alignItems: 'stretch',
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
  progressRow: {
    flexDirection: 'row',
    width: '100%',
    gap: theme.spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 999,
  },
  formBlock: {
    width: '100%',
    gap: theme.spacing.xs * 0.75,
  },
  profileBlock: {
    gap: theme.spacing.sm,
  },
  fieldTitle: {
    fontFamily: 'NeuzeitGro-Medium',
    fontSize: 13,
    letterSpacing: 0.4,
    marginTop: theme.spacing.xs * 0.6,
  },
  fieldTitleTight: {
    fontFamily: 'NeuzeitGro-Medium',
    fontSize: 13,
    letterSpacing: 0.4,
    marginTop: theme.spacing.xs * 0.35,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    height: 56,
  },
  phoneStepCard: {
    width: '100%',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    gap: theme.spacing.sm,
  },
  otpBlock: {
    gap: theme.spacing.md,
  },
  otpStepCard: {
    width: '100%',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    gap: theme.spacing.sm,
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs / 2,
  },
  countryCodeText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 16,
  },
  phoneDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
  },
  phoneInput: {
    flex: 1,
    height: 56,
    fontFamily: 'NeuzeitGro-Medium',
    fontSize: 16,
  },
  countryPicker: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginTop: theme.spacing.xs,
  },
  countryOption: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  countryOptionText: {
    fontFamily: 'NeuzeitGro-Medium',
    fontSize: 14,
  },
  input: {
    marginBottom: theme.spacing.xs * 0.15,
    borderRadius: theme.borderRadius.lg,
  },
  inputTight: {
    borderRadius: theme.borderRadius.lg,
  },
  helperText: {
    marginBottom: theme.spacing.xs * 0.15,
  },
  inlineActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: theme.spacing.xs * 0.25,
  },
  otpActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs * 0.75,
  },
  helperRowText: {
    flex: 1,
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  otpInput: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 22,
    height: 64,
    justifyContent: 'center',
    textAlignVertical: 'center',
    paddingHorizontal: 0,
  },
  otpInputContent: {
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 22,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  selector: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    justifyContent: 'center',
    minHeight: 56,
  },
  selectorLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
    marginBottom: 4,
  },
  selectorValue: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 16,
  },
  button: {
    borderRadius: theme.borderRadius.lg,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5,
    marginTop: theme.spacing.sm,
  },
  buttonContent: {
    paddingVertical: theme.spacing.sm * 0.75,
  },
  buttonLabel: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 16,
  },
  linkText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 13,
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 0,
  },
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  pickerOverlayTouchable: {
    flex: 1,
  },
  pickerModal: {
    width: '100%',
    borderTopLeftRadius: theme.borderRadius.xl + 12,
    borderTopRightRadius: theme.borderRadius.xl + 12,
    paddingBottom: theme.spacing.lg,
    marginTop: theme.spacing.xl * 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 18,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  pickerTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 18,
  },
  pickerScroll: {
    paddingHorizontal: theme.spacing.lg,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerOptionText: {
    fontFamily: 'NeuzeitGro-Medium',
    fontSize: 16,
  },
  bottomCTA: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: -theme.spacing.sm,
  },
  secureNote: {
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  datePickerContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  pickerConfirmButton: {
    borderRadius: theme.borderRadius.lg,
  },
  footerTerms: {
    marginTop: theme.spacing.xs,
  },
});
