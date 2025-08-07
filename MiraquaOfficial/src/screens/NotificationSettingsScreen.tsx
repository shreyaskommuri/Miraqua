import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NotificationSettings {
  quiet_hours_enabled: boolean;
  quiet_start: string;
  quiet_end: string;
  watering_alerts: boolean;
  weather_alerts: boolean;
  device_alerts: boolean;
  chat_replies: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
}

const NotificationSettingsScreen = ({ navigation }: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    quiet_hours_enabled: false,
    quiet_start: "22:00",
    quiet_end: "07:00",
    watering_alerts: true,
    weather_alerts: true,
    device_alerts: true,
    chat_replies: true,
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false
  });
  const [error, setError] = useState("");

  const fetchSettings = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Settings would be loaded from API
    } catch (err) {
      setError("Failed to load notification settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        "Settings saved",
        "Your notification preferences have been updated.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      setError("Failed to save settings");
      Alert.alert("Error", "Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={styles.loadingItem} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification Settings</Text>
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchSettings}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchSettings}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Delivery Methods */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="phone-portrait" size={20} color="white" />
            <Text style={styles.cardTitle}>Delivery Methods</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Switch
                value={settings.push_notifications}
                onValueChange={(value) => updateSetting('push_notifications', value)}
                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#10B981' }}
                thumbColor={settings.push_notifications ? 'white' : 'rgba(255, 255, 255, 0.5)'}
              />
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Email Notifications</Text>
              <Switch
                value={settings.email_notifications}
                onValueChange={(value) => updateSetting('email_notifications', value)}
                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#10B981' }}
                thumbColor={settings.email_notifications ? 'white' : 'rgba(255, 255, 255, 0.5)'}
              />
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>SMS Notifications</Text>
              <Switch
                value={settings.sms_notifications}
                onValueChange={(value) => updateSetting('sms_notifications', value)}
                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#10B981' }}
                thumbColor={settings.sms_notifications ? 'white' : 'rgba(255, 255, 255, 0.5)'}
              />
            </View>
          </View>
        </View>

        {/* Alert Types */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="notifications" size={20} color="white" />
            <Text style={styles.cardTitle}>Alert Types</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Watering Alerts</Text>
                <Text style={styles.settingDescription}>Scheduled watering and completion</Text>
              </View>
              <Switch
                value={settings.watering_alerts}
                onValueChange={(value) => updateSetting('watering_alerts', value)}
                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#10B981' }}
                thumbColor={settings.watering_alerts ? 'white' : 'rgba(255, 255, 255, 0.5)'}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Weather Alerts</Text>
                <Text style={styles.settingDescription}>Rain forecasts and weather changes</Text>
              </View>
              <Switch
                value={settings.weather_alerts}
                onValueChange={(value) => updateSetting('weather_alerts', value)}
                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#10B981' }}
                thumbColor={settings.weather_alerts ? 'white' : 'rgba(255, 255, 255, 0.5)'}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Device Alerts</Text>
                <Text style={styles.settingDescription}>Sensor issues and device status</Text>
              </View>
              <Switch
                value={settings.device_alerts}
                onValueChange={(value) => updateSetting('device_alerts', value)}
                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#10B981' }}
                thumbColor={settings.device_alerts ? 'white' : 'rgba(255, 255, 255, 0.5)'}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>AI Chat Replies</Text>
                <Text style={styles.settingDescription}>AI assistant responses</Text>
              </View>
              <Switch
                value={settings.chat_replies}
                onValueChange={(value) => updateSetting('chat_replies', value)}
                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#10B981' }}
                thumbColor={settings.chat_replies ? 'white' : 'rgba(255, 255, 255, 0.5)'}
              />
            </View>
          </View>
        </View>

        {/* Quiet Hours */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time" size={20} color="white" />
            <Text style={styles.cardTitle}>Quiet Hours</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Enable Quiet Hours</Text>
              <Switch
                value={settings.quiet_hours_enabled}
                onValueChange={(value) => updateSetting('quiet_hours_enabled', value)}
                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#10B981' }}
                thumbColor={settings.quiet_hours_enabled ? 'white' : 'rgba(255, 255, 255, 0.5)'}
              />
            </View>
            
            {settings.quiet_hours_enabled && (
              <View style={styles.timeContainer}>
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>Start Time</Text>
                  <Text style={styles.timeValue}>{settings.quiet_start}</Text>
                </View>
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>End Time</Text>
                  <Text style={styles.timeValue}>{settings.quiet_end}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="reload" size={16} color="white" style={styles.spinningIcon} />
              <Text style={styles.saveButtonText}>Saving...</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>Save Settings</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    padding: 16,
    paddingTop: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    padding: 16,
  },
  loadingItem: {
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  cardContent: {
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    borderRadius: 6,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(16, 185, 129, 0.5)',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  spinningIcon: {
    marginRight: 8,
  },
});

export default NotificationSettingsScreen;
