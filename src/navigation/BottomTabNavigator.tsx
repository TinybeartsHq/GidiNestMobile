import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useThemeMode } from '../theme/ThemeProvider';
import { theme } from '../theme/theme';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import SavingsScreen from '../screens/savings/SavingsScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import TransactionsScreen from '../screens/transactions/TransactionsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';

  const TabBackground = Platform.OS === 'ios' ? BlurView : View;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 70,
        },
        tabBarBackground: () => (
          <TabBackground
            intensity={Platform.OS === 'ios' ? 80 : undefined}
            tint={isDark ? 'dark' : 'light'}
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor:
                  Platform.OS === 'ios'
                    ? 'transparent'
                    : isDark
                    ? 'rgba(15, 23, 42, 0.95)'
                    : 'rgba(255, 255, 255, 0.95)',
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: palette.border,
              },
            ]}
          />
        ),
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textSecondary,
        tabBarLabelStyle: {
          fontFamily: 'NeuzeitGro-Medium',
          fontSize: 11,
          marginTop: -4,
          marginBottom: Platform.OS === 'ios' ? 0 : 8,
        },
        tabBarIconStyle: {
          marginTop: Platform.OS === 'ios' ? 8 : 4,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && {
                  backgroundColor: `${palette.primary}15`,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={focused ? 'home' : 'home-outline'}
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Savings"
        component={SavingsScreen}
        options={{
          tabBarLabel: 'Savings',
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && {
                  backgroundColor: `${palette.primary}15`,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={focused ? 'piggy-bank' : 'piggy-bank-outline'}
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarLabel: 'Community',
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && {
                  backgroundColor: `${palette.primary}15`,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={focused ? 'account-group' : 'account-group-outline'}
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarLabel: 'Activity',
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && {
                  backgroundColor: `${palette.primary}15`,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={focused ? 'swap-horizontal' : 'swap-horizontal'}
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && {
                  backgroundColor: `${palette.primary}15`,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={focused ? 'account-circle' : 'account-circle-outline'}
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 32,
    borderRadius: theme.borderRadius.lg,
  },
});
