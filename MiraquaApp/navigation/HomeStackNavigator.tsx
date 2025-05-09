import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import PlotDetailsScreen from '../screens/PlotDetailsScreen';
import { Plot } from '../screens/HomeScreen';

export type HomeStackParamList = {
  Home: undefined;
  PlotDetails: { plot: Plot };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PlotDetails" component={PlotDetailsScreen} />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
