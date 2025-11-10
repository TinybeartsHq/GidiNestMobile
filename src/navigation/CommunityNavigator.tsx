import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CommunityScreen from '../screens/community/CommunityScreen';
import GiftRegistryScreen from '../screens/gift-registry/GiftRegistryScreen';
import CreateRegistryScreen from '../screens/gift-registry/CreateRegistryScreen';
import GifterViewScreen from '../screens/gift-registry/GifterViewScreen';

export type CommunityStackParamList = {
  CommunityHome: undefined;
  GiftRegistry: undefined;
  CreateRegistry: undefined;
  GifterView: { registryId: string } | undefined;
};

const Stack = createNativeStackNavigator<CommunityStackParamList>();

export default function CommunityNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CommunityHome" component={CommunityScreen} />
      <Stack.Screen name="GiftRegistry" component={GiftRegistryScreen} />
      <Stack.Screen name="CreateRegistry" component={CreateRegistryScreen} />
      <Stack.Screen name="GifterView" component={GifterViewScreen} />
    </Stack.Navigator>
  );
}


