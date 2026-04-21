// navigation/MainTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import AddPlotScreen from '../screens/AddPlotScreen';
import AccountScreen from '../screens/AccountScreen';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { fontWeight: '600' as const, fontSize: 17, color: '#1a1a1a' },
        headerShadowVisible: false,
        tabBarActiveTintColor: '#1aa179',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#f0f0f0',
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 62,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginBottom: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Add Plot"
        component={AddPlotScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} size={size + 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
