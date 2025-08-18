
import React, { useEffect, useState } from 'react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { 
  Bell, 
  BellOff, 
  CheckCircle,
  AlertCircle,
  Droplets,
  CloudRain,
  Thermometer,
  X
} from 'lucide-react';

interface NotificationPermissionProps {
  onPermissionGranted: (granted: boolean) => void;
}

export const NotificationPermission: React.FC<NotificationPermissionProps> = ({ onPermissionGranted }) => {
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionState(Notification.permission);
      setShowPrompt(Notification.permission === 'default');
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      setShowPrompt(false);
      onPermissionGranted(permission === 'granted');
      
      if (permission === 'granted') {
        // Show welcome notification
        new Notification('Miraqua Smart Garden', {
          body: 'Notifications enabled! You\'ll receive watering reminders and alerts.',
          icon: '/favicon.png',
          tag: 'welcome'
        });
      }
    }
  };

  if (!('Notification' in window) || permissionState === 'granted' || !showPrompt) {
    return null;
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Bell className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900">Enable Notifications</h4>
              <p className="text-sm text-blue-700 mb-3">
                Get timely reminders for watering, weather alerts, and system updates.
              </p>
              <div className="flex space-x-2">
                <Button size="sm" onClick={requestPermission} className="bg-blue-600 hover:bg-blue-700">
                  Enable Notifications
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowPrompt(false)}>
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowPrompt(false)}
            className="p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface PushNotificationManagerProps {
  isEnabled: boolean;
}

export const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({ isEnabled }) => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    body: string;
    type: 'watering' | 'weather' | 'alert' | 'system';
    timestamp: Date;
    read: boolean;
  }>>([]);

  // Mock notification scheduler
  useEffect(() => {
    if (!isEnabled) return;

    const scheduleNotifications = () => {
      // Watering reminder
      setTimeout(() => {
        sendNotification({
          title: 'Watering Reminder',
          body: 'Time to water your Tomato Garden (Plot 1)',
          type: 'watering'
        });
      }, 10000); // 10 seconds for demo

      // Weather alert
      setTimeout(() => {
        sendNotification({
          title: 'Weather Alert',
          body: 'Rain expected tomorrow - watering will be skipped automatically',
          type: 'weather'
        });
      }, 20000); // 20 seconds for demo

      // Low moisture alert
      setTimeout(() => {
        sendNotification({
          title: 'Low Moisture Alert',
          body: 'Herb Corner moisture dropped to 35% - consider manual watering',
          type: 'alert'
        });
      }, 30000); // 30 seconds for demo
    };

    scheduleNotifications();
  }, [isEnabled]);

  const sendNotification = (notification: {
    title: string;
    body: string;
    type: 'watering' | 'weather' | 'alert' | 'system';
  }) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      ...notification,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.body,
        icon: '/favicon.png',
        tag: id,
        requireInteraction: notification.type === 'alert'
      });

      browserNotification.onclick = () => {
        window.focus();
        markAsRead(id);
        browserNotification.close();
      };

      // Auto-close after 5 seconds for non-critical notifications
      if (notification.type !== 'alert') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'watering': return Droplets;
      case 'weather': return CloudRain;
      case 'alert': return AlertCircle;
      case 'system': return CheckCircle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'watering': return 'text-blue-600';
      case 'weather': return 'text-gray-600';
      case 'alert': return 'text-red-600';
      case 'system': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // This component doesn't render UI by default - it's a service
  // But we can expose the notifications for other components to use
  return null;
};

// Hook to access notifications
export const useNotifications = () => {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setHasPermission(permission === 'granted');
      return permission === 'granted';
    }
    return false;
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (hasPermission && 'Notification' in window) {
      return new Notification(title, {
        icon: '/favicon.png',
        ...options
      });
    }
    return null;
  };

  return {
    hasPermission,
    requestPermission,
    sendNotification,
    isSupported: 'Notification' in window
  };
};
