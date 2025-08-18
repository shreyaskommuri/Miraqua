
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Bell, Cloud, Droplets, AlertTriangle, MessageSquare, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'weather' | 'watering' | 'alert' | 'chat';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  plotId?: number;
  plotName?: string;
}

interface NotificationInboxProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onViewPlot?: (plotId: number) => void;
}

export const NotificationInbox: React.FC<NotificationInboxProps> = ({
  notifications,
  onMarkAsRead,
  onDismiss,
  onViewPlot
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'weather': return Cloud;
      case 'watering': return Droplets;
      case 'alert': return AlertTriangle;
      case 'chat': return MessageSquare;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-200';
      case 'medium': return 'bg-yellow-100 border-yellow-200';
      case 'low': return 'bg-blue-100 border-blue-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  if (!isExpanded) {
    return (
      <Card 
        className="border-0 shadow-md bg-white/80 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-all duration-300"
        onClick={() => setIsExpanded(true)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
            </div>
            <div className="text-2xl">
              {unreadCount > 0 ? '🔔' : '✅'}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Bell className="w-5 h-5 mr-2 text-blue-600" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            return (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${getPriorityColor(notification.priority)} ${
                  !notification.read ? 'ring-1 ring-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Icon className="w-4 h-4 mt-1 text-gray-600" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-sm text-gray-900">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">{notification.timestamp}</p>
                        {notification.plotName && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => notification.plotId && onViewPlot?.(notification.plotId)}
                            className="text-xs h-auto p-1"
                          >
                            View {notification.plotName}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkAsRead(notification.id)}
                        className="w-6 h-6 p-0"
                      >
                        ✓
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismiss(notification.id)}
                      className="w-6 h-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
