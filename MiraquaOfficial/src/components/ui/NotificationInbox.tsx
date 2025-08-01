
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Notification {
  id: string;
  type: 'weather' | 'watering' | 'alert' | 'system';
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
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'weather':
        return 'cloudy';
      case 'watering':
        return 'water';
      case 'alert':
        return 'warning';
      case 'system':
        return 'settings';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'weather':
        return '#3B82F6';
      case 'watering':
        return '#10B981';
      case 'alert':
        return '#F59E0B';
      case 'system':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  if (notifications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="notifications-off" size={32} color="#9CA3AF" />
        </View>
        <Text style={styles.emptyTitle}>No notifications</Text>
        <Text style={styles.emptySubtitle}>You're all caught up!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {notifications.filter(n => !n.read).length}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => (
          <View
            key={notification.id}
            style={[
              styles.notificationItem,
              notification.read && styles.readNotification
            ]}
          >
            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <View style={styles.notificationIcon}>
                  <Ionicons
                    name={getNotificationIcon(notification.type) as any}
                    size={16}
                    color={getNotificationColor(notification.type)}
                  />
                </View>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTimestamp}>{notification.timestamp}</Text>
                </View>
                <View style={styles.notificationActions}>
                  {!notification.read && (
                    <TouchableOpacity
                      style={styles.markAsReadButton}
                      onPress={() => onMarkAsRead(notification.id)}
                    >
                      <Ionicons name="checkmark" size={12} color="#10B981" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.dismissButton}
                    onPress={() => onDismiss(notification.id)}
                  >
                    <Ionicons name="close" size={12} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              {notification.plotId && onViewPlot && (
                <TouchableOpacity
                  style={styles.plotButton}
                  onPress={() => onViewPlot(notification.plotId!)}
                >
                  <Ionicons name="location" size={12} color="#3B82F6" />
                  <Text style={styles.plotButtonText}>View {notification.plotName}</Text>
                </TouchableOpacity>
              )}

              <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(notification.priority) }]} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  notificationsList: {
    maxHeight: 300,
  },
  notificationItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  readNotification: {
    opacity: 0.6,
  },
  notificationContent: {
    padding: 16,
    position: 'relative',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 16,
  },
  notificationTimestamp: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  markAsReadButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  dismissButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  plotButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    marginLeft: 4,
    fontWeight: '500',
  },
  priorityIndicator: {
    position: 'absolute',
    left: 0,
    top: 16,
    bottom: 16,
    width: 3,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 24,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});
