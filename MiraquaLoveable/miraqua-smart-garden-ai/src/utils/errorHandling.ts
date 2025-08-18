import { logger } from '@/services/logger';

export interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  userId?: string;
  timestamp: string;
  url: string;
  userAgent: string;
}

export class ErrorHandler {
  static captureError(error: Error, errorInfo?: React.ErrorInfo): void {
    const errorData: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    logger.error('Application error captured', errorData);

    // In production, send to error tracking service
    if (import.meta.env.PROD) {
      // Replace with your error tracking service (e.g., Sentry, Bugsnag)
      // window.ErrorTracker?.captureException(error, errorData);
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

// Global error handler for unhandled promises
window.addEventListener('unhandledrejection', (event) => {
  ErrorHandler.captureException('Unhandled Promise Rejection', {
    reason: event.reason,
    promise: event.promise
  });
});

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  ErrorHandler.captureError(event.error || new Error(event.message));
});