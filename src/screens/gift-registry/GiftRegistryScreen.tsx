import React, { useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text as RNText,
  Platform,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import type { CommunityStackParamList } from '../../navigation/CommunityNavigator';
import { usePaymentLinks } from '../../hooks/usePaymentLinks';
import type { PaymentLink } from '../../services/paymentLinksService';

const formatCurrency = (value: number) => {
  return `₦${value.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

type GiftRegistryNavigationProp = NativeStackNavigationProp<CommunityStackParamList, 'GiftRegistry'>;

export default function GiftRegistryScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<GiftRegistryNavigationProp>();

  const { links, linksLoading, getMyLinks } = usePaymentLinks();

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';

  useEffect(() => {
    getMyLinks();
  }, []);

  const features = useMemo(
    () => [
      {
        icon: 'link-variant',
        title: 'Shareable Links',
        description: 'Create unique links to share with family and friends',
      },
      {
        icon: 'calendar-heart',
        title: 'Special Occasions',
        description: 'Perfect for baby showers, dedications, and naming ceremonies',
      },
      {
        icon: 'clock-check',
        title: 'Flexible Duration',
        description: 'Set expiration dates or keep links active anytime',
      },
      {
        icon: 'account-multiple',
        title: 'Track Contributors',
        description: 'See who contributed and read their heartfelt messages',
      },
    ],
    []
  );

  const handleShareLink = async (link: PaymentLink) => {
    try {
      const message = `
${link.event_name || link.description || 'Support My Baby Journey'}

${link.custom_message || ''}

View and contribute: ${link.shareable_url || `https://app.gidinest.com/pay/${link.token}`}

Pay to:
Account: ${link.account_number}
Bank: ${link.bank_name}
Reference: PL-${link.token}-{timestamp}
      `.trim();

      await Share.share({
        message,
        title: link.event_name || 'Gift Registry',
      });
    } catch (error) {
      console.error('Error sharing link:', error);
    }
  };

  const formatExpiryDate = (expiresAt?: string) => {
    if (!expiresAt) return 'No expiry';
    const date = new Date(expiresAt);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const bottomContentPadding = useMemo(
    () => insets.bottom + (Platform.OS === 'ios' ? 120 : 108),
    [insets.bottom]
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
            <RNText style={[styles.headerTitle, { color: palette.text }]}>
              Gift Registry
            </RNText>
            <View style={[styles.headerAccent, { backgroundColor: '#EC4899' }]} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomContentPadding }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: isDark ? 'rgba(236,72,153,0.1)' : 'rgba(236,72,153,0.06)',
                borderColor: isDark ? 'rgba(244,114,182,0.3)' : 'rgba(236,72,153,0.2)',
              },
            ]}
          >
            <View style={[styles.heroIcon, { backgroundColor: '#EC4899' }]}>
              <MaterialCommunityIcons name="gift" size={40} color="#FFFFFF" />
            </View>
            <RNText style={[styles.heroTitle, { color: palette.text }]}>
              Let Loved Ones Celebrate Your Baby
            </RNText>
            <RNText style={[styles.heroDescription, { color: palette.textSecondary }]}>
              Create personalized gift registries for baby showers, dedications, or everyday
              contributions. Family and friends can send gifts directly to support your baby's arrival.
            </RNText>
          </View>

          {/* Features Grid */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              How it works
            </RNText>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <View
                  key={index}
                  style={[
                    styles.featureCard,
                    {
                      backgroundColor: cardBackground,
                      borderColor: separatorColor,
                    },
                  ]}
                >
                  <View style={[styles.featureIcon, { backgroundColor: '#EC4899' + '1F' }]}>
                    <MaterialCommunityIcons name={feature.icon as any} size={24} color="#EC4899" />
                  </View>
                  <RNText style={[styles.featureTitle, { color: palette.text }]}>
                    {feature.title}
                  </RNText>
                  <RNText style={[styles.featureDescription, { color: palette.textSecondary }]}>
                    {feature.description}
                  </RNText>
                </View>
              ))}
            </View>
          </View>

          {/* My Registries */}
          {linksLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#EC4899" />
              <RNText style={[styles.loadingText, { color: palette.textSecondary }]}>
                Loading your registries...
              </RNText>
            </View>
          ) : links.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <RNText style={[styles.sectionTitle, { color: palette.text }]}>
                  My registries
                </RNText>
                <RNText style={[styles.viewAllText, { color: '#EC4899' }]}>
                  {links.length} {links.length === 1 ? 'link' : 'links'}
                </RNText>
              </View>

              <View style={styles.registriesList}>
                {links.slice(0, 5).map((link) => (
                  <Pressable
                    key={link.id}
                    style={[
                      styles.registryCard,
                      {
                        backgroundColor: cardBackground,
                        borderColor: separatorColor,
                      },
                    ]}
                    onPress={() => handleShareLink(link)}
                  >
                    <View style={styles.registryHeader}>
                      <View style={styles.registryInfo}>
                        <RNText style={[styles.registryTitle, { color: palette.text }]}>
                          {link.event_name || link.description || 'Gift Registry'}
                        </RNText>
                        <View style={styles.registryMeta}>
                          <View style={styles.registryMetaItem}>
                            <MaterialCommunityIcons
                              name="account-multiple"
                              size={14}
                              color={palette.textSecondary}
                            />
                            <RNText style={[styles.registryMetaText, { color: palette.textSecondary }]}>
                              {link.contribution_count} contributor{link.contribution_count !== 1 ? 's' : ''}
                            </RNText>
                          </View>
                          <View style={styles.registryMetaItem}>
                            <MaterialCommunityIcons
                              name="clock-outline"
                              size={14}
                              color={palette.textSecondary}
                            />
                            <RNText style={[styles.registryMetaText, { color: palette.textSecondary }]}>
                              {formatExpiryDate(link.expires_at)}
                            </RNText>
                          </View>
                        </View>
                      </View>
                      <MaterialCommunityIcons name="share-variant" size={20} color="#EC4899" />
                    </View>
                    <View style={[styles.registryStats, { borderTopColor: separatorColor }]}>
                      <RNText style={[styles.registryAmount, { color: '#EC4899' }]}>
                        {formatCurrency(link.total_raised)} received
                      </RNText>
                      {link.target_amount && link.target_amount > 0 && (
                        <RNText style={[styles.registryTarget, { color: palette.textSecondary }]}>
                          of {formatCurrency(link.target_amount)}
                        </RNText>
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {/* Create Registry Button */}
          <Pressable
            style={[styles.createButton, { backgroundColor: '#EC4899' }]}
            onPress={() => navigation.navigate('CreateRegistry')}
          >
            <MaterialCommunityIcons name="plus-circle" size={22} color="#FFFFFF" />
            <RNText style={styles.createButtonText}>Create Gift Registry</RNText>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  viewAllText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 13,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  featureCard: {
    width: '48%',
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
  featureDescription: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  registriesList: {
    gap: theme.spacing.sm,
  },
  registryCard: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  registryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  registryInfo: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  registryTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
  },
  registryMeta: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  registryMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  registryMetaText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
  },
  registryStats: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  registryAmount: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 15,
  },
  registryTarget: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    marginTop: theme.spacing.xs / 2,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 2,
    gap: theme.spacing.md,
  },
  loadingText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
  },
  createButton: {
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
  createButtonText: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
