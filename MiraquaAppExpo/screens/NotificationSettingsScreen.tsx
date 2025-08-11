import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

const NotificationSettingsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [wateringReminders, setWateringReminders] = useState(true);
  const [rainForecastAlerts, setRainForecastAlerts] = useState(true);
  const [lowMoistureAlerts, setLowMoistureAlerts] = useState(true);

  const handleSaveSettings = () => {
    // TODO: Implement save functionality
    console.log('Saving notification settings:', {
      wateringReminders,
      rainForecastAlerts,
      lowMoistureAlerts
    });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#666" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="notifications-outline" size={24} color="#1aa179" />
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.notificationTypesSection}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          
          <View style={styles.notificationOption}>
            <Text style={styles.optionText}>Watering reminders</Text>
            <Switch
              value={wateringReminders}
              onValueChange={setWateringReminders}
              trackColor={{ false: '#e0e0e0', true: '#1aa179' }}
              thumbColor={wateringReminders ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.notificationOption}>
            <Text style={styles.optionText}>Rain forecast alerts</Text>
            <Switch
              value={rainForecastAlerts}
              onValueChange={setRainForecastAlerts}
              trackColor={{ false: '#e0e0e0', true: '#1aa179' }}
              thumbColor={rainForecastAlerts ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.notificationOption}>
            <Text style={styles.optionText}>Low moisture alerts</Text>
            <Switch
              value={lowMoistureAlerts}
              onValueChange={setLowMoistureAlerts}
              trackColor={{ false: '#e0e0e0', true: '#1aa179' }}
              thumbColor={lowMoistureAlerts ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#1a1a1a',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  notificationTypesSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 20,
    fontWeight: '500',
  },
  notificationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#1aa179',
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationSettingsScreen; 