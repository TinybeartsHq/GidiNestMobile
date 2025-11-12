import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useThemeMode } from '../theme/ThemeProvider';
import AuthLandingScreen from '../screens/auth/AuthLandingScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import PasscodeSetupScreen from '../screens/auth/PasscodeSetupScreen';
import PasscodeAuthScreen from '../screens/auth/PasscodeAuthScreen';
import PINSetupScreen from '../screens/auth/PINSetupScreen';
import PINAuthScreen from '../screens/auth/PINAuthScreen';
import BottomTabNavigator from './BottomTabNavigator';
import HospitalBillsScreen from '../screens/dashboard/HospitalBillsScreen';
import BabySuppliesScreen from '../screens/dashboard/BabySuppliesScreen';
import PostpartumCareScreen from '../screens/dashboard/PostpartumCareScreen';
import TransactionDetailsScreen from '../screens/transactions/TransactionDetailsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import DepositScreen from '../screens/savings/DepositScreen';
import WithdrawScreen from '../screens/savings/WithdrawScreen';
import WithdrawalStatusScreen from '../screens/savings/WithdrawalStatusScreen';
import FundGoalScreen from '../screens/savings/FundGoalScreen';
import CreateGoalScreen from '../screens/savings/CreateGoalScreen';
import BankTransferDetailsScreen from '../screens/savings/BankTransferDetailsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const { palette } = useThemeMode();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      // Check if user has email stored and if they have passcode set up
      const userEmail = await SecureStore.getItemAsync('user_email');
      const hasPasscodeSetup = await SecureStore.getItemAsync('has_passcode_setup');

      if (userEmail && hasPasscodeSetup === 'true') {
        // User has passcode set up - show PasscodeAuth
        setInitialRoute('PasscodeAuth');
      } else {
        // No passcode or new user - show AuthLanding
        setInitialRoute('AuthLanding');
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      setInitialRoute('AuthLanding');
    }
  };

  // Show loading indicator while checking
  if (!initialRoute) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: palette.background }]}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="AuthLanding" component={AuthLandingScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="PasscodeSetup" component={PasscodeSetupScreen} />
        <Stack.Screen name="PasscodeAuth" component={PasscodeAuthScreen} />
        <Stack.Screen name="PINSetup" component={PINSetupScreen} />
        <Stack.Screen
          name="PINAuth"
          component={PINAuthScreen}
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="MainApp" component={BottomTabNavigator} />
        <Stack.Screen name="HospitalBills" component={HospitalBillsScreen} />
        <Stack.Screen name="BabySupplies" component={BabySuppliesScreen} />
        <Stack.Screen name="PostpartumCare" component={PostpartumCareScreen} />
        <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Deposit" component={DepositScreen} />
        <Stack.Screen name="Withdraw" component={WithdrawScreen} />
        <Stack.Screen name="WithdrawalStatus" component={WithdrawalStatusScreen} />
        <Stack.Screen name="FundGoal" component={FundGoalScreen} />
        <Stack.Screen name="CreateGoal" component={CreateGoalScreen} />
        <Stack.Screen name="BankTransferDetails" component={BankTransferDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


