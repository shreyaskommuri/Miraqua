import { logger } from '@/services/logger';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];

  startTiming(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric(name, duration);
    };
  }

  recordMetric(name: string, value: number): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now()
    });

    // Log slow operations
    if (value > 1000) { // More than 1 second
      logger.warn(`Slow operation detected: ${name}`, { duration: value });
    }

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  // Monitor Web Vitals
  observeWebVitals(): void {
    if ('web-vital' in window) {
      // This would integrate with Web Vitals library in production
      return;
    }

    // Basic performance observation
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric(entry.name, entry.duration);
          }
        });
        
        observer.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (error) {
        logger.warn('Performance observer failed to initialize', error);
      }
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Auto-start monitoring
performanceMonitor.observeWebVitals();
