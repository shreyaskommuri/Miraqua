// navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen.tsx';
import MainTabs from './MainTabs';
import PlotDetailsScreen from '../screens/PlotDetailsScreen';
import FarmerChatScreen from '../screens/FarmerChatScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="SignIn">
      <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="PlotDetails" component={PlotDetailsScreen} options={{ title: 'Plot Details' }} />
      <Stack.Screen name="FarmerChat" component={FarmerChatScreen} options={{ title: 'Ask Farmer' }} />
    </Stack.Navigator>
  );
}
