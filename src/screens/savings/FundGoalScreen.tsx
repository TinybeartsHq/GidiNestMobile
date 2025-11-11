import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text as RNText,
  TextInput,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';

const formatCurrency = (value: number) => {
  return `₦${value.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export default function FundGoalScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [amount, setAmount] = useState('');

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';
  const inputBackground = isDark ? 'rgba(15, 23, 42, 0.72)' : '#FFFFFF';

  const walletBalance = 850000;

  const savingsGoals = useMemo(
    () => [
      {
        id: 'goal-1',
        name: 'Hospital Delivery Bills',
        icon: 'hospital-building',
        target: 500000,
        saved: 250000,
        accent: isDark ? '#FCA5A5' : '#DC2626',
        background: isDark ? 'rgba(248,113,113,0.15)' : 'rgba(220,38,38,0.1)',
      },
      {
        id: 'goal-2',
        name: 'Baby Clothes & Supplies',
        icon: 'baby-carriage',
        target: 300000,
        saved: 180000,
        accent: isDark ? '#FDE68A' : '#D97706',
        background: isDark ? 'rgba(251,191,36,0.15)' : 'rgba(217,119,6,0.1)',
      },
      {
        id: 'goal-3',
        name: 'Emergency Medical Fund',
        icon: 'shield-heart',
        target: 200000,
        saved: 125000,
        accent: isDark ? '#6EE7B7' : '#059669',
        background: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(5,150,105,0.1)',
      },
      {
        id: 'goal-4',
        name: 'Postpartum Support',
        icon: 'heart-pulse',
        target: 250000,
        saved: 95000,
        accent: isDark ? '#C4B5FD' : '#7C3AED',
        background: isDark ? 'rgba(196,181,253,0.15)' : 'rgba(124,58,237,0.1)',
      },
    ],
    [isDark]
  );

  const selectedGoalData = savingsGoals.find((g) => g.id === selectedGoal);
  const numericAmount = parseInt(amount.replace(/[^0-9]/g, '') || '0', 10);
  const canProceed = selectedGoal && numericAmount > 0 && numericAmount <= walletBalance;

  const handleAmountChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setAmount(numeric);
  };

  const handleFund = () => {
    if (!canProceed) return;

    // Navigate to PIN auth
    // @ts-ignore
    navigation.navigate('PINAuth', {
      amount: numericAmount,
      category: 'fund goal',
      onSuccess: () => {
        console.log('Goal funded successfully!', selectedGoal, numericAmount);
        navigation.goBack();
        navigation.goBack();
      },
      onCancel: () => {
        navigation.goBack();
      },
    });
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
              Fund a Goal
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
          {/* Wallet Balance */}
          <View
            style={[
              styles.balanceCard,
              {
                backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)',
                borderColor: isDark ? 'rgba(147,197,253,0.2)' : 'rgba(59,130,246,0.15)',
              },
            ]}
          >
            <View style={[styles.balanceIcon, { backgroundColor: palette.primary + '1F' }]}>
              <MaterialCommunityIcons name="wallet" size={20} color={palette.primary} />
            </View>
            <View style={styles.balanceContent}>
              <RNText style={[styles.balanceLabel, { color: palette.textSecondary }]}>
                Available Balance
              </RNText>
              <RNText style={[styles.balanceAmount, { color: palette.text }]}>
                {formatCurrency(walletBalance)}
              </RNText>
            </View>
          </View>

          {/* Select Goal */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Select Goal
            </RNText>
            <View style={styles.goalsContainer}>
              {savingsGoals.map((goal) => {
                const progress = (goal.saved / goal.target) * 100;
                const isSelected = selectedGoal === goal.id;

                return (
                  <Pressable
                    key={goal.id}
                    style={({ pressed }) => [
                      styles.goalCard,
                      {
                        backgroundColor: cardBackground,
                        borderColor: isSelected ? palette.primary : separatorColor,
                        borderWidth: isSelected ? 2 : StyleSheet.hairlineWidth,
                        opacity: pressed ? 0.9 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      },
                    ]}
                    onPress={() => setSelectedGoal(goal.id)}
                  >
                    <View
                      style={[
                        styles.goalIcon,
                        { backgroundColor: goal.background },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={goal.icon as any}
                        size={24}
                        color={goal.accent}
                      />
                    </View>
                    <View style={styles.goalInfo}>
                      <RNText style={[styles.goalName, { color: palette.text }]}>
                        {goal.name}
                      </RNText>
                      <RNText style={[styles.goalProgress, { color: palette.textSecondary }]}>
                        {formatCurrency(goal.saved)} of {formatCurrency(goal.target)} • {Math.round(progress)}%
                      </RNText>
                    </View>
                    {isSelected && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={24}
                        color={palette.primary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Enter Amount */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Enter Amount
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
            {numericAmount > walletBalance && (
              <RNText style={[styles.errorText, { color: '#EF4444' }]}>
                Insufficient balance
              </RNText>
            )}
          </View>

          {/* Fund Button */}
          <Pressable
            style={({ pressed }) => [
              styles.fundButton,
              {
                backgroundColor: canProceed ? palette.primary : featureTint,
                opacity: pressed && canProceed ? 0.9 : 1,
                transform: [{ scale: pressed && canProceed ? 0.98 : 1 }],
              },
            ]}
            onPress={handleFund}
            disabled={!canProceed}
          >
            <RNText
              style={[
                styles.fundButtonText,
                { color: canProceed ? '#FFFFFF' : palette.textSecondary },
              ]}
            >
              Continue
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
  balanceCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  balanceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceContent: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  balanceLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  balanceAmount: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 24,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  goalsContainer: {
    gap: theme.spacing.sm,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInfo: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  goalName: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
  },
  goalProgress: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
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
  fundButton: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  fundButtonText: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
  },
});
