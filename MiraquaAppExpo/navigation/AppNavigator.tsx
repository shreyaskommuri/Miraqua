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

const headerBase = {
  headerStyle: { backgroundColor: '#fff' },
  headerTitleStyle: { fontWeight: '600' as const, fontSize: 17, color: '#1a1a1a' },
  headerTintColor: '#1aa179',
  headerShadowVisible: false,
  headerBackTitle: '',
};

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      screenOptions={{
        ...headerBase,
        fullScreenGestureEnabled: true,
        gestureEnabled: true,
        animationDuration: 280,
        animation: 'slide_from_right',
      }}
    >
      {/* Auth — no animation for cold open, slide for sign-up */}
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ headerShown: false, animation: 'none' }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />

      {/* Fade into app shell — feels like unlocking */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false, animation: 'fade', animationDuration: 220 }}
      />

      {/* Drill-down detail screens — slide right */}
      <Stack.Screen
        name="PlotDetails"
        component={PlotDetailsScreen}
        options={{ ...headerBase, title: 'Plot Details', animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="SpecificDay"
        component={SpecificDayPage}
        options={{ ...headerBase, title: 'Day Details', animation: 'slide_from_right' }}
      />

      {/* Contextual overlays — slide up as modal sheet */}
      <Stack.Screen
        name="FarmerChat"
        component={FarmerChatScreen}
        options={{
          ...headerBase,
          title: 'Ask Farmer',
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="WeatherForecast"
        component={WeatherForecastScreen}
        options={{
          ...headerBase,
          title: 'Weather Forecast',
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="PlotSettings"
        component={PlotSettingsScreen}
        options={{
          ...headerBase,
          title: 'Plot Settings',
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />

      {/* Full-screen takeover for map */}
      <Stack.Screen
        name="PickLocation"
        component={PickLocationScreen}
        options={{
          ...headerBase,
          title: 'Select Plot Location',
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}
