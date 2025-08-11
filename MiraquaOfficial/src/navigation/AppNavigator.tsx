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
import SetupPlotScreen from '../screens/SetupPlotScreen';
import OnboardingLocationScreen from '../screens/OnboardingLocationScreen';
import OnboardingCompleteScreen from '../screens/OnboardingCompleteScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import HelpScreen from '../screens/HelpScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AddScheduleScreen from '../screens/AddScheduleScreen';

import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PlotDetails" component={PlotDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Weather" component={WeatherScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Account" component={AccountScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Plots" component={PlotsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PlotSettings" component={PlotSettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SpecificDay" component={SpecificDayScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Marketplace" component={MarketplaceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Reports" component={ReportsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ExportReports" component={ExportReportsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PredictiveDashboard" component={PredictiveDashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AnomalyAlerts" component={AnomalyAlertsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PlantHealthScanner" component={PlantHealthScannerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="YieldForecast" component={YieldForecastScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SmartMap" component={SmartMapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Community" component={CommunityScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SetupPlot" component={SetupPlotScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OnboardingLocation" component={OnboardingLocationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OnboardingComplete" component={OnboardingCompleteScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Help" component={HelpScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Calendar" component={CalendarScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddSchedule" component={AddScheduleScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 