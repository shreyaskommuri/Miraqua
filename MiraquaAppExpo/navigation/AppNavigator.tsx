// navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from '../screens/SignInScreen';
import MainTabs from './MainTabs';
import PlotDetailsScreen from '../screens/PlotDetailsScreen';
import FarmerChatScreen from '../screens/FarmerChatScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="SignIn">
      <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="PlotDetails" component={PlotDetailsScreen} />
      <Stack.Screen name="FarmerChat" component={FarmerChatScreen} />
    </Stack.Navigator>
  );
}
