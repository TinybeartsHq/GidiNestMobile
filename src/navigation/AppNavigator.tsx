import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthLandingScreen from '../screens/auth/AuthLandingScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import BottomTabNavigator from './BottomTabNavigator';
import HospitalBillsScreen from '../screens/dashboard/HospitalBillsScreen';
import BabySuppliesScreen from '../screens/dashboard/BabySuppliesScreen';
import PostpartumCareScreen from '../screens/dashboard/PostpartumCareScreen';
import TransactionDetailsScreen from '../screens/transactions/TransactionDetailsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AuthLanding"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="AuthLanding" component={AuthLandingScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="MainApp" component={BottomTabNavigator} />
        <Stack.Screen name="HospitalBills" component={HospitalBillsScreen} />
        <Stack.Screen name="BabySupplies" component={BabySuppliesScreen} />
        <Stack.Screen name="PostpartumCare" component={PostpartumCareScreen} />
        <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


