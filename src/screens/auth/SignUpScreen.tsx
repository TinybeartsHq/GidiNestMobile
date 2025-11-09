import React, { useMemo, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, HelperText, Checkbox, Surface } from 'react-native-paper';
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
      email: email.trim() && EMAIL_REGEX.test(email.trim()) ? '' : 'Enter a valid email address.',
      phone: phone.trim() && PHONE_REGEX.test(phone.trim()) ? '' : 'Enter a valid phone number.',
      password: password.trim().length >= 6 ? '' : 'Password must be at least 6 characters.',
      agree: agree ? '' : 'You must agree to continue.',
    };
  }, [firstName, lastName, email, phone, password, agree]);

  const isValid = Object.values(errors).every((err) => err === '');

  const handleSubmit = () => {
    setSubmitted(true);
    if (!isValid) {
      return;
    }

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
              <Checkbox
                status={agree ? 'checked' : 'unchecked'}
                onPress={() => setAgree((prev) => !prev)}
              />
              <Text style={[styles.checkboxLabel, { color: palette.textSecondary }]}>
                I agree to the Terms & Conditions and Privacy Policy.
              </Text>
            </View>
            <HelperText type="error" visible={submitted && !!errors.agree}>
              {errors.agree}
            </HelperText>

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              contentStyle={styles.buttonContent}
              buttonColor={palette.primary}
              textColor="#FFFFFF"
            >
              Create account
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('SignIn' as never)}
              textColor={palette.primary}
            >
              Already have an account? Sign in
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
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  card: {
    borderRadius: theme.borderRadius.xl + 4,
    padding: theme.spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    gap: theme.spacing.sm,
  },
  title: {
    fontFamily: 'NeuzeitGro-ExtraBold',
    fontSize: 24,
  },
  subtitle: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    marginTop: theme.spacing.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  checkboxLabel: {
    flex: 1,
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  button: {
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  buttonContent: {
    paddingVertical: theme.spacing.md,
  },
});

