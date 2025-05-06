import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import AddPlotScreen from '../screens/AddPlotScreen';
import AccountScreen from '../screens/AccountScreen';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Add Plot" component={AddPlotScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
};

export default MainTabs;
