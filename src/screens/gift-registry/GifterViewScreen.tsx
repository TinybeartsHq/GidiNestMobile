import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text as RNText,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import type { CommunityStackParamList } from '../../navigation/CommunityNavigator';

const formatCurrency = (value: number) => {
  return `₦${value.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

type GifterViewNavigationProp = NativeStackNavigationProp<CommunityStackParamList, 'GifterView'>;

export default function GifterViewScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<GifterViewNavigationProp>();

  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [yourName, setYourName] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';

  // Mock registry data
  const registry = useMemo(
    () => ({
      title: 'Baby Shower - December 2024',
      parentNames: 'Chinedu & Amara',
      message: 'Help us prepare for our bundle of joy!',
      totalReceived: 125000,
      contributors: 12,
      expiresAt: 'Dec 25, 2024',
    }),
    []
  );

  // Mock account details
  const accountDetails = useMemo(
    () => ({
      bankName: 'Guaranty Trust Bank (GTBank)',
      accountNumber: '0123456789',
      accountName: 'CHINEDU OKONKWO',
    }),
    []
  );

  const suggestedAmounts = [5000, 10000, 20000, 50000];

  const bottomContentPadding = useMemo(
    () => insets.bottom + (Platform.OS === 'ios' ? 90 : 80),
    [insets.bottom]
  );

  const canSendGift = yourName.trim().length > 0 && parseFloat(amount) > 0 && paymentConfirmed;

  const handleSendGift = () => {
    if (!canSendGift) return;

    // In a real app, this would call an API to record the gift contribution
    Alert.alert(
      'Gift Sent!',
      `Thank you ${yourName}! Your gift of ${formatCurrency(parseFloat(amount))} has been recorded. The parents will be notified.`,
      [
        {
          text: 'Done',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={[styles.closeButton, { backgroundColor: featureTint }]}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="close" size={20} color={palette.text} />
          </Pressable>
          <View style={styles.headerLeading}>
            <RNText style={[styles.headerTitle, { color: palette.text }]}>
              Gift Registry
            </RNText>
            <View style={[styles.headerAccent, { backgroundColor: '#EC4899' }]} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomContentPadding }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Registry Info Card */}
          <View
            style={[
              styles.registryCard,
              {
                backgroundColor: isDark ? 'rgba(236,72,153,0.1)' : 'rgba(236,72,153,0.06)',
                borderColor: isDark ? 'rgba(244,114,182,0.3)' : 'rgba(236,72,153,0.2)',
              },
            ]}
          >
            <View style={[styles.registryIcon, { backgroundColor: '#EC4899' }]}>
              <MaterialCommunityIcons name="gift" size={32} color="#FFFFFF" />
            </View>
            <RNText style={[styles.registryTitle, { color: palette.text }]}>
              {registry.title}
            </RNText>
            <RNText style={[styles.registryParents, { color: '#EC4899' }]}>
              {registry.parentNames}
            </RNText>
            <RNText style={[styles.registryMessage, { color: palette.textSecondary }]}>
              {registry.message}
            </RNText>

            <View style={[styles.registryStats, { borderTopColor: separatorColor }]}>
              <View style={styles.registryStat}>
                <RNText style={[styles.registryStatValue, { color: '#EC4899' }]}>
                  {formatCurrency(registry.totalReceived)}
                </RNText>
                <RNText style={[styles.registryStatLabel, { color: palette.textSecondary }]}>
                  Total received
                </RNText>
              </View>
              <View style={styles.registryStat}>
                <RNText style={[styles.registryStatValue, { color: '#EC4899' }]}>
                  {registry.contributors}
                </RNText>
                <RNText style={[styles.registryStatLabel, { color: palette.textSecondary }]}>
                  Contributors
                </RNText>
              </View>
            </View>
          </View>

          {/* Your Details */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Your details
            </RNText>

            <View style={styles.inputGroup}>
              <RNText style={[styles.inputLabel, { color: palette.text }]}>
                Your name
              </RNText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: featureTint,
                    borderColor: separatorColor,
                    color: palette.text,
                  },
                ]}
                placeholder="Enter your name"
                placeholderTextColor={palette.textSecondary}
                value={yourName}
                onChangeText={setYourName}
              />
            </View>

            <View style={styles.inputGroup}>
              <RNText style={[styles.inputLabel, { color: palette.text }]}>
                Gift amount
              </RNText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: featureTint,
                    borderColor: separatorColor,
                    color: palette.text,
                  },
                ]}
                placeholder="₦0"
                placeholderTextColor={palette.textSecondary}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <View style={styles.suggestedAmounts}>
                {suggestedAmounts.map((suggested) => (
                  <Pressable
                    key={suggested}
                    style={[
                      styles.suggestedChip,
                      {
                        backgroundColor: featureTint,
                        borderColor: separatorColor,
                      },
                    ]}
                    onPress={() => setAmount(suggested.toString())}
                  >
                    <RNText style={[styles.suggestedText, { color: palette.text }]}>
                      {formatCurrency(suggested)}
                    </RNText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <RNText style={[styles.inputLabel, { color: palette.text }]}>
                Leave a message (optional)
              </RNText>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: featureTint,
                    borderColor: separatorColor,
                    color: palette.text,
                  },
                ]}
                placeholder="Write a heartfelt message..."
                placeholderTextColor={palette.textSecondary}
                multiline
                numberOfLines={4}
                value={message}
                onChangeText={setMessage}
              />
            </View>
          </View>

          {/* Account Details */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Payment details
            </RNText>
            <View
              style={[
                styles.accountCard,
                {
                  backgroundColor: cardBackground,
                  borderColor: separatorColor,
                },
              ]}
            >
              <View style={styles.accountRow}>
                <RNText style={[styles.accountLabel, { color: palette.textSecondary }]}>
                  Bank Name
                </RNText>
                <View style={styles.accountValueRow}>
                  <RNText style={[styles.accountValue, { color: palette.text }]}>
                    {accountDetails.bankName}
                  </RNText>
                  <Pressable onPress={() => {}}>
                    <MaterialCommunityIcons name="content-copy" size={18} color={palette.primary} />
                  </Pressable>
                </View>
              </View>

              <View style={[styles.accountDivider, { backgroundColor: separatorColor }]} />

              <View style={styles.accountRow}>
                <RNText style={[styles.accountLabel, { color: palette.textSecondary }]}>
                  Account Number
                </RNText>
                <View style={styles.accountValueRow}>
                  <RNText style={[styles.accountValue, { color: palette.text }]}>
                    {accountDetails.accountNumber}
                  </RNText>
                  <Pressable onPress={() => {}}>
                    <MaterialCommunityIcons name="content-copy" size={18} color={palette.primary} />
                  </Pressable>
                </View>
              </View>

              <View style={[styles.accountDivider, { backgroundColor: separatorColor }]} />

              <View style={styles.accountRow}>
                <RNText style={[styles.accountLabel, { color: palette.textSecondary }]}>
                  Account Name
                </RNText>
                <RNText style={[styles.accountValue, { color: palette.text }]}>
                  {accountDetails.accountName}
                </RNText>
              </View>
            </View>

            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(37,99,235,0.06)',
                  borderColor: isDark ? 'rgba(147,197,253,0.3)' : 'rgba(37,99,235,0.2)',
                },
              ]}
            >
              <MaterialCommunityIcons name="information" size={18} color="#2563EB" />
              <RNText style={[styles.infoText, { color: palette.textSecondary }]}>
                Transfer the amount to the account above, then confirm payment below
              </RNText>
            </View>
          </View>

          {/* Confirm Payment */}
          <View style={styles.section}>
            <Pressable
              style={styles.checkboxRow}
              onPress={() => setPaymentConfirmed(!paymentConfirmed)}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: paymentConfirmed ? '#EC4899' : 'transparent',
                    borderColor: paymentConfirmed ? '#EC4899' : separatorColor,
                  },
                ]}
              >
                {paymentConfirmed && (
                  <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                )}
              </View>
              <RNText style={[styles.checkboxLabel, { color: palette.text }]}>
                I have completed the payment transfer
              </RNText>
            </Pressable>
          </View>
        </ScrollView>

        {/* Send Gift Button */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: palette.background,
              borderTopColor: separatorColor,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          <Pressable
            style={[
              styles.sendButton,
              {
                backgroundColor: canSendGift ? '#EC4899' : separatorColor,
              },
            ]}
            disabled={!canSendGift}
            onPress={handleSendGift}
          >
            <MaterialCommunityIcons
              name="gift"
              size={20}
              color={canSendGift ? '#FFFFFF' : palette.textSecondary}
            />
            <RNText
              style={[
                styles.sendButtonText,
                { color: canSendGift ? '#FFFFFF' : palette.textSecondary },
              ]}
            >
              Send Gift
            </RNText>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLeading: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  headerTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  headerAccent: {
    height: 2,
    width: 28,
    borderRadius: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  registryCard: {
    borderRadius: theme.borderRadius.xl + 2,
    borderWidth: 1,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  registryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  registryTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 20,
    textAlign: 'center',
  },
  registryParents: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
  },
  registryMessage: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  registryStats: {
    flexDirection: 'row',
    gap: theme.spacing.xl * 2,
    paddingTop: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    width: '100%',
    justifyContent: 'center',
  },
  registryStat: {
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  registryStatValue: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  registryStatLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 11,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  inputGroup: {
    gap: theme.spacing.xs,
  },
  inputLabel: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
  input: {
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 15,
  },
  textArea: {
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  suggestedAmounts: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
    marginTop: theme.spacing.xs / 2,
  },
  suggestedChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
  },
  suggestedText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 12,
  },
  accountCard: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  accountRow: {
    gap: theme.spacing.xs / 2,
  },
  accountLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
  },
  accountValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountValue: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 15,
    flex: 1,
  },
  accountDivider: {
    height: StyleSheet.hairlineWidth,
  },
  infoCard: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    flex: 1,
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md + 2,
    borderRadius: theme.borderRadius.xl,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sendButtonText: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
  },
});
