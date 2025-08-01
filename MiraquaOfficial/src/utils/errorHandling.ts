import { logger } from '@/services/logger';

export interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  userId?: string;
  timestamp: string;
}

export class ErrorHandler {
  static captureError(error: Error, errorInfo?: React.ErrorInfo): void {
    const errorData: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
    };

    logger.error('Application error captured', errorData);

    // In production, send to error tracking service
    // Note: import.meta is not supported in React Native
    // You can use __DEV__ global variable instead
    if (!__DEV__) {
      // Replace with your error tracking service (e.g., Sentry, Bugsnag)
      // ErrorTracker?.captureException(error, errorData);
    }
  }

  static captureException(message: string, extra?: any): void {
    const error = new Error(message);
    this.captureError(error);
    
    if (extra) {
      logger.error(message, extra);
    }
  }
}

// Note: Global error handlers are not available in React Native
// Use React Native's error boundary components instead