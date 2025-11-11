import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import EditProfileDetailsScreen from '../screens/profile/EditProfileDetailsScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import SecuritySettingsScreen from '../screens/profile/SecuritySettingsScreen';
import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import SelectVerificationMethodScreen from '../screens/profile/SelectVerificationMethodScreen';
import BVNVerificationScreen from '../screens/profile/BVNVerificationScreen';
import NINVerificationScreen from '../screens/profile/NINVerificationScreen';

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  EditProfileDetails: undefined;
  ChangePassword: undefined;
  SecuritySettings: undefined;
  PaymentMethods: undefined;
  Notifications: undefined;
  SelectVerificationMethod: undefined;
  BVNVerification: undefined;
  NINVerification: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="EditProfileDetails" component={EditProfileDetailsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="SelectVerificationMethod" component={SelectVerificationMethodScreen} />
      <Stack.Screen name="BVNVerification" component={BVNVerificationScreen} />
      <Stack.Screen name="NINVerification" component={NINVerificationScreen} />
    </Stack.Navigator>
  );
}
