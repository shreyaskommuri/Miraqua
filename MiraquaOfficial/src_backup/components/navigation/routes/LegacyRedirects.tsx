
import React from "react";
import { Route, Navigate } from "react-router-dom";

export const legacyRedirects = (
  <>
    <Route path="/home" element={<Navigate to="/app/home" replace />} />
    <Route path="/analytics" element={<Navigate to="/app/analytics" replace />} />
    <Route path="/map" element={<Navigate to="/app/map" replace />} />
    <Route path="/chat" element={<Navigate to="/app/chat" replace />} />
    <Route path="/community" element={<Navigate to="/app/community" replace />} />
    <Route path="/marketplace" element={<Navigate to="/app/marketplace" replace />} />
    <Route path="/account" element={<Navigate to="/app/account" replace />} />
  </>
);
