import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text as RNText, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import { useRoute } from '@react-navigation/native';

export default function GiftLinkScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const route = useRoute();
  const linkId = (route.params as any)?.linkId ?? '';

  const [fromName, setFromName] = useState('');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('');

  const cardBackground = isDark ? 'rgba(17,24,39,0.72)' : palette.card;
  const featureTint = isDark ? 'rgba(148,163,184,0.12)' : 'rgba(100,116,139,0.08)';
  const separator = isDark ? 'rgba(148,163,184,0.16)' : 'rgba(148,163,184,0.18)';

  const handleConfirm = () => {
    if (!amount || Number(amount) <= 0) {
      Alert.alert('Missing amount', 'Please enter the amount you intend to gift.');
      return;
    }
    Alert.alert('Gift sent', 'Thanks for your gift! The recipient will be notified shortly.');
    setFromName('');
    setMessage('');
    setAmount('');
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={{ gap: theme.spacing.xs / 2 }}>
              <RNText style={[styles.heading, { color: palette.text }]}>Send a gift</RNText>
              <View style={[styles.headingAccent, { backgroundColor: palette.primary }]} />
            </View>
            <View style={[styles.headerIcon, { backgroundColor: featureTint }]}>
              <MaterialCommunityIcons name="gift" size={18} color={palette.primary} />
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: cardBackground, borderColor: separator }]}>
            <RNText style={[styles.cardTitle, { color: palette.text }]}>Registry details</RNText>
            <RNText style={[styles.cardCopy, { color: palette.textSecondary }]}>
              You are gifting via link {linkId || '—'}. Please use the account details below to transfer
              and then confirm by tapping “Send gift”.
            </RNText>
            <View style={[styles.accountBox, { backgroundColor: featureTint }]}>
              <RNText style={[styles.accountLine, { color: palette.text }]}>Account Name: GidiNest Wallet</RNText>
              <RNText style={[styles.accountLine, { color: palette.text }]}>Account Number: 0001234567</RNText>
              <RNText style={[styles.accountLine, { color: palette.text }]}>Bank: GidiNest Partner Bank</RNText>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: cardBackground, borderColor: separator }]}>
            <RNText style={[styles.cardTitle, { color: palette.text }]}>Your message</RNText>
            <TextInput
              mode="outlined"
              label="Your name (optional)"
              value={fromName}
              onChangeText={setFromName}
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Message (optional)"
              value={message}
              onChangeText={setMessage}
              style={styles.input}
              multiline
            />
            <TextInput
              mode="outlined"
              label="Transfer amount (₦)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={styles.input}
            />
            <Button mode="contained" onPress={handleConfirm} buttonColor={palette.primary} textColor="#FFFFFF">
              Send gift
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { padding: theme.spacing.lg, gap: theme.spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: { fontFamily: 'NeuzeitGro-ExtraBold', fontSize: 24, letterSpacing: -0.4 },
  headingAccent: { height: 2, width: 36, borderRadius: 1, marginTop: theme.spacing.xs / 2 },
  headerIcon: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  card: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  cardTitle: { fontFamily: 'NeuzeitGro-SemiBold', fontSize: 16 },
  cardCopy: { fontFamily: 'NeuzeitGro-Regular', fontSize: 13, lineHeight: 19 },
  accountBox: { borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, gap: theme.spacing.xs },
  accountLine: { fontFamily: 'NeuzeitGro-Medium', fontSize: 13 },
  input: { marginTop: theme.spacing.sm, marginBottom: theme.spacing.md },
});


