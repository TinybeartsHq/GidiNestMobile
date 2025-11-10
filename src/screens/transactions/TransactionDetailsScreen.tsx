import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text as RNText,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';

const formatCurrency = (value: number) => {
  return `₦${value.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export default function TransactionDetailsScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();

  // Get transaction data from route params (we'll pass this when navigating)
  const transaction = (route.params as any)?.transaction || {
    id: 'tx-1',
    title: 'Hospital bills fund',
    description: 'Saved for delivery',
    timestamp: '2 hours ago',
    amount: 50000,
    positive: true,
    icon: 'hospital-building',
  };

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';

  const bottomContentPadding = useMemo(
    () => insets.bottom + (Platform.OS === 'ios' ? 120 : 108),
    [insets.bottom]
  );

  const transactionColor = transaction.positive
    ? (isDark ? '#6EE7B7' : '#059669')
    : (isDark ? '#FCA5A5' : '#DC2626');

  const transactionDetails = useMemo(
    () => [
      {
        id: '1',
        label: 'Transaction ID',
        value: transaction.id.toUpperCase(),
        icon: 'identifier',
      },
      {
        id: '2',
        label: 'Date & Time',
        value: transaction.timestamp,
        icon: 'clock-outline',
      },
      {
        id: '3',
        label: 'Payment Method',
        value: 'Bank Transfer',
        icon: 'bank',
      },
      {
        id: '4',
        label: 'Category',
        value: transaction.title,
        icon: transaction.icon,
      },
      {
        id: '5',
        label: 'Status',
        value: 'Completed',
        icon: 'check-circle',
      },
    ],
    [transaction]
  );

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Transaction Receipt\n\nAmount: ${formatCurrency(transaction.amount)}\nCategory: ${transaction.title}\nDate: ${transaction.timestamp}\nID: ${transaction.id.toUpperCase()}`,
      });
    } catch (error) {
      console.log(error);
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
              Transaction Details
            </RNText>
            <View style={[styles.headerAccent, { backgroundColor: palette.primary }]} />
          </View>
          <Pressable
            style={[styles.shareButton, { backgroundColor: featureTint }]}
            onPress={handleShare}
          >
            <MaterialCommunityIcons name="share-variant" size={20} color={palette.text} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomContentPadding }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Amount Card */}
          <View
            style={[
              styles.amountCard,
              {
                backgroundColor: cardBackground,
                borderColor: separatorColor,
              },
            ]}
          >
            <View
              style={[
                styles.iconWrapper,
                {
                  backgroundColor: transactionColor + '1F',
                },
              ]}
            >
              <MaterialCommunityIcons
                name={transaction.icon as any}
                size={32}
                color={transactionColor}
              />
            </View>
            <RNText style={[styles.amountLabel, { color: palette.textSecondary }]}>
              {transaction.positive ? 'Amount Added' : 'Amount Withdrawn'}
            </RNText>
            <RNText style={[styles.amountValue, { color: transactionColor }]}>
              {transaction.positive ? '+' : '-'}
              {formatCurrency(Math.abs(transaction.amount))}
            </RNText>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)',
                },
              ]}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={14}
                color={isDark ? '#86EFAC' : '#16A34A'}
              />
              <RNText style={[styles.statusText, { color: isDark ? '#86EFAC' : '#16A34A' }]}>
                Completed
              </RNText>
            </View>
          </View>

          {/* Transaction Details */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Transaction Information
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
              {transactionDetails.map((detail, index) => (
                <React.Fragment key={detail.id}>
                  {index > 0 && <View style={[styles.divider, { backgroundColor: separatorColor }]} />}
                  <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                      <View style={[styles.detailIcon, { backgroundColor: featureTint }]}>
                        <MaterialCommunityIcons
                          name={detail.icon as any}
                          size={16}
                          color={palette.textSecondary}
                        />
                      </View>
                      <RNText style={[styles.detailLabel, { color: palette.textSecondary }]}>
                        {detail.label}
                      </RNText>
                    </View>
                    <RNText style={[styles.detailValue, { color: palette.text }]}>
                      {detail.value}
                    </RNText>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Description
            </RNText>
            <View
              style={[
                styles.descriptionCard,
                {
                  backgroundColor: cardBackground,
                  borderColor: separatorColor,
                },
              ]}
            >
              <RNText style={[styles.descriptionText, { color: palette.textSecondary }]}>
                {transaction.description}
              </RNText>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Pressable
              style={[
                styles.actionButton,
                {
                  backgroundColor: featureTint,
                  borderColor: separatorColor,
                },
              ]}
              onPress={() => {}}
            >
              <MaterialCommunityIcons name="download" size={20} color={palette.text} />
              <RNText style={[styles.actionButtonText, { color: palette.text }]}>
                Download Receipt
              </RNText>
            </Pressable>
            <Pressable
              style={[
                styles.actionButton,
                {
                  backgroundColor: featureTint,
                  borderColor: separatorColor,
                },
              ]}
              onPress={() => {}}
            >
              <MaterialCommunityIcons name="help-circle-outline" size={20} color={palette.text} />
              <RNText style={[styles.actionButtonText, { color: palette.text }]}>
                Get Support
              </RNText>
            </Pressable>
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
  shareButton: {
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
  amountCard: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.sm,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  amountLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  amountValue: {
    fontFamily: 'NeuzeitGro-ExtraBold',
    fontSize: 36,
    letterSpacing: -0.8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xs,
  },
  statusText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 12,
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
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
  },
  detailValue: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: theme.spacing.md + 32 + theme.spacing.sm,
  },
  descriptionCard: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.lg,
  },
  descriptionText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: theme.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md + 2,
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actionButtonText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
  },
});
