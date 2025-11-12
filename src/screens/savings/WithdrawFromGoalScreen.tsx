import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text as RNText,
  TextInput,
  Platform,
  Keyboard,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import { useSavings } from '../../hooks/useSavings';
import { usePin } from '../../hooks/useAuthV2';

type RouteParams = {
  WithdrawFromGoal: {
    goalId: string;
  };
};

const formatCurrency = (value: number) => {
  return `₦${value.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export default function WithdrawFromGoalScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<RouteParams, 'WithdrawFromGoal'>>();

  const { goalId } = route.params;
  const { selectedGoal, getGoalById, withdrawFromGoal, withdrawLoading } = useSavings();
  const { hasPin } = usePin();

  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';
  const inputBackground = isDark ? 'rgba(15, 23, 42, 0.72)' : '#FFFFFF';

  const availableBalance = selectedGoal?.current_amount || 0;

  useEffect(() => {
    getGoalById(goalId);
  }, [goalId]);

  const numericAmount = parseInt(amount.replace(/[^0-9]/g, '') || '0', 10);
  const canProceed =
    numericAmount > 0 && numericAmount <= availableBalance && !withdrawLoading;

  const handleAmountChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setAmount(numeric);
  };

  const handleContinue = () => {
    if (!canProceed) return;

    if (!hasPin) {
      Alert.alert(
        'PIN Required',
        'You need to set up a transaction PIN before withdrawing from goals.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Set Up PIN',
            onPress: () => {
              // @ts-ignore
              navigation.navigate('PINSetup');
            },
          },
        ]
      );
      return;
    }

    setShowPinInput(true);
  };

  const handleWithdraw = async () => {
    if (!canProceed || pin.length !== 4) return;

    Keyboard.dismiss();

    try {
      await withdrawFromGoal(goalId, {
        amount: numericAmount,
        transaction_pin: pin,
      }).unwrap();

      Alert.alert('Success', 'Withdrawal successful! Funds added to your wallet.', [
        {
          text: 'OK',
          onPress: () => {
            setPin('');
            setAmount('');
            setShowPinInput(false);
            navigation.goBack();
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err || 'Failed to withdraw. Please try again.');
      setPin('');
    }
  };

  if (!selectedGoal) {
    return (
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={palette.primary} />
            <RNText style={[styles.loadingText, { color: palette.textSecondary }]}>
              Loading goal details...
            </RNText>
          </View>
        </SafeAreaView>
      </View>
    );
  }

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
              Withdraw from Goal
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
          keyboardShouldPersistTaps="handled"
        >
          {/* Goal Info */}
          <View
            style={[
              styles.goalCard,
              {
                backgroundColor: cardBackground,
              },
            ]}
          >
            <View style={[styles.goalIcon, { backgroundColor: palette.primary + '1F' }]}>
              <MaterialCommunityIcons name="target" size={24} color={palette.primary} />
            </View>
            <View style={styles.goalInfo}>
              <RNText style={[styles.goalName, { color: palette.text }]}>
                {selectedGoal.name}
              </RNText>
              <RNText style={[styles.goalBalance, { color: palette.textSecondary }]}>
                Available: {formatCurrency(availableBalance)}
              </RNText>
            </View>
          </View>

          {/* Enter Amount */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Withdrawal Amount
            </RNText>
            <View
              style={[
                styles.amountInputCard,
                {
                  backgroundColor: inputBackground,
                  borderColor: separatorColor,
                },
              ]}
            >
              <RNText style={[styles.currencySymbol, { color: palette.text }]}>₦</RNText>
              <TextInput
                style={[styles.amountInput, { color: palette.text }]}
                value={amount ? formatCurrency(numericAmount).replace('₦', '') : ''}
                onChangeText={handleAmountChange}
                placeholder="0"
                placeholderTextColor={palette.textSecondary}
                keyboardType="number-pad"
                maxLength={10}
              />
            </View>
            {numericAmount > availableBalance && (
              <RNText style={[styles.errorText, { color: '#EF4444' }]}>
                Insufficient balance in goal
              </RNText>
            )}
          </View>

          {/* Info Card */}
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: isDark ? 'rgba(251,191,36,0.1)' : 'rgba(217,119,6,0.05)',
                borderColor: isDark ? 'rgba(254,215,170,0.2)' : 'rgba(217,119,6,0.15)',
              },
            ]}
          >
            <MaterialCommunityIcons
              name="information"
              size={20}
              color={isDark ? '#FDE68A' : '#D97706'}
            />
            <RNText style={[styles.infoText, { color: palette.text }]}>
              Withdrawn funds will be added to your main wallet balance.
            </RNText>
          </View>

          {/* PIN Input (conditional) */}
          {showPinInput && (
            <View style={styles.section}>
              <RNText style={[styles.sectionTitle, { color: palette.text }]}>
                Enter Transaction PIN
              </RNText>
              <View
                style={[
                  styles.pinInputCard,
                  {
                    backgroundColor: inputBackground,
                    borderColor: separatorColor,
                  },
                ]}
              >
                <MaterialCommunityIcons name="lock" size={20} color={palette.primary} />
                <TextInput
                  style={[styles.pinInput, { color: palette.text }]}
                  value={pin}
                  onChangeText={setPin}
                  placeholder="4-digit PIN"
                  placeholderTextColor={palette.textSecondary}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
          )}

          {/* Withdraw Button */}
          <Pressable
            style={({ pressed }) => [
              styles.withdrawButton,
              {
                backgroundColor:
                  canProceed && (!showPinInput || pin.length === 4) && !withdrawLoading
                    ? palette.primary
                    : featureTint,
                opacity:
                  pressed && canProceed && (!showPinInput || pin.length === 4) && !withdrawLoading
                    ? 0.9
                    : 1,
                transform: [
                  {
                    scale:
                      pressed && canProceed && (!showPinInput || pin.length === 4) && !withdrawLoading
                        ? 0.98
                        : 1,
                  },
                ],
              },
            ]}
            onPress={showPinInput ? handleWithdraw : handleContinue}
            disabled={!canProceed || (showPinInput && pin.length !== 4) || withdrawLoading}
          >
            {withdrawLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <RNText
                style={[
                  styles.withdrawButtonText,
                  {
                    color:
                      canProceed && (!showPinInput || pin.length === 4)
                        ? '#FFFFFF'
                        : palette.textSecondary,
                  },
                ]}
              >
                {showPinInput ? 'Confirm Withdrawal' : 'Continue'}
              </RNText>
            )}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
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
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  goalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInfo: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  goalName: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
  },
  goalBalance: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  amountInputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  currencySymbol: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 32,
    marginRight: theme.spacing.xs,
  },
  amountInput: {
    flex: 1,
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 32,
    padding: 0,
  },
  errorText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 13,
    marginTop: theme.spacing.xs / 2,
  },
  infoCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  pinInputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pinInput: {
    flex: 1,
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
    padding: 0,
    letterSpacing: 8,
  },
  withdrawButton: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  withdrawButtonText: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
  },
});
