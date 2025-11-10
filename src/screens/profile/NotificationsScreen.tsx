import React, { useState, useMemo } from 'react';
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
import { Switch } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';

export default function NotificationsScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [savingsGoals, setSavingsGoals] = useState(true);
  const [giftRegistry, setGiftRegistry] = useState(true);
  const [transactions, setTransactions] = useState(true);
  const [promotions, setPromotions] = useState(false);

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';

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
            <RNText style={[styles.headerTitle, { color: palette.text }]}>Notifications</RNText>
            <View style={[styles.headerAccent, { backgroundColor: palette.primary }]} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomContentPadding }]}
          showsVerticalScrollIndicator={false}
        >
          {/* General Notifications */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              General
            </RNText>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: cardBackground,
                  borderColor: separatorColor,
                },
              ]}
            >
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <RNText style={[styles.settingLabel, { color: palette.text }]}>
                    Push Notifications
                  </RNText>
                  <RNText style={[styles.settingDescription, { color: palette.textSecondary }]}>
                    Receive notifications on your device
                  </RNText>
                </View>
                <Switch value={pushNotifications} onValueChange={setPushNotifications} />
              </View>

              <View style={[styles.divider, { backgroundColor: separatorColor }]} />

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <RNText style={[styles.settingLabel, { color: palette.text }]}>
                    Email Notifications
                  </RNText>
                  <RNText style={[styles.settingDescription, { color: palette.textSecondary }]}>
                    Receive updates via email
                  </RNText>
                </View>
                <Switch value={emailNotifications} onValueChange={setEmailNotifications} />
              </View>
            </View>
          </View>

          {/* Activity Notifications */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Activity
            </RNText>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: cardBackground,
                  borderColor: separatorColor,
                },
              ]}
            >
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <RNText style={[styles.settingLabel, { color: palette.text }]}>
                    Savings Goals
                  </RNText>
                  <RNText style={[styles.settingDescription, { color: palette.textSecondary }]}>
                    Updates on your savings progress
                  </RNText>
                </View>
                <Switch value={savingsGoals} onValueChange={setSavingsGoals} />
              </View>

              <View style={[styles.divider, { backgroundColor: separatorColor }]} />

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <RNText style={[styles.settingLabel, { color: palette.text }]}>
                    Gift Registry
                  </RNText>
                  <RNText style={[styles.settingDescription, { color: palette.textSecondary }]}>
                    When someone sends you a gift
                  </RNText>
                </View>
                <Switch value={giftRegistry} onValueChange={setGiftRegistry} />
              </View>

              <View style={[styles.divider, { backgroundColor: separatorColor }]} />

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <RNText style={[styles.settingLabel, { color: palette.text }]}>
                    Transactions
                  </RNText>
                  <RNText style={[styles.settingDescription, { color: palette.textSecondary }]}>
                    Payment and transaction alerts
                  </RNText>
                </View>
                <Switch value={transactions} onValueChange={setTransactions} />
              </View>
            </View>
          </View>

          {/* Marketing */}
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: palette.text }]}>
              Marketing
            </RNText>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: cardBackground,
                  borderColor: separatorColor,
                },
              ]}
            >
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <RNText style={[styles.settingLabel, { color: palette.text }]}>
                    Promotions & Updates
                  </RNText>
                  <RNText style={[styles.settingDescription, { color: palette.textSecondary }]}>
                    Special offers and news
                  </RNText>
                </View>
                <Switch value={promotions} onValueChange={setPromotions} />
              </View>
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
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  card: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  settingInfo: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  settingLabel: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
  },
  settingDescription: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
