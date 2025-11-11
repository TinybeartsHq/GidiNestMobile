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

export default function SelectVerificationMethodScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';

  const bottomContentPadding = useMemo(
    () => insets.bottom + (Platform.OS === 'ios' ? 120 : 108),
    [insets.bottom]
  );

  const verificationMethods = useMemo(
    () => [
      {
        id: 'bvn',
        type: 'bvn',
        name: 'Bank Verification Number',
        shortName: 'BVN',
        description: 'Verify your identity with your 11-digit BVN',
        icon: 'bank',
        color: isDark ? '#6EE7B7' : '#059669',
        background: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(5,150,105,0.1)',
      },
      {
        id: 'nin',
        type: 'nin',
        name: 'National Identity Number',
        shortName: 'NIN',
        description: 'Verify your identity with your NIN',
        icon: 'card-account-details',
        color: isDark ? '#93C5FD' : '#2563EB',
        background: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(37,99,235,0.1)',
      },
    ],
    [isDark]
  );

  const handleSelectMethod = (type: string) => {
    if (type === 'bvn') {
      // @ts-ignore
      navigation.navigate('BVNVerification');
    } else if (type === 'nin') {
      // @ts-ignore
      navigation.navigate('NINVerification');
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
              Verify Your Account
            </RNText>
            <View style={[styles.headerAccent, { backgroundColor: palette.primary }]} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomContentPadding }]}
          showsVerticalScrollIndicator={false}
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
              <MaterialCommunityIcons name="shield-check" size={20} color={palette.primary} />
            </View>
            <RNText style={[styles.infoText, { color: palette.text }]}>
              Select your preferred verification method. Your information will be kept secure and
              private.
            </RNText>
          </View>

          {/* Verification Methods */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Choose Verification Method
            </RNText>
            <View style={styles.methodsList}>
              {verificationMethods.map((method) => (
                <Pressable
                  key={method.id}
                  style={({ pressed }) => [
                    styles.methodCard,
                    {
                      backgroundColor: method.background,
                      ...(Platform.OS === 'ios' && { borderColor: separatorColor }),
                      opacity: pressed ? 0.9 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                  onPress={() => handleSelectMethod(method.type)}
                >
                  <View
                    style={[
                      styles.methodIcon,
                      { backgroundColor: method.color + '1F' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={method.icon as any}
                      size={28}
                      color={method.color}
                    />
                  </View>
                  <View style={styles.methodInfo}>
                    <RNText style={[styles.methodName, { color: palette.text }]}>
                      {method.name}
                    </RNText>
                    <RNText style={[styles.methodShortName, { color: method.color }]}>
                      {method.shortName}
                    </RNText>
                    <RNText style={[styles.methodDescription, { color: palette.textSecondary }]}>
                      {method.description}
                    </RNText>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={palette.textSecondary}
                  />
                </Pressable>
              ))}
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
  methodsList: {
    gap: theme.spacing.md,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.xl,
    borderWidth: Platform.OS === 'ios' ? StyleSheet.hairlineWidth : 0,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...(Platform.OS === 'ios' && {
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    }),
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  methodName: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 16,
  },
  methodShortName: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  methodDescription: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
});
