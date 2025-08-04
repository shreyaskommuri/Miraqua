import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import WelcomeScreen from '../screens/WelcomeScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import PlotDetailsScreen from '../screens/PlotDetailsScreen';
import WeatherScreen from '../screens/WeatherScreen';
import AccountScreen from '../screens/AccountScreen';
import ChatScreen from '../screens/ChatScreen';
import PlotsScreen from '../screens/PlotsScreen';
import PlotSettingsScreen from '../screens/PlotSettingsScreen';
import SpecificDayScreen from '../screens/SpecificDayScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ExportReportsScreen from '../screens/ExportReportsScreen';
import PredictiveDashboardScreen from '../screens/PredictiveDashboardScreen';
import AnomalyAlertsScreen from '../screens/AnomalyAlertsScreen';
import PlantHealthScannerScreen from '../screens/PlantHealthScannerScreen';
import YieldForecastScreen from '../screens/YieldForecastScreen';
import SmartMapScreen from '../screens/SmartMapScreen';
import CommunityScreen from '../screens/CommunityScreen';

import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PlotDetails" component={PlotDetailsScreen} options={{ title: 'Plot Details' }} />
      <Stack.Screen name="Weather" component={WeatherScreen} options={{ title: 'Weather' }} />
      <Stack.Screen name="Account" component={AccountScreen} options={{ title: 'Account' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'AI Assistant' }} />
      <Stack.Screen name="Plots" component={PlotsScreen} options={{ title: 'My Plots' }} />
      <Stack.Screen name="PlotSettings" component={PlotSettingsScreen} options={{ title: 'Plot Settings' }} />
      <Stack.Screen name="SpecificDay" component={SpecificDayScreen} options={{ title: 'Day Details' }} />
      <Stack.Screen name="Marketplace" component={MarketplaceScreen} options={{ title: 'Marketplace' }} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analytics' }} />
      <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
      <Stack.Screen name="ExportReports" component={ExportReportsScreen} options={{ title: 'Export Reports' }} />
      <Stack.Screen name="PredictiveDashboard" component={PredictiveDashboardScreen} options={{ title: 'Predictive Dashboard' }} />
      <Stack.Screen name="AnomalyAlerts" component={AnomalyAlertsScreen} options={{ title: 'Anomaly Alerts' }} />
      <Stack.Screen name="PlantHealthScanner" component={PlantHealthScannerScreen} options={{ title: 'Plant Health Scanner' }} />
      <Stack.Screen name="YieldForecast" component={YieldForecastScreen} options={{ title: 'Yield Forecast' }} />
      <Stack.Screen name="SmartMap" component={SmartMapScreen} options={{ title: 'Smart Map' }} />
      <Stack.Screen name="Community" component={CommunityScreen} options={{ title: 'Community' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 