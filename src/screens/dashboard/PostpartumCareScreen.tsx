import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text as RNText,
  Platform,
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

export default function PostpartumCareScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';
  const accentColor = isDark ? '#C4B5FD' : '#7C3AED';

  const bottomContentPadding = useMemo(
    () => insets.bottom + (Platform.OS === 'ios' ? 120 : 108),
    [insets.bottom]
  );

  const careCategories = useMemo(
    () => [
      {
        id: '1',
        name: 'Maternal Recovery',
        icon: 'heart-pulse',
        description: 'Postnatal checkups & recovery support',
        items: ['6-week checkup', 'Wound care supplies', 'Pain relief medication', 'Recovery aids'],
        estimatedCost: 80000,
      },
      {
        id: '2',
        name: 'Nutrition Support',
        icon: 'food-apple',
        description: 'Healthy meals & supplements',
        items: ['Meal preparation', 'Vitamins & supplements', 'Nutritious snacks', 'Hydration aids'],
        estimatedCost: 100000,
      },
      {
        id: '3',
        name: 'Help at Home',
        icon: 'home-heart',
        description: 'Household assistance during recovery',
        items: ['House cleaning', 'Laundry service', 'Cooking help', 'Errand runner'],
        estimatedCost: 120000,
      },
      {
        id: '4',
        name: 'Mental Wellness',
        icon: 'head-heart',
        description: 'Emotional and psychological support',
        items: ['Counseling sessions', 'Support groups', 'Relaxation aids', 'Self-care items'],
        estimatedCost: 70000,
      },
    ],
    []
  );

  const totalEstimate = useMemo(
    () => careCategories.reduce((sum, cat) => sum + cat.estimatedCost, 0),
    [careCategories]
  );

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
            <RNText style={[styles.headerTitle, { color: palette.text }]}>Postpartum Care</RNText>
            <View style={[styles.headerAccent, { backgroundColor: accentColor }]} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomContentPadding }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Card */}
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: isDark ? 'rgba(147,51,234,0.1)' : 'rgba(124,58,237,0.06)',
                borderColor: isDark ? 'rgba(196,181,253,0.3)' : 'rgba(124,58,237,0.2)',
              },
            ]}
          >
            <View style={[styles.heroIcon, { backgroundColor: accentColor }]}>
              <MaterialCommunityIcons name="heart-pulse" size={40} color="#FFFFFF" />
            </View>
            <RNText style={[styles.heroTitle, { color: palette.text }]}>
              Recovery & Well-being After Birth
            </RNText>
            <RNText style={[styles.heroDescription, { color: palette.textSecondary }]}>
              Your recovery matters too. Plan for maternal health, nutrition, household help, and
              emotional support during the postpartum period.
            </RNText>
          </View>

          {/* Care Categories */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Postpartum Support Areas
            </RNText>
            <View style={styles.categoriesList}>
              {careCategories.map((category) => (
                <View
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: cardBackground,
                      borderColor: separatorColor,
                    },
                  ]}
                >
                  <View style={styles.categoryHeader}>
                    <View style={[styles.categoryIcon, { backgroundColor: accentColor + '1F' }]}>
                      <MaterialCommunityIcons
                        name={category.icon as any}
                        size={28}
                        color={accentColor}
                      />
                    </View>
                    <View style={styles.categoryInfo}>
                      <RNText style={[styles.categoryName, { color: palette.text }]}>
                        {category.name}
                      </RNText>
                      <RNText style={[styles.categoryDescription, { color: palette.textSecondary }]}>
                        {category.description}
                      </RNText>
                      <RNText style={[styles.categoryAmount, { color: accentColor }]}>
                        {formatCurrency(category.estimatedCost)}
                      </RNText>
                    </View>
                  </View>
                  <View style={[styles.divider, { backgroundColor: separatorColor }]} />
                  <View style={styles.itemsList}>
                    {category.items.map((item, index) => (
                      <View key={index} style={styles.itemRow}>
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={14}
                          color={palette.textSecondary}
                        />
                        <RNText style={[styles.itemText, { color: palette.textSecondary }]}>
                          {item}
                        </RNText>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Info Callout */}
          <View
            style={[
              styles.infoBox,
              {
                backgroundColor: isDark ? 'rgba(147,51,234,0.1)' : 'rgba(124,58,237,0.06)',
                borderColor: isDark ? 'rgba(196,181,253,0.3)' : 'rgba(124,58,237,0.2)',
              },
            ]}
          >
            <MaterialCommunityIcons name="information" size={20} color={accentColor} />
            <RNText style={[styles.infoText, { color: palette.textSecondary }]}>
              The first 6-8 weeks after childbirth are crucial for recovery. Don't hesitate to ask for
              help and prioritize your well-being.
            </RNText>
          </View>

          {/* Total Estimate */}
          <View
            style={[
              styles.totalCard,
              {
                backgroundColor: cardBackground,
                borderColor: separatorColor,
              },
            ]}
          >
            <View style={styles.totalRow}>
              <RNText style={[styles.totalLabel, { color: palette.text }]}>
                Total Estimated Cost
              </RNText>
              <RNText style={[styles.totalAmount, { color: accentColor }]}>
                {formatCurrency(totalEstimate)}
              </RNText>
            </View>
            <RNText style={[styles.totalNote, { color: palette.textSecondary }]}>
              * Costs may vary based on individual needs and preferences
            </RNText>
          </View>

          {/* Call to Action */}
          <Pressable
            style={[styles.ctaButton, { backgroundColor: accentColor }]}
            onPress={() => {}}
          >
            <MaterialCommunityIcons name="heart-circle" size={20} color="#FFFFFF" />
            <RNText style={styles.ctaButtonText}>Plan Your Recovery</RNText>
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
  heroCard: {
    borderRadius: theme.borderRadius.xl + 2,
    borderWidth: 1,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  heroTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 22,
    textAlign: 'center',
    lineHeight: 28,
  },
  heroDescription: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  categoriesList: {
    gap: theme.spacing.md,
  },
  categoryCard: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  categoryName: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
  },
  categoryDescription: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  categoryAmount: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 15,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  itemsList: {
    gap: theme.spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  itemText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    flex: 1,
  },
  infoBox: {
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
    fontSize: 13,
    lineHeight: 18,
  },
  totalCard: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
  },
  totalAmount: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 20,
  },
  totalNote: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 11,
    fontStyle: 'italic',
  },
  ctaButton: {
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
  ctaButtonText: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
