import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeMode } from '../theme/ThemeProvider';
import { theme } from '../theme/theme';
import { useRestriction } from '../hooks/useAuthV2';

interface RestrictionBannerProps {
  style?: any;
  showDetails?: boolean;
}

/**
 * Banner component that displays when user has transaction restrictions
 * (24-hour restriction after passcode/PIN change)
 */
export default function RestrictionBanner({
  style,
  showDetails = true,
}: RestrictionBannerProps) {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const { getRestrictionInfo } = useRestriction();

  const [restrictionInfo, setRestrictionInfo] = useState(getRestrictionInfo());

  // Update restriction info every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setRestrictionInfo(getRestrictionInfo());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [getRestrictionInfo]);

  // If no active restriction, don't show banner
  if (!restrictionInfo) {
    return null;
  }

  const warningColor = isDark ? '#FFA500' : '#FF8C00';
  const bgColor = isDark ? 'rgba(255, 165, 0, 0.15)' : 'rgba(255, 165, 0, 0.1)';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }, style]}>
      <View style={styles.content}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={24}
          color={warningColor}
        />
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { color: palette.text, fontFamily: 'NeuzeitGro-Bold' },
            ]}
          >
            Transaction Limit Active
          </Text>
          <Text
            style={[
              styles.message,
              { color: palette.textSecondary, fontFamily: 'NeuzeitGro-Regular' },
            ]}
          >
            Limit: {restrictionInfo.formattedLimit}
          </Text>
          {showDetails && (
            <Text
              style={[
                styles.details,
                { color: palette.textSecondary, fontFamily: 'NeuzeitGro-Regular' },
              ]}
            >
              Expires in {restrictionInfo.remainingHours}h {restrictionInfo.remainingMinutes}m
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  textContainer: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  title: {
    fontSize: 16,
    lineHeight: 20,
  },
  message: {
    fontSize: 14,
    lineHeight: 18,
  },
  details: {
    fontSize: 12,
    lineHeight: 16,
  },
});
