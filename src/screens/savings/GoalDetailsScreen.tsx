import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text as RNText,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import { useSavings } from '../../hooks/useSavings';

type RouteParams = {
  GoalDetails: {
    goalId: string;
  };
};

const formatCurrency = (value: number) => {
  return `₦${value.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export default function GoalDetailsScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<RouteParams, 'GoalDetails'>>();

  const { goalId } = route.params;
  const {
    selectedGoal,
    loading,
    updateLoading,
    deleteLoading,
    getGoalById,
    updateGoal,
    deleteGoal,
    clearSelectedGoal,
  } = useSavings();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedTarget, setEditedTarget] = useState('');

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';
  const inputBackground = isDark ? 'rgba(15, 23, 42, 0.72)' : '#FFFFFF';

  useEffect(() => {
    // Clear previous selected goal to avoid showing stale data
    clearSelectedGoal();

    if (goalId) {
      getGoalById(String(goalId));
    }

    // Cleanup on unmount
    return () => {
      clearSelectedGoal();
    };
  }, [goalId]);

  useEffect(() => {
    if (selectedGoal) {
      setEditedName(selectedGoal.name || '');
      setEditedTarget((selectedGoal.target_amount || 0).toString());
    }
  }, [selectedGoal]);

  const currentAmount = selectedGoal?.current_amount ?? 0;
  const targetAmount = selectedGoal?.target_amount ?? 0;

  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const remaining = targetAmount > currentAmount ? targetAmount - currentAmount : 0;

  const numericTarget = parseInt(editedTarget.replace(/[^0-9]/g, '') || '0', 10);
  const canSave =
    isEditing && editedName.trim().length > 0 && numericTarget > 0 && !updateLoading;

  const handleTargetChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setEditedTarget(numeric);
  };

  const handleSave = async () => {
    if (!canSave || !selectedGoal) return;

    try {
      await updateGoal(goalId, {
        name: editedName.trim(),
        target_amount: numericTarget,
      }).unwrap();

      Alert.alert('Success', 'Goal updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      Alert.alert('Error', err || 'Failed to update goal. Please try again.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGoal(goalId).unwrap();
              Alert.alert('Success', 'Goal deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (err: any) {
              Alert.alert('Error', err || 'Failed to delete goal. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleFund = () => {
    // @ts-ignore
    navigation.navigate('FundGoal', { goalId });
  };

  const handleWithdraw = () => {
    // @ts-ignore
    navigation.navigate('WithdrawFromGoal', { goalId });
  };

  if (loading || !selectedGoal) {
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
            <RNText style={[styles.headerTitle, { color: palette.text }]}>Goal Details</RNText>
            <View style={[styles.headerAccent, { backgroundColor: palette.primary }]} />
          </View>
          <Pressable
            style={[styles.editButton, { backgroundColor: featureTint }]}
            onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={isEditing && !canSave}
          >
            <MaterialCommunityIcons
              name={isEditing ? 'check' : 'pencil'}
              size={20}
              color={isEditing && !canSave ? palette.textSecondary : palette.text}
            />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + (Platform.OS === 'ios' ? 120 : 108) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Card */}
          <View style={[styles.progressCard, { backgroundColor: cardBackground }]}>
            <View style={styles.progressHeader}>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.goalNameInput,
                    {
                      color: palette.text,
                      backgroundColor: inputBackground,
                      borderColor: separatorColor,
                    },
                  ]}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="Goal name"
                  placeholderTextColor={palette.textSecondary}
                />
              ) : (
                <RNText style={[styles.goalName, { color: palette.text }]}>
                  {selectedGoal?.name || 'Unnamed Goal'}
                </RNText>
              )}
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressBarContainer, { backgroundColor: featureTint }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: palette.primary,
                    width: `${Math.min(progress, 100)}%`,
                  },
                ]}
              />
            </View>

            {/* Amounts */}
            <View style={styles.amountsRow}>
              <View style={styles.amountItem}>
                <RNText style={[styles.amountLabel, { color: palette.textSecondary }]}>
                  Saved
                </RNText>
                <RNText style={[styles.amountValue, { color: palette.primary }]}>
                  {formatCurrency(currentAmount)}
                </RNText>
              </View>
              <View style={styles.amountItem}>
                <RNText style={[styles.amountLabel, { color: palette.textSecondary }]}>
                  Target
                </RNText>
                {isEditing ? (
                  <View
                    style={[
                      styles.targetInputContainer,
                      {
                        backgroundColor: inputBackground,
                        borderColor: separatorColor,
                      },
                    ]}
                  >
                    <RNText style={[styles.currencySymbol, { color: palette.text }]}>₦</RNText>
                    <TextInput
                      style={[styles.targetInput, { color: palette.text }]}
                      value={editedTarget ? formatCurrency(numericTarget).replace('₦', '') : ''}
                      onChangeText={handleTargetChange}
                      placeholder="0"
                      placeholderTextColor={palette.textSecondary}
                      keyboardType="number-pad"
                    />
                  </View>
                ) : (
                  <RNText style={[styles.amountValue, { color: palette.text }]}>
                    {formatCurrency(targetAmount)}
                  </RNText>
                )}
              </View>
              <View style={styles.amountItem}>
                <RNText style={[styles.amountLabel, { color: palette.textSecondary }]}>
                  Remaining
                </RNText>
                <RNText
                  style={[styles.amountValue, { color: isDark ? '#FCA5A5' : '#DC2626' }]}
                >
                  {formatCurrency(remaining)}
                </RNText>
              </View>
            </View>

            {/* Progress Percentage */}
            <View style={[styles.progressBadge, { backgroundColor: palette.primary + '1F' }]}>
              <RNText style={[styles.progressText, { color: palette.primary }]}>
                {isNaN(progress) ? '0' : Math.round(progress)}% Complete
              </RNText>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor: palette.primary,
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
              onPress={handleFund}
            >
              <MaterialCommunityIcons name="plus-circle" size={20} color="#FFFFFF" />
              <RNText style={styles.actionButtonText}>Fund Goal</RNText>
            </Pressable>

            {currentAmount > 0 && (
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    backgroundColor: isDark ? 'rgba(251,191,36,0.15)' : 'rgba(217,119,6,0.1)',
                    borderColor: isDark ? '#FDE68A' : '#D97706',
                    borderWidth: 1,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
                onPress={handleWithdraw}
              >
                <MaterialCommunityIcons
                  name="arrow-up-circle"
                  size={20}
                  color={isDark ? '#FDE68A' : '#D97706'}
                />
                <RNText
                  style={[
                    styles.actionButtonText,
                    { color: isDark ? '#FDE68A' : '#D97706' },
                  ]}
                >
                  Withdraw
                </RNText>
              </Pressable>
            )}
          </View>

          {/* Delete Button */}
          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              {
                backgroundColor: isDark ? 'rgba(248,113,113,0.15)' : 'rgba(220,38,38,0.1)',
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
            onPress={handleDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <>
                <MaterialCommunityIcons name="delete" size={20} color="#EF4444" />
                <RNText style={[styles.deleteButtonText, { color: '#EF4444' }]}>
                  Delete Goal
                </RNText>
              </>
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
  editButton: {
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
  progressCard: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    gap: theme.spacing.lg,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  progressHeader: {
    marginBottom: theme.spacing.xs,
  },
  goalName: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 22,
  },
  goalNameInput: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 22,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  progressBarContainer: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountItem: {
    gap: theme.spacing.xs / 2,
  },
  amountLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
  },
  amountValue: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
  },
  targetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  currencySymbol: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 14,
    marginRight: theme.spacing.xs / 2,
  },
  targetInput: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 14,
    padding: 0,
    minWidth: 60,
  },
  progressBadge: {
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
  },
  progressText: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.xs,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  actionButtonText: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  deleteButton: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
});
