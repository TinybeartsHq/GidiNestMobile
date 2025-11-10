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

export default function HospitalBillsScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';
  const accentColor = isDark ? '#FCA5A5' : '#DC2626';

  const bottomContentPadding = useMemo(
    () => insets.bottom + (Platform.OS === 'ios' ? 120 : 108),
    [insets.bottom]
  );

  const hospitalCosts = useMemo(
    () => [
      {
        id: '1',
        name: 'Prenatal care & checkups',
        estimatedCost: 150000,
        description: 'Regular antenatal visits and tests',
      },
      {
        id: '2',
        name: 'Delivery costs',
        estimatedCost: 300000,
        description: 'Hospital delivery fees',
      },
      {
        id: '3',
        name: 'Medications & vitamins',
        estimatedCost: 50000,
        description: 'Prenatal vitamins and medications',
      },
      {
        id: '4',
        name: 'Ultrasound scans',
        estimatedCost: 80000,
        description: 'Regular scan appointments',
      },
    ],
    []
  );

  const totalEstimate = useMemo(
    () => hospitalCosts.reduce((sum, item) => sum + item.estimatedCost, 0),
    [hospitalCosts]
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
            <RNText style={[styles.headerTitle, { color: palette.text }]}>Hospital Bills</RNText>
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
                backgroundColor: isDark ? 'rgba(248,113,113,0.1)' : 'rgba(220,38,38,0.06)',
                borderColor: isDark ? 'rgba(252,165,165,0.3)' : 'rgba(220,38,38,0.2)',
              },
            ]}
          >
            <View style={[styles.heroIcon, { backgroundColor: accentColor }]}>
              <MaterialCommunityIcons name="hospital-building" size={40} color="#FFFFFF" />
            </View>
            <RNText style={[styles.heroTitle, { color: palette.text }]}>
              Save for Delivery & Medical Costs
            </RNText>
            <RNText style={[styles.heroDescription, { color: palette.textSecondary }]}>
              Plan ahead for hospital delivery bills, prenatal care, and medical expenses. Every
              contribution brings you closer to a stress-free childbirth.
            </RNText>
          </View>

          {/* Estimated Costs Breakdown */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Estimated Costs Breakdown
            </RNText>
            <View style={styles.costsList}>
              {hospitalCosts.map((cost) => (
                <View
                  key={cost.id}
                  style={[
                    styles.costCard,
                    {
                      backgroundColor: cardBackground,
                      borderColor: separatorColor,
                    },
                  ]}
                >
                  <View style={styles.costInfo}>
                    <RNText style={[styles.costName, { color: palette.text }]}>{cost.name}</RNText>
                    <RNText style={[styles.costDescription, { color: palette.textSecondary }]}>
                      {cost.description}
                    </RNText>
                  </View>
                  <RNText style={[styles.costAmount, { color: accentColor }]}>
                    {formatCurrency(cost.estimatedCost)}
                  </RNText>
                </View>
              ))}
            </View>
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
              * Costs may vary based on hospital and specific requirements
            </RNText>
          </View>

          {/* Call to Action */}
          <Pressable
            style={[styles.ctaButton, { backgroundColor: accentColor }]}
            onPress={() => {}}
          >
            <MaterialCommunityIcons name="piggy-bank" size={20} color="#FFFFFF" />
            <RNText style={styles.ctaButtonText}>Start Saving Now</RNText>
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
  costsList: {
    gap: theme.spacing.sm,
  },
  costCard: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  costInfo: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  costName: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
  },
  costDescription: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
  },
  costAmount: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
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
