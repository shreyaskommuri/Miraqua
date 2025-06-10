// navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import MainTabs from './MainTabs';
import PlotDetailsScreen from '../screens/PlotDetailsScreen';
import FarmerChatScreen from '../screens/FarmerChatScreen';
import WeatherForecastScreen from '../screens/WeatherForecastScreen';
import PickLocationScreen from '../screens/PickLocationScreen';
import SpecificDayPage from '../screens/SpecificDayPage'; 
import PlotSettingsScreen from '../screens/PlotSettingsScreen';


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
      <Stack.Screen name="WeatherForecast" component={WeatherForecastScreen} options={{ title: 'Weather Forecast' }} />
      <Stack.Screen name="PickLocation" component={PickLocationScreen} options={{ title: 'Select Plot Location' }} />
      <Stack.Screen name="SpecificDay" component={SpecificDayPage} options={{ title: 'Day Details' }} /> 
      <Stack.Screen name="PlotSettings" component={PlotSettingsScreen} options={{ title: 'Plot Settings' }} />

    </Stack.Navigator>
  );
}
