
import React from "react";
import { Route } from "react-router-dom";
import OnboardingLocationScreen from "@/components/screens/OnboardingLocationScreen";
import OnboardingCropScreen from "@/components/screens/OnboardingCropScreen";
import OnboardingAdvancedSettingsScreen from "@/components/screens/OnboardingAdvancedSettingsScreen";
import OnboardingCompleteScreen from "@/components/screens/OnboardingCompleteScreen";

export const onboardingRoutes = (
  <>
    <Route path="/onboarding/location" element={<OnboardingLocationScreen />} />
    <Route path="/onboarding/crop" element={<OnboardingCropScreen />} />
    <Route path="/onboarding/settings" element={<OnboardingAdvancedSettingsScreen />} />
    <Route path="/onboarding/complete" element={<OnboardingCompleteScreen />} />
  </>
);
