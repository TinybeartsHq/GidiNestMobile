import React, { useMemo, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  TextInput,
  Button,
  HelperText,
  Checkbox,
  Surface,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';

const EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
const PHONE_REGEX = /^\+?[0-9]{7,15}$/;

export default function SignUpScreen() {
  const navigation = useNavigation();
  const { palette } = useThemeMode();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => {
    return {
      firstName: !firstName.trim() ? 'First name is required.' : '',
      lastName: !lastName.trim() ? 'Last name is required.' : '',
      email: !EMAIL_REGEX.test(email.trim()) ? 'Enter a valid email address.' : '',
      phone: !PHONE_REGEX.test(phone.trim()) ? 'Enter a valid phone number.' : '',
      password:
        password.trim().length < 6 ? 'Password must be at least 6 characters.' : '',
      agree: !agree ? 'You must agree to continue.' : '',
    };
  }, [firstName, lastName, email, phone, password, agree]);

  const isValid = Object.values(errors).every((err) => err === '');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Surface style={[styles.card, { borderColor: palette.border }]} elevation={4}>
            <Text style={[styles.title, { color: palette.text }]}>Create your GidiNest account</Text>
            <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
              We&apos;ll help you and your family start saving towards what matters most.
            </Text>

            <TextInput
              label="First name"
              value={firstName}
              onChangeText={setFirstName}
              style={styles.input}
              mode="outlined"
              autoCapitalize="words"
              error={submitted && !!errors.firstName}
            />
            <HelperText type="error" visible={submitted && !!errors.firstName}>
              {errors.firstName}
            </HelperText>

            <TextInput
              label="Last name"
              value={lastName}
              onChangeText={setLastName}
              style={styles.input}
              mode="outlined"
              autoCapitalize="words"
              error={submitted && !!errors.lastName}
            />
            <HelperText type="error" visible={submitted && !!errors.lastName}>
              {errors.lastName}
            </HelperText>

            <TextInput
              label="Email address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              error={submitted && !!errors.email}
            />
            <HelperText type="error" visible={submitted && !!errors.email}>
              {errors.email}
            </HelperText>

            <TextInput
              label="Phone number"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
              autoCapitalize="none"
              error={submitted && !!errors.phone}
            />
            <HelperText type="error" visible={submitted && !!errors.phone}>
              {errors.phone}
            </HelperText>

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              mode="outlined"
              secureTextEntry
              autoCapitalize="none"
              error={submitted && !!errors.password}
            />
            <HelperText type="error" visible={submitted && !!errors.password}>
              {errors.password}
            </HelperText>

            <View style={styles.checkboxRow}>
              <Checkbox status={agree ? 'checked' : 'unchecked'} onPress={() => setAgree((prev) => !prev)} />
              <Text style={[styles.checkboxLabel, { color: palette.textSecondary }]}>
                I agree to the Terms & Conditions
              </Text>
            </View>
            <HelperText type="error" visible={submitted && !!errors.agree}>
              {errors.agree}
            </HelperText>

            <Button
              mode="contained"
              onPress={() => {
                setSubmitted(true);
                if (isValid) {
                  Alert.alert('Account created', 'Your account setup is complete.');
                  // @ts-ignore - navigation typing to be refined
                  navigation.navigate('SignIn');
                }
              }}
              style={styles.primaryButton}
              contentStyle={styles.buttonContent}
            >
              Create account
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              style={styles.secondaryButton}
              textColor={palette.primary}
            >
              Back to sign in
            </Button>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 460,
    borderRadius: theme.borderRadius.xl + 4,
    borderWidth: 1,
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  title: {
    fontFamily: 'NeuzeitGro-ExtraBold',
    fontSize: 24,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
    marginBottom: theme.spacing.md,
  },
  input: {
    borderRadius: theme.borderRadius.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  checkboxLabel: {
    fontFamily: 'NeuzeitGro-Medium',
    fontSize: 13,
  },
  primaryButton: {
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  buttonContent: {
    paddingVertical: theme.spacing.md,
  },
  secondaryButton: {
    marginTop: theme.spacing.sm,
  },
});



