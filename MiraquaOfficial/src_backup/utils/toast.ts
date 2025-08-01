
interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    text: string;
    onPress: () => void;
  };
}

class ToastManager {
  private static instance: ToastManager;
  private toasts: Array<ToastOptions & { id: string; timestamp: number }> = [];
  private listeners: Array<(toasts: Array<ToastOptions & { id: string; timestamp: number }>) => void> = [];

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  show(options: ToastOptions) {
    const id = Math.random().toString(36).substring(2, 9);
    const toast = {
      ...options,
      id,
      timestamp: Date.now(),
      duration: options.duration || 4000
    };

    this.toasts.push(toast);
    // Limit to 3 toasts max
    if (this.toasts.length > 3) {
      this.toasts.shift();
    }

    this.notifyListeners();

    // Auto-dismiss
    setTimeout(() => {
      this.dismiss(id);
    }, toast.duration);
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notifyListeners();
  }

  subscribe(listener: (toasts: Array<ToastOptions & { id: string; timestamp: number }>) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  getToasts() {
    return [...this.toasts];
  }
}

export const toast = ToastManager.getInstance();

// Utility functions for common toast types
export const showSuccessToast = (message: string) => toast.show({ message, type: 'success' });
export const showErrorToast = (message: string, retry?: () => void) => {
  toast.show({
    message,
    type: 'error',
    action: retry ? { text: 'Retry', onPress: retry } : undefined
  });
};
export const showNetworkErrorToast = (retry: () => void) => {
  toast.show({
    message: 'Network error—tap to retry',
    type: 'error',
    action: { text: 'Retry', onPress: retry }
  });
};
