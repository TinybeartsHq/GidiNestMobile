import React, { useState } from 'react';
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
import { useAuthV2 } from '../../hooks/useAuthV2';
import RestrictionBanner from '../../components/RestrictionBanner';

export default function DepositScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isRestricted } = useAuthV2();

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';

  const paymentMethods = [
    {
      id: 'bank-transfer',
      title: 'Bank Transfer',
      description: 'Transfer from your bank account',
      icon: 'bank-transfer',
      available: true,
      accent: isDark ? '#6EE7B7' : '#059669',
      background: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(5,150,105,0.1)',
    },
    {
      id: 'card',
      title: 'Debit Card',
      description: 'Pay with your debit card',
      icon: 'credit-card',
      available: false,
      accent: isDark ? '#93C5FD' : '#2563EB',
      background: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(37,99,235,0.1)',
      comingSoon: true,
    },
    {
      id: 'ussd',
      title: 'USSD',
      description: 'Pay via USSD code',
      icon: 'phone-dial',
      available: false,
      accent: isDark ? '#C4B5FD' : '#7C3AED',
      background: isDark ? 'rgba(196,181,253,0.15)' : 'rgba(124,58,237,0.1)',
      comingSoon: true,
    },
  ];

  const handleMethodSelect = (methodId: string) => {
    if (methodId === 'bank-transfer') {
      // @ts-ignore
      navigation.navigate('BankTransferDetails');
    }
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
              Deposit Money
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
          {/* Restriction Banner */}
          {isRestricted && <RestrictionBanner style={{ marginBottom: theme.spacing.md }} />}

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
              <MaterialCommunityIcons name="information" size={20} color={palette.primary} />
            </View>
            <RNText style={[styles.infoText, { color: palette.text }]}>
              Choose your preferred payment method to add money to your wallet
            </RNText>
          </View>

          {/* Payment Methods */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Payment Methods
            </RNText>
            <View style={styles.methodsContainer}>
              {paymentMethods.map((method) => (
                <Pressable
                  key={method.id}
                  style={({ pressed }) => [
                    styles.methodCard,
                    {
                      backgroundColor: cardBackground,
                      borderColor: separatorColor,
                      opacity: !method.available ? 0.6 : pressed ? 0.9 : 1,
                      transform: [{ scale: pressed && method.available ? 0.98 : 1 }],
                    },
                  ]}
                  onPress={() => method.available && handleMethodSelect(method.id)}
                  disabled={!method.available}
                >
                  <View
                    style={[
                      styles.methodIcon,
                      { backgroundColor: method.background },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={method.icon as any}
                      size={28}
                      color={method.accent}
                    />
                  </View>
                  <View style={styles.methodContent}>
                    <View style={styles.methodHeader}>
                      <RNText style={[styles.methodTitle, { color: palette.text }]}>
                        {method.title}
                      </RNText>
                      {method.comingSoon && (
                        <View
                          style={[
                            styles.comingSoonBadge,
                            { backgroundColor: isDark ? 'rgba(251,191,36,0.15)' : 'rgba(251,191,36,0.1)' },
                          ]}
                        >
                          <RNText
                            style={[
                              styles.comingSoonText,
                              { color: isDark ? '#FDE68A' : '#D97706' },
                            ]}
                          >
                            Coming Soon
                          </RNText>
                        </View>
                      )}
                    </View>
                    <RNText style={[styles.methodDescription, { color: palette.textSecondary }]}>
                      {method.description}
                    </RNText>
                  </View>
                  {method.available && (
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={24}
                      color={palette.textSecondary}
                    />
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Security Note */}
          <View
            style={[
              styles.securityCard,
              {
                backgroundColor: featureTint,
                borderColor: separatorColor,
              },
            ]}
          >
            <View style={[styles.securityIcon, { backgroundColor: palette.primary + '1F' }]}>
              <MaterialCommunityIcons name="shield-check" size={18} color={palette.primary} />
            </View>
            <View style={styles.securityContent}>
              <RNText style={[styles.securityTitle, { color: palette.text }]}>
                Secure & Encrypted
              </RNText>
              <RNText style={[styles.securityText, { color: palette.textSecondary }]}>
                All transactions are protected with bank-level encryption
              </RNText>
            </View>
          </View>
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
  infoText: {
    flex: 1,
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  methodsContainer: {
    gap: theme.spacing.sm,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodContent: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  methodTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 16,
  },
  comingSoonBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.md,
  },
  comingSoonText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 11,
  },
  methodDescription: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  securityCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
  },
  securityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityContent: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  securityTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
  },
  securityText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
});
