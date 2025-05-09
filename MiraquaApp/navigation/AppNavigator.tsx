import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from '../screens/SignInScreen';
import MainTabs from './MainTabs';
import PlotDetailsScreen from '../screens/PlotDetailsScreen';
import type { Plot } from '../screens/HomeScreen';

export type RootStackParamList = {
  SignIn: undefined;
  MainTabs: { onAddPlot?: Plot } | undefined;
  PlotDetails: { plot: Plot };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="PlotDetails" component={PlotDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
