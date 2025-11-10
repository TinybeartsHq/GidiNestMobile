import React, { useMemo, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text as RNText,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';

const formatDate = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return 'Earlier';
  }
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export default function NotificationsScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const animationRefs = useRef<{ [key: string]: Animated.Value }>({});

  const [notifications, setNotifications] = useState(() => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(14, 30);
    const today2 = new Date(now);
    today2.setHours(10, 15);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(16, 45);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(9, 20);
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(15, 0);

    return [
      {
        id: 'notif-1',
        title: 'Savings goal achieved! 🎉',
        message: 'You have reached 50% of your Hospital Bills goal. Keep it up!',
        timestamp: today,
        icon: 'trophy',
        iconColor: isDark ? '#FDE68A' : '#D97706',
        iconBg: isDark ? 'rgba(251,191,36,0.15)' : 'rgba(217, 119, 6, 0.1)',
        read: false,
      },
      {
        id: 'notif-2',
        title: 'New gift received',
        message: 'Sarah contributed ₦25,000 to your Baby Essentials fund',
        timestamp: today2,
        icon: 'gift',
        iconColor: isDark ? '#F9A8D4' : '#EC4899',
        iconBg: isDark ? 'rgba(236,72,153,0.15)' : 'rgba(236, 72, 153, 0.1)',
        read: false,
      },
      {
        id: 'notif-3',
        title: 'Payment successful',
        message: 'Your contribution of ₦50,000 to Hospital Bills has been processed',
        timestamp: yesterday,
        icon: 'check-circle',
        iconColor: isDark ? '#6EE7B7' : '#059669',
        iconBg: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(5,150,105,0.1)',
        read: true,
      },
      {
        id: 'notif-4',
        title: 'Reminder: Monthly contribution',
        message: 'Do not forget your monthly savings goal of ₦100,000',
        timestamp: twoDaysAgo,
        icon: 'calendar-alert',
        iconColor: isDark ? '#C4B5FD' : '#7C3AED',
        iconBg: isDark ? 'rgba(147,51,234,0.15)' : 'rgba(124, 58, 237, 0.1)',
        read: true,
      },
      {
        id: 'notif-5',
        title: 'New milestone unlocked',
        message: 'You have saved for 3 consecutive months! Amazing progress!',
        timestamp: threeDaysAgo,
        icon: 'star',
        iconColor: isDark ? '#FDE68A' : '#D97706',
        iconBg: isDark ? 'rgba(251,191,36,0.15)' : 'rgba(217, 119, 6, 0.1)',
        read: true,
      },
    ];
  });

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';

  const bottomContentPadding = useMemo(
    () => insets.bottom + (Platform.OS === 'ios' ? 120 : 108),
    [insets.bottom]
  );

  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: typeof notifications } = {};

    notifications.forEach((notif) => {
      const dateKey = formatDate(notif.timestamp);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(notif);
    });

    return groups;
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Initialize animation values for new notifications
  notifications.forEach((notif) => {
    if (!animationRefs.current[notif.id]) {
      animationRefs.current[notif.id] = new Animated.Value(1);
    }
  });

  const animateRemove = (id: string, onComplete: () => void) => {
    const animation = animationRefs.current[id];
    if (!animation) return;

    Animated.parallel([
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      delete animationRefs.current[id];
      onComplete();
    });
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const handleRemoveNotification = (id: string) => {
    setRemovingIds((prev) => new Set(prev).add(id));
    animateRemove(id, () => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    });
  };

  const handleClearAll = () => {
    const allIds = notifications.map((n) => n.id);
    setRemovingIds(new Set(allIds));

    // Stagger the animations slightly
    allIds.forEach((id, index) => {
      setTimeout(() => {
        animateRemove(id, () => {
          setRemovingIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        });
      }, index * 50);
    });

    // Clear all after animations complete
    setTimeout(() => {
      setNotifications([]);
    }, allIds.length * 50 + 300);
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
              Notifications
            </RNText>
            <View style={[styles.headerAccent, { backgroundColor: palette.primary }]} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Actions Bar */}
        {notifications.length > 0 && (
          <View style={styles.actionsBar}>
            {unreadCount > 0 && (
              <Pressable
                style={[styles.actionButton, { backgroundColor: featureTint }]}
                onPress={handleMarkAllAsRead}
              >
                <MaterialCommunityIcons name="check-all" size={16} color={palette.primary} />
                <RNText style={[styles.actionButtonText, { color: palette.primary }]}>
                  Mark all read
                </RNText>
              </Pressable>
            )}
            <Pressable
              style={[styles.actionButton, { backgroundColor: featureTint }]}
              onPress={handleClearAll}
            >
              <MaterialCommunityIcons name="delete-outline" size={16} color={palette.textSecondary} />
              <RNText style={[styles.actionButtonText, { color: palette.textSecondary }]}>
                Clear all
              </RNText>
            </Pressable>
          </View>
        )}

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomContentPadding }]}
          showsVerticalScrollIndicator={false}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: featureTint }]}>
                <MaterialCommunityIcons name="bell-outline" size={48} color={palette.textSecondary} />
              </View>
              <RNText style={[styles.emptyTitle, { color: palette.text }]}>
                No notifications yet
              </RNText>
              <RNText style={[styles.emptyMessage, { color: palette.textSecondary }]}>
                We'll notify you when something important happens
              </RNText>
            </View>
          ) : (
            Object.entries(groupedNotifications).map(([dateKey, notifs]) => (
              <View key={dateKey} style={styles.dateGroup}>
                <RNText style={[styles.dateHeader, { color: palette.textSecondary }]}>
                  {dateKey}
                </RNText>
                <View style={styles.notificationsStack}>
                  {notifs.map((notif) => {
                    const animation = animationRefs.current[notif.id];
                    const isRemoving = removingIds.has(notif.id);

                    return (
                      <Animated.View
                        key={notif.id}
                        style={[
                          {
                            opacity: animation,
                            transform: [
                              {
                                translateX: animation?.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [300, 0],
                                }) || 0,
                              },
                              {
                                scale: animation?.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0.8, 1],
                                }) || 1,
                              },
                            ],
                          },
                        ]}
                      >
                        <Pressable
                          style={({ pressed }) => [
                            styles.notificationCard,
                            {
                              backgroundColor: notif.read ? cardBackground : (isDark ? 'rgba(59,130,246,0.05)' : 'rgba(59,130,246,0.03)'),
                              ...(Platform.OS === 'ios' && {
                                borderColor: notif.read ? separatorColor : (isDark ? 'rgba(147,197,253,0.15)' : 'rgba(59,130,246,0.1)'),
                              }),
                              transform: [{ scale: pressed ? 0.98 : 1 }],
                              opacity: pressed ? 0.9 : 1,
                            },
                          ]}
                          onPress={() => handleMarkAsRead(notif.id)}
                          disabled={isRemoving}
                        >
                          <View style={[styles.notificationIcon, { backgroundColor: notif.iconBg }]}>
                            <MaterialCommunityIcons
                              name={notif.icon as any}
                              size={22}
                              color={notif.iconColor}
                            />
                          </View>
                          <View style={styles.notificationContent}>
                            <View style={styles.notificationHeader}>
                              <RNText
                                style={[
                                  styles.notificationTitle,
                                  { color: palette.text },
                                  !notif.read && { fontFamily: 'NeuzeitGro-Bold' },
                                ]}
                              >
                                {notif.title}
                              </RNText>
                              {!notif.read && (
                                <View style={[styles.unreadDot, { backgroundColor: palette.primary }]} />
                              )}
                            </View>
                            <RNText style={[styles.notificationMessage, { color: palette.textSecondary }]}>
                              {notif.message}
                            </RNText>
                            <RNText style={[styles.notificationTime, { color: palette.textSecondary }]}>
                              {formatTime(notif.timestamp)}
                            </RNText>
                          </View>
                          <Pressable
                            style={styles.deleteButton}
                            onPress={() => handleRemoveNotification(notif.id)}
                          >
                            <MaterialCommunityIcons
                              name="close-circle"
                              size={20}
                              color={palette.textSecondary}
                            />
                          </Pressable>
                        </Pressable>
                      </Animated.View>
                    );
                  })}
                </View>
              </View>
            ))
          )}
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
  actionsBar: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  actionButtonText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 12,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  dateGroup: {
    gap: theme.spacing.sm,
  },
  dateHeader: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notificationsStack: {
    gap: theme.spacing.xs,
  },
  notificationCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: Platform.OS === 'ios' ? StyleSheet.hairlineWidth : 0,
    ...(Platform.OS === 'ios' && {
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    }),
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.xs,
  },
  notificationTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 15,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationMessage: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  notificationTime: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 11,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 3,
    gap: theme.spacing.md,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
  },
  emptyMessage: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  deleteButton: {
    padding: theme.spacing.xs / 2,
  },
});
