
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

class Analytics {
  private static instance: Analytics;
  private enabled: boolean = true;

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  logEvent(name: string, properties?: Record<string, any>) {
    if (!this.enabled) return;
    
    try {
      // Store analytics events for later processing
      const events = JSON.parse(sessionStorage.getItem('analytics_events') || '[]');
      events.push({ name, properties, timestamp: new Date().toISOString() });
      sessionStorage.setItem('analytics_events', JSON.stringify(events.slice(-100)));
      
      // Send to analytics service in production
      if (import.meta.env.PROD) {
        // Replace with your actual analytics endpoint
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, properties, timestamp: new Date().toISOString() })
        }).catch(() => {}); // Silently fail analytics
      }
    } catch (error) {
      // Silently fail analytics tracking
    }
  }

  trackPageView(page: string) {
    this.logEvent('Page_View', { page });
  }

  trackUserAction(action: string, context?: Record<string, any>) {
    this.logEvent('User_Action', { action, ...context });
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

export const analytics = Analytics.getInstance();

// Make analytics available globally for easy access
if (typeof window !== 'undefined') {
  (window as any).analytics = analytics;
}
