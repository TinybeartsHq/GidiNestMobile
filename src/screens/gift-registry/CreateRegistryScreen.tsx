import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text as RNText,
  Platform,
  TextInput,
  Alert,
  Share,
  ActivityIndicator,
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

type CreateRegistryNavigationProp = NativeStackNavigationProp<CommunityStackParamList, 'CreateRegistry'>;

export default function CreateRegistryScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<CreateRegistryNavigationProp>();

  const { createEventLink, createWalletLink, createLoading } = usePaymentLinks();

  const [selectedType, setSelectedType] = useState<'shower' | 'dedication' | 'everyday' | null>(null);
  const [title, setTitle] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';

  const registryTypes = useMemo(
    () => [
      {
        key: 'shower',
        icon: 'baby-carriage',
        title: 'Baby Shower',
        description: 'Celebrate with friends before baby arrives',
        color: isDark ? '#FDE68A' : '#D97706',
      },
      {
        key: 'dedication',
        icon: 'hands-pray',
        title: 'Baby Dedication',
        description: 'Naming ceremony or dedication celebration',
        color: isDark ? '#C4B5FD' : '#7C3AED',
      },
      {
        key: 'everyday',
        icon: 'heart-outline',
        title: 'Everyday Support',
        description: 'Ongoing contributions with no expiry',
        color: isDark ? '#6EE7B7' : '#059669',
      },
    ],
    [isDark]
  );

  const bottomContentPadding = useMemo(
    () => insets.bottom + (Platform.OS === 'ios' ? 140 : 120),
    [insets.bottom]
  );

  const canGenerate = selectedType && title.trim().length > 0 && !createLoading;

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

      navigation.goBack();
    } catch (error) {
      console.error('Error sharing link:', error);
      navigation.goBack();
    }
  };

  const handleGenerateLink = async () => {
    if (!canGenerate) return;

    try {
      let result;

      if (selectedType === 'shower' || selectedType === 'dedication') {
        // Create event link for baby shower or dedication
        result = await createEventLink({
          event_name: title,
          event_date: expiryDate || undefined,
          description: customMessage || undefined,
          custom_message: customMessage || undefined,
          show_contributors: 'public',
          link_to_goal: false,
        }).unwrap();
      } else {
        // Create wallet link for everyday support
        result = await createWalletLink({
          description: title,
          custom_message: customMessage || undefined,
          show_contributors: 'public',
        }).unwrap();
      }

      // Show success with share option
      Alert.alert(
        'Registry Created! 🎉',
        'Your gift registry link has been generated. Would you like to share it now?',
        [
          {
            text: 'Share Now',
            onPress: () => handleShareLink(result),
          },
          {
            text: 'Later',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message || 'Failed to create registry. Please try again.'
      );
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
              Create Registry
            </RNText>
            <View style={[styles.headerAccent, { backgroundColor: '#EC4899' }]} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomContentPadding }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Step 1: Select Type */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              What's the occasion?
            </RNText>
            <View style={styles.typesGrid}>
              {registryTypes.map((type) => (
                <Pressable
                  key={type.key}
                  style={[
                    styles.typeCard,
                    {
                      backgroundColor: selectedType === type.key ? type.color + '1F' : cardBackground,
                      borderColor:
                        selectedType === type.key ? type.color : separatorColor,
                      borderWidth: selectedType === type.key ? 2 : StyleSheet.hairlineWidth,
                    },
                  ]}
                  onPress={() => setSelectedType(type.key as any)}
                >
                  <View
                    style={[
                      styles.typeIcon,
                      {
                        backgroundColor: selectedType === type.key ? type.color : type.color + '1F',
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={type.icon as any}
                      size={28}
                      color={selectedType === type.key ? '#FFFFFF' : type.color}
                    />
                  </View>
                  <RNText style={[styles.typeTitle, { color: palette.text }]}>
                    {type.title}
                  </RNText>
                  <RNText style={[styles.typeDescription, { color: palette.textSecondary }]}>
                    {type.description}
                  </RNText>
                  {selectedType === type.key && (
                    <View style={[styles.checkBadge, { backgroundColor: type.color }]}>
                      <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Step 2: Registry Details */}
          {selectedType && (
            <>
              <View style={styles.section}>
                <RNText style={[styles.sectionTitle, { color: palette.text }]}>
                  Registry details
                </RNText>

                <View style={styles.inputGroup}>
                  <RNText style={[styles.inputLabel, { color: palette.text }]}>
                    Registry name
                  </RNText>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: featureTint,
                        borderColor: separatorColor,
                        color: palette.text,
                      },
                    ]}
                    placeholder="e.g., Baby Shower - December 2024"
                    placeholderTextColor={palette.textSecondary}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>

                {selectedType !== 'everyday' && (
                  <View style={styles.inputGroup}>
                    <RNText style={[styles.inputLabel, { color: palette.text }]}>
                      Expiry date
                    </RNText>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: featureTint,
                          borderColor: separatorColor,
                          color: palette.text,
                        },
                      ]}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor={palette.textSecondary}
                      value={expiryDate}
                      onChangeText={setExpiryDate}
                    />
                    <RNText style={[styles.inputHint, { color: palette.textSecondary }]}>
                      Link will expire after this date
                    </RNText>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <RNText style={[styles.inputLabel, { color: palette.text }]}>
                    Custom message (optional)
                  </RNText>
                  <TextInput
                    style={[
                      styles.textArea,
                      {
                        backgroundColor: featureTint,
                        borderColor: separatorColor,
                        color: palette.text,
                      },
                    ]}
                    placeholder="Add a personal message for your contributors..."
                    placeholderTextColor={palette.textSecondary}
                    multiline
                    numberOfLines={3}
                    value={customMessage}
                    onChangeText={setCustomMessage}
                  />
                </View>

                {selectedType === 'everyday' && (
                  <View
                    style={[
                      styles.infoCard,
                      {
                        backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(5,150,105,0.06)',
                        borderColor: isDark ? 'rgba(110,231,183,0.3)' : 'rgba(5,150,105,0.2)',
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name="information" size={20} color="#059669" />
                    <RNText style={[styles.infoText, { color: palette.textSecondary }]}>
                      This link will remain active indefinitely for ongoing support.
                    </RNText>
                  </View>
                )}
              </View>

              {/* Preview Section */}
              <View style={styles.section}>
                <RNText style={[styles.sectionTitle, { color: palette.text }]}>
                  Preview
                </RNText>
                <View
                  style={[
                    styles.previewCard,
                    {
                      backgroundColor: isDark ? 'rgba(236,72,153,0.1)' : 'rgba(236,72,153,0.06)',
                      borderColor: isDark ? 'rgba(244,114,182,0.3)' : 'rgba(236,72,153,0.2)',
                    },
                  ]}
                >
                  <View style={[styles.previewIcon, { backgroundColor: '#EC4899' }]}>
                    <MaterialCommunityIcons name="gift" size={24} color="#FFFFFF" />
                  </View>
                  <RNText style={[styles.previewTitle, { color: palette.text }]}>
                    {title || 'Your registry name'}
                  </RNText>
                  <RNText style={[styles.previewSubtitle, { color: palette.textSecondary }]}>
                    {selectedType === 'everyday'
                      ? 'Ongoing contributions'
                      : expiryDate
                      ? `Expires ${expiryDate}`
                      : 'Set expiry date above'}
                  </RNText>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Generate Button */}
        {selectedType && (
          <View
            style={[
              styles.footer,
              {
                backgroundColor: palette.background,
                borderTopColor: separatorColor,
                paddingBottom: insets.bottom + (Platform.OS === 'ios' ? 80 : 100),
              },
            ]}
          >
            <Pressable
              style={[
                styles.generateButton,
                {
                  backgroundColor: canGenerate ? '#EC4899' : separatorColor,
                },
              ]}
              disabled={!canGenerate}
              onPress={handleGenerateLink}
            >
              {createLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="link-variant"
                    size={20}
                    color={canGenerate ? '#FFFFFF' : palette.textSecondary}
                  />
                  <RNText
                    style={[
                      styles.generateButtonText,
                      { color: canGenerate ? '#FFFFFF' : palette.textSecondary },
                    ]}
                  >
                    Generate Link
                  </RNText>
                </>
              )}
            </Pressable>
          </View>
        )}
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
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  typesGrid: {
    gap: theme.spacing.sm,
  },
  typeCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    position: 'relative',
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
  },
  typeDescription: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  checkBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    gap: theme.spacing.xs,
  },
  inputLabel: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
  input: {
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 15,
  },
  textArea: {
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
    marginTop: theme.spacing.xs / 2,
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
  previewCard: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  previewIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  previewTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
    textAlign: 'center',
  },
  previewSubtitle: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  generateButton: {
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
  generateButtonText: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
  },
});
