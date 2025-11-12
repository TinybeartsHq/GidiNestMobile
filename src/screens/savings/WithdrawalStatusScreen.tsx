import React from 'react';
import {
  View,
  StyleSheet,
  Text as RNText,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';

interface WithdrawalStatusParams {
  success: boolean;
  amount?: number;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  errorMessage?: string;
  reference?: string;
}

const formatCurrency = (value: number) => {
  return `₦${value.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export default function WithdrawalStatusScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const navigation = useNavigation();
  const route = useRoute();

  const params = (route.params as WithdrawalStatusParams) || { success: false };
  const { success, amount, accountName, accountNumber, bankName, errorMessage, reference } = params;

  const handleDone = () => {
    // Navigate back to savings/dashboard
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' as never }],
    });
  };

  const handleRetry = () => {
    navigation.goBack();
  };

  const handleViewTransactions = () => {
    navigation.reset({
      index: 0,
      routes: [
        { name: 'MainApp' as never },
        { name: 'Transactions' as never },
      ],
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Icon */}
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconWrapper,
                {
                  backgroundColor: success
                    ? isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)'
                    : isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)',
                },
              ]}
            >
              <MaterialCommunityIcons
                name={success ? 'check-circle' : 'close-circle'}
                size={64}
                color={success ? '#22C55E' : '#EF4444'}
              />
            </View>
          </View>

          {/* Status Message */}
          <View style={styles.messageContainer}>
            <RNText style={[styles.title, { color: palette.text }]}>
              {success ? 'Withdrawal Initiated!' : 'Withdrawal Failed'}
            </RNText>

            {success ? (
              <>
                <RNText style={[styles.subtitle, { color: palette.textSecondary }]}>
                  Your withdrawal request has been submitted successfully. Funds will be transferred shortly.
                </RNText>

                {amount && (
                  <RNText style={[styles.amount, { color: palette.text }]}>
                    {formatCurrency(amount)}
                  </RNText>
                )}
              </>
            ) : (
              <RNText style={[styles.subtitle, { color: palette.textSecondary }]}>
                {errorMessage || 'Failed to process withdrawal. Please try again.'}
              </RNText>
            )}
          </View>

          {/* Transaction Details */}
          {success && (accountName || bankName) && (
            <View
              style={[
                styles.detailsCard,
                {
                  backgroundColor: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)',
                },
              ]}
            >
              {reference && (
                <View style={styles.detailRow}>
                  <RNText style={[styles.detailLabel, { color: palette.textSecondary }]}>
                    Reference
                  </RNText>
                  <RNText style={[styles.detailValue, { color: palette.text }]}>
                    {reference}
                  </RNText>
                </View>
              )}
              {accountName && (
                <View style={styles.detailRow}>
                  <RNText style={[styles.detailLabel, { color: palette.textSecondary }]}>
                    Recipient
                  </RNText>
                  <RNText style={[styles.detailValue, { color: palette.text }]}>
                    {accountName}
                  </RNText>
                </View>
              )}
              {accountNumber && (
                <View style={styles.detailRow}>
                  <RNText style={[styles.detailLabel, { color: palette.textSecondary }]}>
                    Account
                  </RNText>
                  <RNText style={[styles.detailValue, { color: palette.text }]}>
                    {accountNumber}
                  </RNText>
                </View>
              )}
              {bankName && (
                <View style={styles.detailRow}>
                  <RNText style={[styles.detailLabel, { color: palette.textSecondary }]}>
                    Bank
                  </RNText>
                  <RNText style={[styles.detailValue, { color: palette.text }]}>
                    {bankName}
                  </RNText>
                </View>
              )}
            </View>
          )}

        </ScrollView>

        {/* Action Buttons - Fixed at bottom */}
        <View style={styles.buttonContainer}>
          {success ? (
            <>
              <Pressable
                style={[styles.primaryButton, { backgroundColor: palette.primary }]}
                onPress={handleDone}
              >
                <RNText style={styles.primaryButtonText}>Done</RNText>
              </Pressable>

              <Pressable
                style={[
                  styles.secondaryButton,
                  {
                    backgroundColor: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)',
                  },
                ]}
                onPress={handleViewTransactions}
              >
                <RNText style={[styles.secondaryButtonText, { color: palette.text }]}>
                  View Transactions
                </RNText>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                style={[styles.primaryButton, { backgroundColor: palette.primary }]}
                onPress={handleRetry}
              >
                <RNText style={styles.primaryButtonText}>Try Again</RNText>
              </Pressable>

              <Pressable
                style={[
                  styles.secondaryButton,
                  {
                    backgroundColor: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)',
                  },
                ]}
                onPress={handleDone}
              >
                <RNText style={[styles.secondaryButtonText, { color: palette.text }]}>
                  Go Home
                </RNText>
              </Pressable>
            </>
          )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: theme.spacing.xl,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: theme.spacing.md,
  },
  amount: {
    fontFamily: 'NeuzeitGro-ExtraBold',
    fontSize: 32,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  detailsCard: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  detailValue: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 13,
    textAlign: 'right',
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  buttonContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  primaryButton: {
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 16,
  },
});
