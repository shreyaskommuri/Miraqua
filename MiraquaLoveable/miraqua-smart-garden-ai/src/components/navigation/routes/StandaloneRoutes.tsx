
import React from "react";
import { Route } from "react-router-dom";
import Index from "@/pages/Index";
import AddPlotScreen from "@/components/screens/AddPlotScreen";
import CollaborationScreen from "@/components/screens/CollaborationScreen";
import DeviceControlScreen from "@/components/screens/DeviceControlScreen";
import ExportReportsScreen from "@/components/screens/ExportReportsScreen";
import HelpScreen from "@/components/screens/HelpScreen";
import NotificationSettingsScreen from "@/components/screens/NotificationSettingsScreen";
import NotificationPreferencesScreen from "@/components/screens/NotificationPreferencesScreen";
import AnomalyAlertsScreen from "@/components/screens/AnomalyAlertsScreen";
import ReportsScreen from "@/components/screens/ReportsScreen";
import SensorManagementScreen from "@/components/screens/SensorManagementScreen";
import UserProfileScreen from "@/components/screens/UserProfileScreen";
import WeatherForecastScreen from "@/components/screens/WeatherForecastScreen";
import TermsOfServiceScreen from "@/components/screens/TermsOfServiceScreen";
import PrivacyPolicyScreen from "@/components/screens/PrivacyPolicyScreen";

export const standaloneRoutes = (
  <>
    
    <Route path="/add-plot" element={<AddPlotScreen />} />
    <Route path="/collaboration" element={<CollaborationScreen />} />
    <Route path="/device-control" element={<DeviceControlScreen />} />
    <Route path="/export-reports" element={<ExportReportsScreen />} />
    <Route path="/help" element={<HelpScreen />} />
    <Route path="/notification-settings" element={<NotificationSettingsScreen />} />
    <Route path="/notification-preferences" element={<NotificationPreferencesScreen />} />
    <Route path="/anomaly-alerts" element={<AnomalyAlertsScreen />} />
    <Route path="/reports" element={<ReportsScreen />} />
    <Route path="/sensor-management" element={<SensorManagementScreen />} />
    <Route path="/user-profile" element={<UserProfileScreen />} />
    <Route path="/weather-forecast" element={<WeatherForecastScreen />} />
    <Route path="/terms" element={<TermsOfServiceScreen />} />
    <Route path="/privacy" element={<PrivacyPolicyScreen />} />
  </>
);
