
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { authRoutes } from "./routes/AuthRoutes";
import { onboardingRoutes } from "./routes/OnboardingRoutes";
import { standaloneRoutes } from "./routes/StandaloneRoutes";
import { legacyRedirects } from "./routes/LegacyRedirects";
import { mainAppRoutes } from "./routes/MainAppRoutes";

const AppNavigator = () => {
  return (
    <Routes>
      {authRoutes}
      {onboardingRoutes}
      {standaloneRoutes}
      {legacyRedirects}
      {mainAppRoutes}
      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
};

export default AppNavigator;
