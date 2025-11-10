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

export default function PaymentMethodsScreen() {
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

  const paymentMethods = useMemo(
    () => [
      {
        id: '1',
        type: 'card',
        name: 'Visa •••• 4242',
        icon: 'credit-card',
        isDefault: true,
      },
      {
        id: '2',
        type: 'bank',
        name: 'GTBank •••• 7890',
        icon: 'bank',
        isDefault: false,
      },
    ],
    []
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
            <RNText style={[styles.headerTitle, { color: palette.text }]}>Payment Methods</RNText>
            <View style={[styles.headerAccent, { backgroundColor: palette.primary }]} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomContentPadding }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Payment Methods List */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Saved Payment Methods
            </RNText>
            <View style={styles.methodsList}>
              {paymentMethods.map((method) => (
                <View
                  key={method.id}
                  style={[
                    styles.methodCard,
                    {
                      backgroundColor: cardBackground,
                      borderColor: separatorColor,
                    },
                  ]}
                >
                  <View style={[styles.methodIcon, { backgroundColor: palette.primary + '1F' }]}>
                    <MaterialCommunityIcons
                      name={method.icon as any}
                      size={24}
                      color={palette.primary}
                    />
                  </View>
                  <View style={styles.methodInfo}>
                    <RNText style={[styles.methodName, { color: palette.text }]}>
                      {method.name}
                    </RNText>
                    {method.isDefault && (
                      <View style={[styles.defaultBadge, { backgroundColor: palette.primary + '1F' }]}>
                        <RNText style={[styles.defaultText, { color: palette.primary }]}>
                          Default
                        </RNText>
                      </View>
                    )}
                  </View>
                  <Pressable>
                    <MaterialCommunityIcons
                      name="dots-vertical"
                      size={20}
                      color={palette.textSecondary}
                    />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>

          {/* Add Payment Method */}
          <Pressable
            style={[styles.addButton, { backgroundColor: palette.primary }]}
            onPress={() => {}}
          >
            <MaterialCommunityIcons name="plus-circle" size={20} color="#FFFFFF" />
            <RNText style={styles.addButtonText}>Add Payment Method</RNText>
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
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  methodsList: {
    gap: theme.spacing.sm,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  methodName: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  defaultText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 11,
  },
  addButton: {
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
  addButtonText: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
