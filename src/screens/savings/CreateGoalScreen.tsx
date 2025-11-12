import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text as RNText,
  TextInput,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import { useSavings } from '../../hooks/useSavings';

const formatCurrency = (value: number) => {
  return `₦${value.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const goalCategories = [
  {
    id: 'medical',
    name: 'Medical',
    icon: 'hospital-building',
    color: '#DC2626',
  },
  {
    id: 'essentials',
    name: 'Essentials',
    icon: 'baby-carriage',
    color: '#D97706',
  },
  {
    id: 'emergency',
    name: 'Emergency',
    icon: 'shield-check',
    color: '#059669',
  },
  {
    id: 'recovery',
    name: 'Recovery',
    icon: 'heart-plus',
    color: '#7C3AED',
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'school',
    color: '#2563EB',
  },
  {
    id: 'other',
    name: 'Other',
    icon: 'star',
    color: '#EC4899',
  },
];

export default function CreateGoalScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { createGoal, createLoading, error } = useSavings();

  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';
  const inputBackground = isDark ? 'rgba(15, 23, 42, 0.72)' : '#FFFFFF';

  const numericAmount = parseInt(targetAmount.replace(/[^0-9]/g, '') || '0', 10);
  const canCreate = goalName.trim().length > 0 && numericAmount > 0 && selectedCategory;

  const handleAmountChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setTargetAmount(numeric);
  };

  const handleCreate = async () => {
    if (!canCreate) return;

    Keyboard.dismiss();

    try {
      await createGoal({
        name: goalName.trim(),
        target_amount: numericAmount,
        category: selectedCategory || undefined,
      }).unwrap();

      Alert.alert('Success', 'Savings goal created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err: any) {
      const errorMessage = err || error || 'Failed to create goal. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                Create Goal
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
              <View style={[styles.infoIcon, { backgroundColor: palette.primary + '1F' }]}>
                <MaterialCommunityIcons name="target" size={20} color={palette.primary} />
              </View>
              <RNText style={[styles.infoText, { color: palette.text }]}>
                Create a savings goal to help you prepare for your baby's arrival
              </RNText>
            </View>

            {/* Goal Name */}
            <View style={styles.section}>
              <RNText style={[styles.label, { color: palette.text }]}>
                Goal Name
              </RNText>
              <View
                style={[
                  styles.inputCard,
                  {
                    backgroundColor: inputBackground,
                    borderColor: separatorColor,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: palette.text }]}
                  value={goalName}
                  onChangeText={setGoalName}
                  placeholder="e.g., Baby's First Year Fund"
                  placeholderTextColor={palette.textSecondary}
                  maxLength={50}
                />
              </View>
            </View>

            {/* Target Amount */}
            <View style={styles.section}>
              <RNText style={[styles.label, { color: palette.text }]}>
                Target Amount
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
                  value={targetAmount ? formatCurrency(numericAmount).replace('₦', '') : ''}
                  onChangeText={handleAmountChange}
                  placeholder="0"
                  placeholderTextColor={palette.textSecondary}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Category */}
            <View style={styles.section}>
              <RNText style={[styles.label, { color: palette.text }]}>
                Category
              </RNText>
              <View style={styles.categoriesGrid}>
                {goalCategories.map((category) => {
                  const isSelected = selectedCategory === category.id;

                  return (
                    <Pressable
                      key={category.id}
                      style={({ pressed }) => [
                        styles.categoryCard,
                        {
                          backgroundColor: cardBackground,
                          borderColor: isSelected ? palette.primary : separatorColor,
                          borderWidth: isSelected ? 2 : StyleSheet.hairlineWidth,
                          opacity: pressed ? 0.9 : 1,
                          transform: [{ scale: pressed ? 0.95 : 1 }],
                        },
                      ]}
                      onPress={() => setSelectedCategory(category.id)}
                    >
                      <View
                        style={[
                          styles.categoryIcon,
                          {
                            backgroundColor: isDark
                              ? `${category.color}33`
                              : `${category.color}1A`,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={category.icon as any}
                          size={24}
                          color={category.color}
                        />
                      </View>
                      <RNText style={[styles.categoryName, { color: palette.text }]}>
                        {category.name}
                      </RNText>
                      {isSelected && (
                        <View style={styles.checkmarkContainer}>
                          <MaterialCommunityIcons
                            name="check-circle"
                            size={20}
                            color={palette.primary}
                          />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Create Button */}
            <Pressable
              style={({ pressed }) => [
                styles.createButton,
                {
                  backgroundColor: canCreate && !createLoading ? palette.primary : featureTint,
                  opacity: pressed && canCreate && !createLoading ? 0.9 : 1,
                  transform: [{ scale: pressed && canCreate && !createLoading ? 0.98 : 1 }],
                },
              ]}
              onPress={handleCreate}
              disabled={!canCreate || createLoading}
            >
              {createLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="plus-circle"
                    size={20}
                    color={canCreate ? '#FFFFFF' : palette.textSecondary}
                  />
                  <RNText
                    style={[
                      styles.createButtonText,
                      { color: canCreate ? '#FFFFFF' : palette.textSecondary },
                    ]}
                  >
                    Create Goal
                  </RNText>
                </>
              )}
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
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
  infoText: {
    flex: 1,
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    gap: theme.spacing.sm,
  },
  label: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
  },
  inputCard: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 16,
    padding: 0,
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
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryCard: {
    width: '48%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    gap: theme.spacing.sm,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
  },
  createButton: {
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
  createButtonText: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
  },
});
