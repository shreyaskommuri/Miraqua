
import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nProvider } from './contexts/I18nContext';
import AppNavigator from './components/navigation/AppNavigator';
import { ErrorBoundaryProvider } from './components/ui/ErrorBoundaryProvider';
import NetworkStatus from './components/ui/NetworkStatus';
import { InstallPrompt } from './components/ui/InstallPrompt';
import { Toaster } from './components/ui/toaster';
import { logger } from './services/logger';
import './utils/errorHandling';

function App() {
  useEffect(() => {
    logger.info('Miraqua application starting');
    
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            logger.info('Service Worker registered successfully', { registration });
          })
          .catch((registrationError) => {
            logger.error('Service Worker registration failed', registrationError);
          });
      });
    }

    // Add manifest link to head
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/manifest.json';
    document.head.appendChild(manifestLink);

    return () => {
      if (document.head.contains(manifestLink)) {
        document.head.removeChild(manifestLink);
      }
    };
  }, []);

  return (
    <ErrorBoundaryProvider>
      <BrowserRouter>
        <ThemeProvider>
          <I18nProvider>
            <AppNavigator />
            <NetworkStatus />
            <InstallPrompt />
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundaryProvider>
  );
}

export default App;
