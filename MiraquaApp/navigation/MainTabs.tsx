// MiraquaApp/navigation/MainTabs.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import AddPlotScreen from '../screens/AddPlotScreen';
import AccountScreen from '../screens/AccountScreen';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from './AppNavigator';

const Tab = createBottomTabNavigator();

type MainTabsRouteProp = RouteProp<RootStackParamList, 'MainTabs'>;

const MainTabs = ({ route }: { route?: MainTabsRouteProp }) => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        initialParams={route?.params}
      />
      <Tab.Screen name="Add Plot" component={AddPlotScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
};

export default MainTabs;
