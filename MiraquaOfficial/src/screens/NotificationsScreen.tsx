import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NotificationsScreenProps {
  navigation: any;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const [notifications, setNotifications] = useState({
    wateringReminders: true,
    rainForecastAlerts: true,
    lowMoistureAlerts: true,
  });

  const handleSaveSettings = () => {
    // Here you would typically save to your backend/API
    Alert.alert(
      'Settings Saved',
      'Your notification preferences have been updated.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.menuButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="leaf" size={20} color="white" />
          </View>
          <Text style={styles.logoText}>Miraqua</Text>
        </View>
        
        <View style={styles.headerRight}>
          <View style={styles.onlineStatus}>
            <Ionicons name="wifi" size={16} color="#10B981" />
            <Text style={styles.onlineText}>Online</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={20} color="white" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Ionicons name="notifications" size={24} color="#10B981" />
          <Text style={styles.title}>Notifications</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSubtitle}>Notification Types</Text>
          
          <View style={styles.notificationRow}>
            <Text style={styles.notificationLabel}>Watering reminders</Text>
            <Switch
              value={notifications.wateringReminders}
              onValueChange={(value) => 
                setNotifications(prev => ({ ...prev, wateringReminders: value }))
              }
              trackColor={{ false: '#374151', true: '#10B981' }}
              thumbColor={notifications.wateringReminders ? 'white' : 'white'}
            />
          </View>

          <View style={styles.notificationRow}>
            <Text style={styles.notificationLabel}>Rain forecast alerts</Text>
            <Switch
              value={notifications.rainForecastAlerts}
              onValueChange={(value) => 
                setNotifications(prev => ({ ...prev, rainForecastAlerts: value }))
              }
              trackColor={{ false: '#374151', true: '#10B981' }}
              thumbColor={notifications.rainForecastAlerts ? 'white' : 'white'}
            />
          </View>

          <View style={styles.notificationRow}>
            <Text style={styles.notificationLabel}>Low moisture alerts</Text>
            <Switch
              value={notifications.lowMoistureAlerts}
              onValueChange={(value) => 
                setNotifications(prev => ({ ...prev, lowMoistureAlerts: value }))
              }
              trackColor={{ false: '#374151', true: '#10B981' }}
              thumbColor={notifications.lowMoistureAlerts ? 'white' : 'white'}
            />
          </View>
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
  },
  menuButton: {
    padding: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  onlineText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 4,
    fontWeight: '500',
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 20,
    fontWeight: '500',
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  notificationLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationsScreen; 