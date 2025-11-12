import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text as RNText,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import { useWallet } from '../../hooks/useWallet';
import { useAuthV2 } from '../../hooks/useAuthV2';
import RestrictionBanner from '../../components/RestrictionBanner';
import { Button } from 'react-native-paper';

const formatCurrency = (value: number) => {
  return `₦${value.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

interface BankSelectorModalProps {
  visible: boolean;
  banks: Array<{ bankCode: string; bankName: string }>;
  onSelect: (bank: { bankCode: string; bankName: string }) => void;
  onClose: () => void;
  palette: any;
  isDark: boolean;
}

const BankSelectorModal: React.FC<BankSelectorModalProps> = ({
  visible,
  banks,
  onSelect,
  onClose,
  palette,
  isDark,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBanks = useMemo(() => {
    if (!searchQuery.trim()) return banks;
    return banks.filter((bank) =>
      bank?.bankName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [banks, searchQuery]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: palette.background }]}>
        <View style={styles.modalHeader}>
          <RNText style={[styles.modalTitle, { color: palette.text }]}>Select Bank</RNText>
          <Pressable onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color={palette.text} />
          </Pressable>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: isDark ? palette.card : '#F8FAFC' }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={palette.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: palette.text }]}
            placeholder="Search banks..."
            placeholderTextColor={palette.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView style={styles.bankList}>
          {filteredBanks.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <RNText style={{ color: palette.textSecondary }}>
                {searchQuery ? 'No banks found' : 'Loading banks...'}
              </RNText>
            </View>
          ) : (
            filteredBanks.map((bank) => (
              <Pressable
                key={bank.bankCode}
                style={({ pressed }) => [
                  styles.bankItem,
                  {
                    backgroundColor: pressed
                      ? (isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)')
                      : 'transparent',
                  },
                ]}
                onPress={() => {
                  onSelect(bank);
                  onClose();
                  setSearchQuery('');
                }}
              >
                <RNText style={[styles.bankName, { color: palette.text }]}>{bank.bankName}</RNText>
              </Pressable>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default function WithdrawScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isRestricted } = useAuthV2();
  const {
    wallet,
    banks,
    loading,
    getBankList,
    resolveAccount,
    resolvedAccount,
    resolvingAccount,
    clearResolved,
    withdraw,
    withdrawalLoading,
    withdrawalError,
    getWalletBalance,
    transactionPinSet,
  } = useWallet();

  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState<{ bankCode: string; bankName: string } | null>(
    null
  );
  const [showBankSelector, setShowBankSelector] = useState(false);
  const [narration, setNarration] = useState('');
  const [manualAccountName, setManualAccountName] = useState('');

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';

  useEffect(() => {
    getBankList();
    getWalletBalance();
  }, []);

  useEffect(() => {
    // Auto-resolve account when account number is 10 digits
    if (accountNumber.length === 10 && selectedBank) {
      handleResolveAccount();
    } else {
      clearResolved();
    }
  }, [accountNumber, selectedBank]);

  const handleResolveAccount = async () => {
    if (!selectedBank || accountNumber.length !== 10) return;

    try {
      await resolveAccount({
        account_number: accountNumber,
        bank_code: selectedBank.bankCode,
      });
    } catch (error) {
      // Error handled in redux
    }
  };

  const handleWithdraw = () => {
    // Check if transaction PIN is set
    if (!transactionPinSet) {
      Alert.alert(
        'Transaction PIN Required',
        'You need to set up your transaction PIN before making withdrawals. Please go to Settings > Security to set your PIN.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Go to Settings',
            onPress: () => {
              // @ts-ignore
              navigation.navigate('Settings');
            },
          },
        ]
      );
      return;
    }

    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount');
      return;
    }

    if (!selectedBank) {
      Alert.alert('Select Bank', 'Please select your bank');
      return;
    }

    if (accountNumber.length !== 10) {
      Alert.alert('Invalid Account', 'Please enter a valid 10-digit account number');
      return;
    }

    const withdrawalAmount = parseFloat(amount);

    // Check wallet balance
    if (wallet && withdrawalAmount > wallet.balance) {
      Alert.alert('Insufficient Balance', 'You do not have enough funds for this withdrawal');
      return;
    }

    // Check restriction
    if (isRestricted && withdrawalAmount > 10000) {
      Alert.alert(
        'Withdrawal Restricted',
        'Your account is restricted to ₦10,000 withdrawals for 24 hours due to recent security changes.'
      );
      return;
    }

    // Check if account verification is unavailable
    const isUnverified = resolvedAccount?.verified === false || !resolvedAccount?.account_name;
    const accountNameToUse = resolvedAccount?.account_name || manualAccountName;

    if (!accountNameToUse) {
      Alert.alert('Account Name Required', 'Please enter the account holder name');
      return;
    }

    if (isUnverified) {
      // Show warning for unverified accounts
      Alert.alert(
        '⚠️ Account Verification Unavailable',
        `We cannot verify the account holder's name at this time. Please double-check before proceeding.\n\nAccount: ${accountNumber}\nBank: ${selectedBank.bankName}\nName: ${accountNameToUse}`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: "I've Verified - Continue",
            style: 'destructive',
            onPress: () => navigateToPinScreen(),
          },
        ]
      );
    } else {
      // Normal flow - navigate directly to PIN screen
      navigateToPinScreen();
    }
  };

  const navigateToPinScreen = () => {
    const accountNameToUse = resolvedAccount?.account_name || manualAccountName;
    const withdrawalAmount = parseFloat(amount);

    // @ts-ignore
    navigation.navigate('PINAuth', {
      amount: withdrawalAmount,
      category: 'withdrawal',
      withdrawalDetails: {
        accountName: accountNameToUse,
        accountNumber,
        bankName: selectedBank?.bankName,
        amount: withdrawalAmount,
        isVerified: resolvedAccount?.verified !== false && !!resolvedAccount?.account_name,
      },
      onSuccess: (pin: string) => {
        processWithdrawal(pin);
      },
      onCancel: () => {
        navigation.goBack();
      },
    });
  };

  const processWithdrawal = async (pin: string) => {
    if (!selectedBank) return;

    // Use resolved account name or manual entry
    const accountName = resolvedAccount?.account_name || manualAccountName;
    if (!accountName) return;

    try {
      const withdrawalAmount = parseFloat(amount);
      const withdrawalBankName = selectedBank.bankName;
      const withdrawalAccountNumber = accountNumber;

      const response = await withdraw({
        bank_name: selectedBank.bankName,
        bank_code: selectedBank.bankCode,
        account_number: accountNumber,
        account_name: accountName,
        amount: withdrawalAmount,
        transaction_pin: pin,
      }).unwrap();

      // Navigate to success screen
      // @ts-ignore
      navigation.navigate('WithdrawalStatus', {
        success: true,
        amount: withdrawalAmount,
        accountName,
        accountNumber: withdrawalAccountNumber,
        bankName: withdrawalBankName,
        reference: response?.withdrawal_request?.reference || response?.reference,
      });

      // Reset form after navigation
      setAmount('');
      setAccountNumber('');
      setSelectedBank(null);
      setNarration('');
      clearResolved();
    } catch (error: any) {
      // Extract detailed error message from API response
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        withdrawalError ||
        'Failed to process withdrawal. Please try again.';

      console.error('Withdrawal error details:', {
        detail: error?.response?.data?.detail,
        message: error?.response?.data?.message,
        status: error?.response?.status,
        fullResponse: error?.response?.data,
      });

      // Check if it's an invalid PIN error
      const isInvalidPin = errorMessage.toLowerCase().includes('invalid') &&
                          errorMessage.toLowerCase().includes('pin');

      if (isInvalidPin) {
        // For invalid PIN, show alert with retry option
        Alert.alert(
          'Invalid PIN',
          'The transaction PIN you entered is incorrect. Please try again.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                // @ts-ignore
                navigation.navigate('WithdrawalStatus', {
                  success: false,
                  errorMessage: 'Invalid transaction PIN',
                });
              },
            },
            {
              text: 'Try Again',
              onPress: () => {
                // Re-open PIN screen
                navigateToPinScreen();
              },
            },
          ]
        );
      } else {
        // For other errors, navigate to failure screen
        // @ts-ignore
        navigation.navigate('WithdrawalStatus', {
          success: false,
          errorMessage,
        });
      }
    }
  };

  const isFormValid = useMemo(() => {
    const hasAccountName = resolvedAccount?.account_name || manualAccountName.trim();
    return (
      amount &&
      parseFloat(amount) > 0 &&
      selectedBank &&
      accountNumber.length === 10 &&
      hasAccountName &&
      !resolvingAccount
    );
  }, [amount, selectedBank, accountNumber, resolvedAccount, manualAccountName, resolvingAccount]);

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
            <RNText style={[styles.headerTitle, { color: palette.text }]}>Withdraw Money</RNText>
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
          {/* Restriction Banner */}
          {isRestricted && <RestrictionBanner style={{ marginBottom: theme.spacing.md }} />}

          {/* Wallet Balance Card */}
          {wallet && (
            <View
              style={[
                styles.balanceCard,
                {
                  backgroundColor: cardBackground,
                  borderColor: separatorColor,
                },
              ]}
            >
              <RNText style={[styles.balanceLabel, { color: palette.textSecondary }]}>
                Available Balance
              </RNText>
              <RNText style={[styles.balanceValue, { color: palette.text }]}>
                {formatCurrency(wallet.balance)}
              </RNText>
            </View>
          )}

          {/* Amount Input */}
          <View style={styles.section}>
            <RNText style={[styles.label, { color: palette.text }]}>Amount to Withdraw</RNText>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: cardBackground, borderColor: separatorColor },
              ]}
            >
              <RNText style={[styles.currencySymbol, { color: palette.textSecondary }]}>₦</RNText>
              <TextInput
                style={[styles.input, { color: palette.text }]}
                placeholder="0.00"
                placeholderTextColor={palette.textSecondary}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          {/* Bank Selection */}
          <View style={styles.section}>
            <RNText style={[styles.label, { color: palette.text }]}>Select Bank</RNText>
            <Pressable
              style={[
                styles.selector,
                { backgroundColor: cardBackground, borderColor: separatorColor },
              ]}
              onPress={() => setShowBankSelector(true)}
            >
              <RNText style={[styles.selectorText, { color: selectedBank ? palette.text : palette.textSecondary }]}>
                {selectedBank ? selectedBank.bankName : 'Choose your bank'}
              </RNText>
              <MaterialCommunityIcons name="chevron-down" size={20} color={palette.textSecondary} />
            </Pressable>
          </View>

          {/* Account Number */}
          <View style={styles.section}>
            <RNText style={[styles.label, { color: palette.text }]}>Account Number</RNText>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: cardBackground, borderColor: separatorColor },
              ]}
            >
              <TextInput
                style={[styles.input, { color: palette.text }]}
                placeholder="0000000000"
                placeholderTextColor={palette.textSecondary}
                keyboardType="number-pad"
                maxLength={10}
                value={accountNumber}
                onChangeText={setAccountNumber}
              />
              {resolvingAccount && (
                <ActivityIndicator size="small" color={palette.primary} />
              )}
              {resolvedAccount && !resolvingAccount && (
                <MaterialCommunityIcons name="check-circle" size={20} color="#059669" />
              )}
            </View>
            {resolvedAccount && resolvedAccount.verified !== false && resolvedAccount.account_name && (
              <View style={[styles.accountVerified, { backgroundColor: '#05966920' }]}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#059669" />
                <RNText style={[styles.accountName, { color: '#059669' }]}>
                  {resolvedAccount.account_name}
                </RNText>
              </View>
            )}
            {resolvedAccount && resolvedAccount.verified === false && (
              <View style={[styles.accountVerified, { backgroundColor: '#F9731620' }]}>
                <MaterialCommunityIcons name="alert-circle" size={16} color="#F97316" />
                <RNText style={[styles.accountName, { color: '#F97316' }]}>
                  Verification unavailable
                </RNText>
              </View>
            )}
          </View>

          {/* Manual Account Name (when verification is unavailable or fails) */}
          {(!resolvedAccount || resolvedAccount.verified === false || !resolvedAccount.account_name) &&
           accountNumber.length === 10 && selectedBank && !resolvingAccount && (
            <View style={styles.section}>
              <RNText style={[styles.label, { color: palette.text }]}>Account Name</RNText>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: cardBackground, borderColor: separatorColor },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: palette.text }]}
                  placeholder="Enter account holder name"
                  placeholderTextColor={palette.textSecondary}
                  value={manualAccountName}
                  onChangeText={setManualAccountName}
                  autoCapitalize="words"
                />
              </View>
              <RNText style={[styles.helperText, { color: palette.textSecondary }]}>
                Account verification unavailable. Please enter the account name manually.
              </RNText>
            </View>
          )}

          {/* Narration (Optional) */}
          <View style={styles.section}>
            <RNText style={[styles.label, { color: palette.text }]}>
              Narration <RNText style={{ color: palette.textSecondary }}>(Optional)</RNText>
            </RNText>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: cardBackground, borderColor: separatorColor },
              ]}
            >
              <TextInput
                style={[styles.input, { color: palette.text }]}
                placeholder="Add a note..."
                placeholderTextColor={palette.textSecondary}
                value={narration}
                onChangeText={setNarration}
                maxLength={100}
              />
            </View>
          </View>

          {/* Transaction PIN Warning */}
          {!transactionPinSet && (
            <Pressable
              style={[
                styles.pinWarningBanner,
                {
                  backgroundColor: isDark ? 'rgba(251,191,36,0.15)' : 'rgba(251,191,36,0.1)',
                  borderColor: isDark ? 'rgba(251,191,36,0.3)' : 'rgba(251,191,36,0.2)',
                },
              ]}
              onPress={() => {
                // @ts-ignore
                navigation.navigate('Settings');
              }}
            >
              <MaterialCommunityIcons name="alert-circle" size={20} color="#F59E0B" />
              <View style={styles.pinWarningTextContainer}>
                <RNText style={[styles.pinWarningTitle, { color: '#F59E0B' }]}>
                  Transaction PIN Not Set
                </RNText>
                <RNText style={[styles.pinWarningSubtitle, { color: palette.textSecondary }]}>
                  Set up your PIN in Settings to enable withdrawals
                </RNText>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#F59E0B" />
            </Pressable>
          )}

          {/* Withdraw Button */}
          <Button
            mode="contained"
            onPress={handleWithdraw}
            loading={withdrawalLoading}
            disabled={!isFormValid || withdrawalLoading || !transactionPinSet}
            style={styles.withdrawButton}
            contentStyle={styles.buttonContent}
            buttonColor={palette.primary}
            textColor="#FFFFFF"
          >
            {withdrawalLoading ? 'Processing...' : 'Withdraw Funds'}
          </Button>

          {/* Info Card */}
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)',
                borderColor: isDark ? 'rgba(147,197,253,0.2)' : 'rgba(59,130,246,0.15)',
              },
            ]}
          >
            <MaterialCommunityIcons name="information-outline" size={20} color="#3B82F6" />
            <RNText style={[styles.infoText, { color: palette.text }]}>
              Withdrawals are processed within 5-10 minutes during business hours.
            </RNText>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Bank Selector Modal */}
      <BankSelectorModal
        visible={showBankSelector}
        banks={banks}
        onSelect={setSelectedBank}
        onClose={() => setShowBankSelector(false)}
        palette={palette}
        isDark={isDark}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontFamily: 'NeuzeitGro-ExtraBold',
    fontSize: 18,
    letterSpacing: -0.5,
  },
  headerAccent: {
    height: 2,
    width: 30,
    borderRadius: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  balanceCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  balanceLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  balanceValue: {
    fontFamily: 'NeuzeitGro-ExtraBold',
    fontSize: 32,
    letterSpacing: -1,
  },
  section: {
    gap: theme.spacing.sm,
  },
  label: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
  },
  currencySymbol: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  input: {
    flex: 1,
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 16,
    paddingVertical: 0,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
  },
  selectorText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
  },
  accountVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  accountName: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 13,
  },
  helperText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
    marginTop: theme.spacing.xs,
  },
  pinWarningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    marginTop: theme.spacing.md,
  },
  pinWarningTextContainer: {
    flex: 1,
    gap: 2,
  },
  pinWarningTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
  pinWarningSubtitle: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
  },
  withdrawButton: {
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
  },
  buttonContent: {
    paddingVertical: theme.spacing.sm,
  },
  infoCard: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  modalTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
    paddingVertical: 0,
  },
  bankList: {
    flex: 1,
  },
  bankItem: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  bankName: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
  },
});
