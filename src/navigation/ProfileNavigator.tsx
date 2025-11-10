import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import SecuritySettingsScreen from '../screens/profile/SecuritySettingsScreen';
import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  SecuritySettings: undefined;
  PaymentMethods: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
