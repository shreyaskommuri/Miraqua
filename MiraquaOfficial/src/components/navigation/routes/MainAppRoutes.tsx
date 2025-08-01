
import React from "react";
import { Route } from "react-router-dom";
import { AppLayout } from "@/components/navigation/components/AppLayout";
import HomeScreen from "@/components/screens/HomeScreen";
import AnalyticsScreen from "@/components/screens/AnalyticsScreen";
import PredictiveDashboardScreen from "@/components/screens/PredictiveDashboardScreen";
import AnomalyAlertsScreen from "@/components/screens/AnomalyAlertsScreen";
import PlantHealthScannerScreen from "@/components/screens/PlantHealthScannerScreen";
import YieldForecastScreen from "@/components/screens/YieldForecastScreen";
import MapOverviewScreen from "@/components/screens/MapOverviewScreen";
import FarmerChatScreen from "@/components/screens/FarmerChatScreen";
import CommunityScreen from "@/components/screens/CommunityScreen";
import MarketplaceScreen from "@/components/screens/MarketplaceScreen";
import AccountScreen from "@/components/screens/AccountScreen";
import PlotDetailsScreen from "@/components/screens/PlotDetailsScreen";
import PlotSettingsScreen from "@/components/screens/PlotSettingsScreen";
import SpecificDayScreen from "@/components/screens/SpecificDayScreen";
import CalendarScreen from "@/components/screens/CalendarScreen";
import AddPlotScreen from "@/components/screens/AddPlotScreen";
import NotificationPreferencesScreen from "@/components/screens/NotificationPreferencesScreen";
import HelpScreen from "@/components/screens/HelpScreen";

export const mainAppRoutes = (
  <>
    <Route path="/app/home" element={
      <AppLayout>
        <HomeScreen />
      </AppLayout>
    } />
    
    <Route path="/app/analytics" element={
      <AppLayout>
        <AnalyticsScreen />
      </AppLayout>
    } />
    
    <Route path="/app/analytics/predictive" element={
      <AppLayout>
        <PredictiveDashboardScreen />
      </AppLayout>
    } />
    
    <Route path="/app/analytics/anomalies" element={
      <AppLayout>
        <AnomalyAlertsScreen />
      </AppLayout>
    } />
    
    <Route path="/app/analytics/plant-health" element={
      <AppLayout>
        <PlantHealthScannerScreen />
      </AppLayout>
    } />
    
    <Route path="/app/analytics/yield" element={
      <AppLayout>
        <YieldForecastScreen />
      </AppLayout>
    } />
    
    <Route path="/app/map" element={
      <AppLayout>
        <MapOverviewScreen />
      </AppLayout>
    } />
    
    <Route path="/app/chat" element={
      <AppLayout>
        <FarmerChatScreen />
      </AppLayout>
    } />
    
    <Route path="/app/community" element={
      <AppLayout>
        <CommunityScreen />
      </AppLayout>
    } />
    
    <Route path="/app/marketplace" element={
      <AppLayout>
        <MarketplaceScreen />
      </AppLayout>
    } />
    
    <Route path="/app/account" element={
      <AppLayout>
        <AccountScreen />
      </AppLayout>
    } />
    
    <Route path="/app/plot/:plotId" element={
      <AppLayout>
        <PlotDetailsScreen />
      </AppLayout>
    } />
    
    <Route path="/app/plot/:plotId/settings" element={
      <AppLayout>
        <PlotSettingsScreen />
      </AppLayout>
    } />
    
    <Route path="/app/day/:plotId/:date" element={
      <AppLayout>
        <SpecificDayScreen />
      </AppLayout>
    } />
    
    <Route path="/app/calendar/:plotId" element={
      <AppLayout>
        <CalendarScreen />
      </AppLayout>
    } />
    
    <Route path="/app/add-plot" element={
      <AppLayout>
        <AddPlotScreen />
      </AppLayout>
    } />
    
    <Route path="/app/notifications" element={
      <AppLayout>
        <NotificationPreferencesScreen />
      </AppLayout>
    } />
    
    <Route path="/app/help" element={
      <AppLayout>
        <HelpScreen />
      </AppLayout>
    } />
  </>
);
