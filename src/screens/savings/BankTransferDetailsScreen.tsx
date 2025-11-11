import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text as RNText,
  Platform,
  Alert,
  Clipboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';

export default function BankTransferDetailsScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';

  const bankDetails = {
    bankName: 'Wema Bank',
    accountNumber: '0123456789',
    accountName: 'GidiNest - Your Name',
  };

  const handleCopy = (text: string, fieldName: string) => {
    Clipboard.setString(text);
    setCopiedField(fieldName);

    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleComplete = () => {
    Alert.alert(
      'Transfer Confirmation',
      'Have you completed the bank transfer?',
      [
        {
          text: 'Not yet',
          style: 'cancel',
        },
        {
          text: 'Yes, I have',
          onPress: () => {
            // Navigate back to savings screen
            navigation.navigate('MainApp' as never);
            Alert.alert(
              'Transfer Noted',
              'Your transfer is being processed. Your wallet will be updated within 5-10 minutes.',
              [{ text: 'OK' }]
            );
          },
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
            style={[styles.backButton, { backgroundColor: featureTint }]}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color={palette.text} />
          </Pressable>
          <View style={styles.headerLeading}>
            <RNText style={[styles.headerTitle, { color: palette.text }]}>
              Bank Transfer
            </RNText>
            <View style={[styles.headerAccent, { backgroundColor: palette.primary }]} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + (Platform.OS === 'ios' ? 120 : 108) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Instructions Card */}
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)',
                borderColor: isDark ? 'rgba(147,197,253,0.2)' : 'rgba(59,130,246,0.15)',
              },
            ]}
          >
            <View style={[styles.infoIcon, { backgroundColor: palette.primary + '1F' }]}>
              <MaterialCommunityIcons name="information" size={20} color={palette.primary} />
            </View>
            <View style={styles.infoContent}>
              <RNText style={[styles.infoTitle, { color: palette.text }]}>
                How to fund your wallet
              </RNText>
              <RNText style={[styles.infoText, { color: palette.textSecondary }]}>
                Transfer any amount to the account below from your bank app
              </RNText>
            </View>
          </View>

          {/* Bank Details Card */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Transfer to this account
            </RNText>
            <View
              style={[
                styles.detailsCard,
                {
                  backgroundColor: cardBackground,
                  borderColor: separatorColor,
                },
              ]}
            >
              {/* Bank Name */}
              <View style={styles.detailRow}>
                <View style={[styles.detailIcon, { backgroundColor: featureTint }]}>
                  <MaterialCommunityIcons
                    name="bank"
                    size={20}
                    color={palette.primary}
                  />
                </View>
                <View style={styles.detailContent}>
                  <RNText style={[styles.detailLabel, { color: palette.textSecondary }]}>
                    Bank Name
                  </RNText>
                  <RNText style={[styles.detailValue, { color: palette.text }]}>
                    {bankDetails.bankName}
                  </RNText>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: separatorColor }]} />

              {/* Account Number */}
              <View style={styles.detailRow}>
                <View style={[styles.detailIcon, { backgroundColor: featureTint }]}>
                  <MaterialCommunityIcons
                    name="numeric"
                    size={20}
                    color={palette.primary}
                  />
                </View>
                <View style={styles.detailContent}>
                  <RNText style={[styles.detailLabel, { color: palette.textSecondary }]}>
                    Account Number
                  </RNText>
                  <RNText style={[styles.detailValue, { color: palette.text }]}>
                    {bankDetails.accountNumber}
                  </RNText>
                </View>
                <Pressable
                  style={[styles.copyButton, { backgroundColor: featureTint }]}
                  onPress={() => handleCopy(bankDetails.accountNumber, 'accountNumber')}
                >
                  <MaterialCommunityIcons
                    name={copiedField === 'accountNumber' ? 'check' : 'content-copy'}
                    size={18}
                    color={copiedField === 'accountNumber' ? palette.primary : palette.text}
                  />
                  <RNText
                    style={[
                      styles.copyButtonText,
                      { color: copiedField === 'accountNumber' ? palette.primary : palette.text },
                    ]}
                  >
                    {copiedField === 'accountNumber' ? 'Copied' : 'Copy'}
                  </RNText>
                </Pressable>
              </View>

              <View style={[styles.divider, { backgroundColor: separatorColor }]} />

              {/* Account Name */}
              <View style={styles.detailRow}>
                <View style={[styles.detailIcon, { backgroundColor: featureTint }]}>
                  <MaterialCommunityIcons
                    name="account"
                    size={20}
                    color={palette.primary}
                  />
                </View>
                <View style={styles.detailContent}>
                  <RNText style={[styles.detailLabel, { color: palette.textSecondary }]}>
                    Account Name
                  </RNText>
                  <RNText style={[styles.detailValue, { color: palette.text }]}>
                    {bankDetails.accountName}
                  </RNText>
                </View>
                <Pressable
                  style={[styles.copyButton, { backgroundColor: featureTint }]}
                  onPress={() => handleCopy(bankDetails.accountName, 'accountName')}
                >
                  <MaterialCommunityIcons
                    name={copiedField === 'accountName' ? 'check' : 'content-copy'}
                    size={18}
                    color={copiedField === 'accountName' ? palette.primary : palette.text}
                  />
                  <RNText
                    style={[
                      styles.copyButtonText,
                      { color: copiedField === 'accountName' ? palette.primary : palette.text },
                    ]}
                  >
                    {copiedField === 'accountName' ? 'Copied' : 'Copy'}
                  </RNText>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Important Notes */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Important Information
            </RNText>
            <View style={styles.notesContainer}>
              <View style={styles.noteItem}>
                <View style={[styles.noteIcon, { backgroundColor: palette.primary + '1F' }]}>
                  <MaterialCommunityIcons
                    name="clock-fast"
                    size={18}
                    color={palette.primary}
                  />
                </View>
                <View style={styles.noteContent}>
                  <RNText style={[styles.noteTitle, { color: palette.text }]}>
                    Instant Credit
                  </RNText>
                  <RNText style={[styles.noteText, { color: palette.textSecondary }]}>
                    Your wallet will be credited automatically within 5-10 minutes
                  </RNText>
                </View>
              </View>

              <View style={styles.noteItem}>
                <View style={[styles.noteIcon, { backgroundColor: palette.primary + '1F' }]}>
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={18}
                    color={palette.primary}
                  />
                </View>
                <View style={styles.noteContent}>
                  <RNText style={[styles.noteTitle, { color: palette.text }]}>
                    Secure Transfer
                  </RNText>
                  <RNText style={[styles.noteText, { color: palette.textSecondary }]}>
                    This is your unique account. Only you can transfer to it
                  </RNText>
                </View>
              </View>

              <View style={styles.noteItem}>
                <View style={[styles.noteIcon, { backgroundColor: palette.primary + '1F' }]}>
                  <MaterialCommunityIcons
                    name="cash-multiple"
                    size={18}
                    color={palette.primary}
                  />
                </View>
                <View style={styles.noteContent}>
                  <RNText style={[styles.noteTitle, { color: palette.text }]}>
                    Any Amount
                  </RNText>
                  <RNText style={[styles.noteText, { color: palette.textSecondary }]}>
                    Transfer any amount from ₦100 and above
                  </RNText>
                </View>
              </View>

              <View style={styles.noteItem}>
                <View style={[styles.noteIcon, { backgroundColor: palette.primary + '1F' }]}>
                  <MaterialCommunityIcons
                    name="bell-ring"
                    size={18}
                    color={palette.primary}
                  />
                </View>
                <View style={styles.noteContent}>
                  <RNText style={[styles.noteTitle, { color: palette.text }]}>
                    Get Notified
                  </RNText>
                  <RNText style={[styles.noteText, { color: palette.textSecondary }]}>
                    You'll receive a notification once your wallet is credited
                  </RNText>
                </View>
              </View>
            </View>
          </View>

          {/* Complete Button */}
          <Pressable
            style={({ pressed }) => [
              styles.completeButton,
              {
                backgroundColor: palette.primary,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
            onPress={handleComplete}
          >
            <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" />
            <RNText style={styles.completeButtonText}>
              I've completed the transfer
            </RNText>
          </Pressable>
        </ScrollView>
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
  backButton: {
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
  infoCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  infoTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
  },
  infoText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  detailsCard: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  detailLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
  },
  detailValue: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 16,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  copyButtonText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: theme.spacing.lg + 40 + theme.spacing.md,
  },
  notesContainer: {
    gap: theme.spacing.md,
  },
  noteItem: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  noteIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteContent: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  noteTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
  noteText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  completeButton: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  completeButtonText: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
