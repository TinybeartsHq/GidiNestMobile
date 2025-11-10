import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useThemeMode } from '../theme/ThemeProvider';
import { theme } from '../theme/theme';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import SavingsScreen from '../screens/savings/SavingsScreen';
import CommunityNavigator from './CommunityNavigator';
import TransactionsScreen from '../screens/transactions/TransactionsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const TAB_CONFIG: Record<
  string,
  { label: string; activeIcon: string; inactiveIcon: string }
> = {
  Dashboard: {
    label: 'Home',
    activeIcon: 'home-variant',
    inactiveIcon: 'home-variant-outline',
  },
  Savings: {
    label: 'Savings',
    activeIcon: 'wallet',
    inactiveIcon: 'wallet-outline',
  },
  Transactions: {
    label: 'Activity',
    activeIcon: 'chart-line',
    inactiveIcon: 'chart-line-variant',
  },
  Community: {
    label: 'Community',
    activeIcon: 'account-group',
    inactiveIcon: 'account-group-outline',
  },
  Profile: {
    label: 'Profile',
    activeIcon: 'account-circle',
    inactiveIcon: 'account-circle-outline',
  },
};

const clamp = (value: number, min: number, max: number) => {
  'worklet';
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

function AnimatedTabBar({ state, descriptors, navigation }: any) {
  const { width: windowWidth } = useWindowDimensions();
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();

  const tabCount = state.routes.length || 1;
  const horizontalInset = 0;
  const containerWidth = windowWidth;
  const containerRadius = 28;
  const horizontalPadding = theme.spacing.lg;
  const availableWidth = Math.max(containerWidth - horizontalPadding * 2, tabCount ? tabCount * 48 : containerWidth);
  const tabWidth = availableWidth / tabCount;
  const tabsVerticalPadding = Platform.OS === 'ios' ? 4 : 3;
  const indicatorDiameter = Math.min(
    tabWidth - (Platform.OS === 'ios' ? theme.spacing.sm * 1.3 : theme.spacing.sm * 0.95),
    Platform.OS === 'ios' ? 45 : 48
  );
  const indicatorWidth = indicatorDiameter;
  const indicatorHeight = indicatorDiameter;
  const indicatorRadius = indicatorDiameter / 2;
  const indicatorInset = horizontalPadding + (tabWidth - indicatorDiameter) / 2;
  const indicatorVerticalOffset = Platform.OS === 'ios' ? tabsVerticalPadding + 11 : tabsVerticalPadding + 17;
  const maxTranslate = Math.max((tabCount - 1) * tabWidth, 0);

  const translateX = useRef(new Animated.Value(state.index * tabWidth)).current;

  const latestTranslate = useRef(state.index * tabWidth);
  const dragStartTranslate = useRef(state.index * tabWidth);

  useEffect(() => {
    const listenerId = translateX.addListener(({ value }) => {
      latestTranslate.current = value;
    });
    return () => {
      translateX.removeListener(listenerId);
    };
  }, [translateX]);

  useEffect(() => {
    const target = state.index * tabWidth;
    dragStartTranslate.current = target;
    latestTranslate.current = target;
    Animated.spring(translateX, {
      toValue: target,
      useNativeDriver: true,
      damping: 18,
      mass: 0.78,
      stiffness: 220,
    }).start();
  }, [state.index, tabWidth, translateX]);

  const TabBackground = Platform.OS === 'ios' ? BlurView : View;
  const backgroundTint = Platform.select({
    ios: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)',
    android: isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.88)',
    default: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
  });
  const backgroundBorder = Platform.select({
    ios: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.1)',
    android: isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(148, 163, 184, 0.14)',
    default: isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(148, 163, 184, 0.12)',
  });
  const indicatorFill = isDark ? 'rgba(255,255,255,0.96)' : palette.primary;
  const indicatorShadow = isDark ? '#1f2937' : palette.primary;
  const activeIconColor = isDark ? palette.primary : '#FFFFFF';
  const activeLabelColor = isDark ? palette.primary : '#FFFFFF';

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {
      // noop if haptics unavailable
    });
  }, []);

  const goToIndex = useCallback(
    (targetIndex: number) => {
      const clampedIndex = clamp(targetIndex, 0, tabCount - 1);
      const route = state.routes[clampedIndex];
      if (!route) return;

      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!event.defaultPrevented && clampedIndex !== state.index) {
        triggerHaptic();
        navigation.navigate(route.name);
      }
    },
    [navigation, state.index, state.routes, tabCount, triggerHaptic]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 6,
        onPanResponderGrant: () => {
          translateX.stopAnimation();
          dragStartTranslate.current = latestTranslate.current;
        },
        onPanResponderMove: (_, gestureState) => {
          const next = clamp(dragStartTranslate.current + gestureState.dx, 0, maxTranslate);
          translateX.setValue(next);
          latestTranslate.current = next;
        },
        onPanResponderRelease: (_, gestureState) => {
          const raw = clamp(dragStartTranslate.current + gestureState.dx, 0, maxTranslate);
          const finalIndex = clamp(Math.round(raw / tabWidth), 0, tabCount - 1);
          const finalOffset = finalIndex * tabWidth;
          dragStartTranslate.current = finalOffset;
          latestTranslate.current = finalOffset;

          Animated.spring(translateX, {
            toValue: finalOffset,
            useNativeDriver: true,
            damping: 18,
            mass: 0.78,
            stiffness: 220,
            velocity: gestureState.vx,
          }).start();

          if (finalIndex !== state.index) {
            const route = state.routes[finalIndex];
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!event.defaultPrevented) {
              triggerHaptic();
              navigation.navigate(route.name);
            }
          }
        },
        onPanResponderTerminationRequest: () => true,
        onPanResponderTerminate: (_, gestureState) => {
          const raw = clamp(dragStartTranslate.current + gestureState.dx, 0, maxTranslate);
          const finalIndex = clamp(Math.round(raw / tabWidth), 0, tabCount - 1);
          const finalOffset = finalIndex * tabWidth;
          dragStartTranslate.current = finalOffset;
          latestTranslate.current = finalOffset;

          Animated.spring(translateX, {
            toValue: finalOffset,
            useNativeDriver: true,
            damping: 18,
            mass: 0.78,
            stiffness: 220,
          }).start();

          if (finalIndex !== state.index) {
            const route = state.routes[finalIndex];
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!event.defaultPrevented) {
              triggerHaptic();
              navigation.navigate(route.name);
            }
          }
        },
      }),
    [maxTranslate, navigation, state.index, state.routes, tabCount, tabWidth, translateX, triggerHaptic]
  );

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.tabBarContainer,
        {
          paddingBottom: Math.max(insets.bottom + 4, 16),
          paddingTop: tabsVerticalPadding,
          paddingHorizontal: horizontalInset,
        },
      ]}
    >
      <TabBackground
        intensity={Platform.OS === 'ios' ? 90 : 80}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.tabBackground,
          {
            borderRadius: containerRadius,
            backgroundColor: Platform.OS === 'ios' ? 'transparent' : backgroundTint,
            borderColor: backgroundBorder,
          },
        ]}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.activeIndicator,
          {
            width: indicatorWidth,
            height: indicatorHeight,
            borderRadius: indicatorRadius,
            left: indicatorInset,
            backgroundColor: indicatorFill,
            shadowColor: indicatorShadow,
            top: indicatorVerticalOffset,
            transform: [{ translateX }],
          },
        ]}
      />

      <View
        style={[
          styles.tabsRow,
          {
            borderRadius: containerRadius,
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const tabConfig =
            TAB_CONFIG[route.name] ?? {
              label: options.title ?? route.name,
              activeIcon: 'circle',
              inactiveIcon: 'circle-outline',
            };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!event.defaultPrevented) {
              if (!isFocused) {
                triggerHaptic();
                navigation.navigate(route.name);
              }
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <View key={route.key} style={styles.tabButton}>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel ?? tabConfig.label}
                hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
                android_ripple={{ color: `${palette.primary}22`, radius: 44, borderless: false }}
                onPress={onPress}
                onLongPress={onLongPress}
                style={({ pressed }) => [
                  styles.touchable,
                  { minHeight: indicatorHeight },
                  pressed && styles.touchablePressed,
                ]}
              >
                <View style={styles.tabContent}>
                  <MaterialCommunityIcons
                    name={isFocused ? tabConfig.activeIcon : tabConfig.inactiveIcon}
                    size={20}
                    color={isFocused ? activeIconColor : palette.textSecondary}
                    style={{ opacity: isFocused ? 1 : 0.7 }}
                  />
                  <Text
                    style={[
                      styles.label,
                      {
                        color: isFocused ? activeLabelColor : palette.textSecondary,
                        opacity: isFocused ? 1 : 0.7,
                        fontFamily: isFocused ? 'NeuzeitGro-SemiBold' : 'NeuzeitGro-Medium',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {tabConfig.label}
                  </Text>
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Savings" component={SavingsScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Community" component={CommunityNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'ios' ? 8 : 10,
  },
  activeIndicator: {
    position: 'absolute',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'ios' ? 8 : 10,
    paddingHorizontal: 10,
  },
  touchablePressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.85,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.2,
    marginTop: 2,
  },
  tabBackground: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
