import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import SavingsScreen from '../screens/savings/SavingsScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import TransactionsScreen from '../screens/transactions/TransactionsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SignIn"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="SignIn" 
          component={SignInScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Register"
          component={SignUpScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Savings" component={SavingsScreen} />
        <Stack.Screen name="Community" component={CommunityScreen} />
        <Stack.Screen name="Transactions" component={TransactionsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


