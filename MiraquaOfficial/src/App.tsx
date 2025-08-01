
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nProvider } from './contexts/I18nContext';
import AppNavigator from './navigation/AppNavigator';
import { ErrorBoundaryProvider } from './components/ui/ErrorBoundaryProvider';
import { Toaster } from './components/ui/toaster';
import { logger } from './services/logger';
import './utils/errorHandling';

export default function App() {
  useEffect(() => {
    logger.info('Miraqua application starting');
    
    // Initialize app-specific configurations
    // Note: Service worker registration is not available in React Native
    // PWA functionality is handled differently in mobile apps
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <ErrorBoundaryProvider>
      <ThemeProvider>
        <I18nProvider>
          <StatusBar style="auto" />
          <AppNavigator />
          <Toaster />
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundaryProvider>
  );
}
