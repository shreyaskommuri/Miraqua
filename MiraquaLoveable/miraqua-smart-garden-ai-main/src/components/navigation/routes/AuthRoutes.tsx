
import React from "react";
import { Route, Navigate } from "react-router-dom";
import WelcomeScreen from "@/components/screens/WelcomeScreen";
import SignInScreen from "@/components/screens/SignInScreen";
import SignUpScreen from "@/components/screens/SignUpScreen";
import ForgotPasswordScreen from "@/components/screens/ForgotPasswordScreen";

export const authRoutes = (
  <>
    <Route path="/" element={<Navigate to="/welcome" replace />} />
    <Route path="/welcome" element={<WelcomeScreen />} />
    <Route path="/signin" element={<SignInScreen />} />
    <Route path="/signup" element={<SignUpScreen />} />
    <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
  </>
);
