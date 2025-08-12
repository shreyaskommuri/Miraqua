import { environment } from '@/config/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  stack?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      stack: level === 'error' ? new Error().stack : undefined
    };
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output in development
    if (environment.isDevelopment) {
      const consoleMethod = entry.level === 'error' ? 'error' : 
                           entry.level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](`[${entry.level.toUpperCase()}] ${entry.message}`, entry.data || '');
    }

    // Send to external logging service in production
    if (environment.isProduction && entry.level === 'error') {
      this.sendToExternalService(entry);
    }
  }

  private async sendToExternalService(entry: LogEntry) {
    try {
      // Replace with your actual logging service endpoint
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      // Fallback: store in localStorage for later retry
      const storedLogs = JSON.parse(localStorage.getItem('pending_logs') || '[]');
      storedLogs.push(entry);
      localStorage.setItem('pending_logs', JSON.stringify(storedLogs.slice(-50)));
    }
  }

  debug(message: string, data?: any) {
    this.addLog(this.formatMessage('debug', message, data));
  }

  info(message: string, data?: any) {
    this.addLog(this.formatMessage('info', message, data));
  }

  warn(message: string, data?: any) {
    this.addLog(this.formatMessage('warn', message, data));
  }

  error(message: string, data?: any) {
    const entry = this.formatMessage('error', message, data);
    this.addLog(entry);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    return level ? this.logs.filter(log => log.level === level) : this.logs;
  }

  clearLogs() {
    this.logs = [];
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new Logger();
