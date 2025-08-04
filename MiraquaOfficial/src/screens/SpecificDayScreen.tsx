import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DayData {
  plotId: number;
  date: string;
  hourlyWeather: Array<{
    hour: string;
    temp: number;
    icon: string;
    description: string;
  }>;
  scheduledWatering: {
    time: string;
    duration: number;
    volume: number;
  };
}

export default function SpecificDayScreen({ navigation, route }: any) {
  const { plotId, day, date } = route.params || { plotId: 1, day: 'Today', date: 'Today' };
  
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [watering, setWatering] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('07:00');
  const [scheduleDuration, setScheduleDuration] = useState(5);

  useEffect(() => {
    fetchDayData();
  }, [plotId, date]);

  const fetchDayData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDayData({
        plotId: parseInt(plotId?.toString() || '1'),
        date: date || 'Today',
        hourlyWeather: [
          { hour: '6 AM', temp: 65, icon: 'sun', description: 'Sunny' },
          { hour: '9 AM', temp: 70, icon: 'sun', description: 'Sunny' },
          { hour: '12 PM', temp: 75, icon: 'cloud', description: 'Partly Cloudy' },
          { hour: '3 PM', temp: 78, icon: 'cloud', description: 'Cloudy' },
          { hour: '6 PM', temp: 72, icon: 'rain', description: 'Light Rain' },
          { hour: '9 PM', temp: 68, icon: 'cloud', description: 'Cloudy' }
        ],
        scheduledWatering: {
          time: '7:00 AM',
          duration: 5,
          volume: 15
        }
      });
      
      // Initialize edit state with current values
      setScheduleTime('07:00');
      setScheduleDuration(5);
    } catch (err) {
      setError("Couldn't load day details");
    } finally {
      setLoading(false);
    }
  };

  const handleWaterNow = async () => {
    setWatering(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      Alert.alert('Success', 'Watering completed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to start watering');
    } finally {
      setWatering(false);
    }
  };

  const handleScheduleUpdate = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Schedule updated successfully!');
      setEditingSchedule(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update schedule');
    }
  };

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'sun': return <Ionicons name="sunny" size={24} color="#f59e0b" />;
      case 'cloud': return <Ionicons name="cloudy" size={24} color="#6b7280" />;
      case 'rain': return <Ionicons name="rainy" size={24} color="#3b82f6" />;
      default: return <Ionicons name="cloudy" size={24} color="#6b7280" />;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={styles.loadingCard} />
          ))}
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDayData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#6b7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{dayData?.date}</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Weather Forecast */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hourly Weather</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weatherScroll}>
            {dayData?.hourlyWeather.map((hour, index) => (
              <View key={index} style={styles.weatherCard}>
                <Text style={styles.hourText}>{hour.hour}</Text>
                {getWeatherIcon(hour.icon)}
                <Text style={styles.tempText}>{hour.temp}°F</Text>
                <Text style={styles.descriptionText}>{hour.description}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Scheduled Watering */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scheduled Watering</Text>
          <View style={styles.wateringCard}>
            <View style={styles.wateringHeader}>
              <Ionicons name="water" size={24} color="#3b82f6" />
              <Text style={styles.wateringTitle}>Today's Schedule</Text>
            </View>
            
            <View style={styles.wateringDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="time" size={16} color="#6b7280" />
                <Text style={styles.detailText}>{dayData?.scheduledWatering.time}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="timer" size={16} color="#6b7280" />
                <Text style={styles.detailText}>{dayData?.scheduledWatering.duration} minutes</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="droplets" size={16} color="#6b7280" />
                <Text style={styles.detailText}>{dayData?.scheduledWatering.volume}L</Text>
              </View>
            </View>

            <View style={styles.wateringActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.waterNowButton]} 
                onPress={handleWaterNow}
                disabled={watering}
              >
                {watering ? (
                  <Ionicons name="refresh" size={20} color="white" />
                ) : (
                  <Ionicons name="play" size={20} color="white" />
                )}
                <Text style={styles.actionButtonText}>
                  {watering ? 'Watering...' : 'Water Now'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]} 
                onPress={() => setEditingSchedule(true)}
              >
                <Ionicons name="create" size={20} color="#3b82f6" />
                <Text style={styles.editButtonText}>Edit Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Edit Schedule Modal */}
      <Modal
        visible={editingSchedule}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Watering Schedule</Text>
              <TouchableOpacity onPress={() => setEditingSchedule(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Time</Text>
                <TextInput
                  style={styles.input}
                  value={scheduleTime}
                  onChangeText={setScheduleTime}
                  placeholder="07:00"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration (minutes)</Text>
                <TextInput
                  style={styles.input}
                  value={scheduleDuration.toString()}
                  onChangeText={(text) => setScheduleDuration(parseInt(text) || 0)}
                  placeholder="5"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setEditingSchedule(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleScheduleUpdate}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  weatherScroll: {
    marginBottom: 16,
  },
  weatherCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  hourText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  tempText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 4,
  },
  descriptionText: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  wateringCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  wateringHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  wateringTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  wateringDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
  wateringActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginHorizontal: 4,
  },
  waterNowButton: {
    backgroundColor: '#3B82F6',
  },
  editButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  editButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  loadingContainer: {
    padding: 16,
  },
  loadingCard: {
    height: 80,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalBody: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
}); 