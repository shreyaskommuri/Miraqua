import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Switch,
  TextInput,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ScheduleEntry {
  id: string;
  name: string;
  startTime: string;
  duration: number;
  volume: number;
  frequency: 'daily' | 'weekly' | 'custom';
  days: string[];
  isActive: boolean;
  smartScheduling: boolean;
  weatherIntegration: boolean;
  moistureThreshold: number;
}

interface ScheduleSettingsScreenProps {
  route: any;
  navigation: any;
}

const ScheduleSettingsScreen = ({ route, navigation }: ScheduleSettingsScreenProps) => {
  const { plotId } = route.params;
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleEntry | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state for editing/adding schedules
  const [formData, setFormData] = useState({
    name: '',
    startTime: '06:00',
    duration: 5,
    volume: 10,
    frequency: 'daily' as 'daily' | 'weekly' | 'custom',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    isActive: true,
    smartScheduling: true,
    weatherIntegration: true,
    moistureThreshold: 65,
  });

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Storage key for schedules
  const getStorageKey = () => `schedules_plot_${plotId}`;

  // Save schedules to storage
  const saveSchedulesToStorage = async (schedulesToSave: ScheduleEntry[]) => {
    try {
      await AsyncStorage.setItem(getStorageKey(), JSON.stringify(schedulesToSave));
    } catch (error) {
      console.error('Failed to save schedules to storage:', error);
    }
  };

  // Load schedules from storage
  const loadSchedulesFromStorage = async (): Promise<ScheduleEntry[]> => {
    try {
      const stored = await AsyncStorage.getItem(getStorageKey());
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load schedules from storage:', error);
    }
    return [];
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      // First try to load from storage
      const storedSchedules = await loadSchedulesFromStorage();
      
      if (storedSchedules.length > 0) {
        setSchedules(storedSchedules);
      } else {
        // If no stored schedules, load default mock data
        const defaultSchedules: ScheduleEntry[] = [
          {
            id: '1',
            name: 'Morning Watering',
            startTime: '06:00',
            duration: 5,
            volume: 15,
            frequency: 'daily',
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            isActive: true,
            smartScheduling: true,
            weatherIntegration: true,
            moistureThreshold: 65,
          },
          {
            id: '2',
            name: 'Evening Boost',
            startTime: '18:00',
            duration: 3,
            volume: 8,
            frequency: 'custom',
            days: ['monday', 'wednesday', 'friday'],
            isActive: true,
            smartScheduling: false,
            weatherIntegration: true,
            moistureThreshold: 50,
          }
        ];
        
        setSchedules(defaultSchedules);
        // Save the default schedules for future loads
        await saveSchedulesToStorage(defaultSchedules);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchedule = (schedule: ScheduleEntry) => {
    setEditingSchedule(schedule);
    setFormData({
      name: schedule.name,
      startTime: schedule.startTime,
      duration: schedule.duration,
      volume: schedule.volume,
      frequency: schedule.frequency,
      days: schedule.days,
      isActive: schedule.isActive,
      smartScheduling: schedule.smartScheduling,
      weatherIntegration: schedule.weatherIntegration,
      moistureThreshold: schedule.moistureThreshold,
    });
    setShowAddForm(true);
  };

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setFormData({
      name: '',
      startTime: '06:00',
      duration: 5,
      volume: 10,
      frequency: 'daily',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      isActive: true,
      smartScheduling: true,
      weatherIntegration: true,
      moistureThreshold: 65,
    });
    setShowAddForm(true);
  };

  const handleSaveSchedule = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a schedule name');
      return;
    }

    setSaving(true);
    try {
      const newSchedule: ScheduleEntry = {
        id: editingSchedule?.id || Date.now().toString(),
        ...formData,
      };

      let updatedSchedules: ScheduleEntry[];

      if (editingSchedule) {
        // Update existing schedule
        updatedSchedules = schedules.map(s => s.id === editingSchedule.id ? newSchedule : s);
        setSchedules(updatedSchedules);
      } else {
        // Add new schedule
        updatedSchedules = [...schedules, newSchedule];
        setSchedules(updatedSchedules);
      }

      // Save to storage
      await saveSchedulesToStorage(updatedSchedules);

      // Show success message
      Alert.alert('Success', editingSchedule ? 'Schedule updated successfully' : 'Schedule created successfully');

      setShowAddForm(false);
      setEditingSchedule(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to save schedule. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedSchedules = schedules.filter(s => s.id !== scheduleId);
              setSchedules(updatedSchedules);
              await saveSchedulesToStorage(updatedSchedules);
              Alert.alert('Success', 'Schedule deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete schedule. Please try again.');
            }
          },
        },
      ]
    );
  };

  const toggleScheduleActive = async (scheduleId: string) => {
    try {
      const updatedSchedules = schedules.map(s =>
        s.id === scheduleId ? { ...s, isActive: !s.isActive } : s
      );
      setSchedules(updatedSchedules);
      await saveSchedulesToStorage(updatedSchedules);
    } catch (error) {
      Alert.alert('Error', 'Failed to update schedule status. Please try again.');
    }
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day],
    }));
  };

  const renderScheduleItem = (schedule: ScheduleEntry) => (
    <View key={schedule.id} style={styles.scheduleCard}>
      <View style={styles.scheduleHeader}>
        <View style={styles.scheduleInfo}>
          <Text style={styles.scheduleName}>{schedule.name}</Text>
          <Text style={styles.scheduleTime}>
            {schedule.startTime} • {schedule.duration} min • {schedule.volume}L
          </Text>
          <Text style={styles.scheduleFrequency}>
            {schedule.frequency === 'daily' ? 'Daily' : 
             schedule.frequency === 'weekly' ? 'Weekly' : 
             `Custom (${schedule.days.length} days)`}
          </Text>
        </View>
        <View style={styles.scheduleActions}>
          <Switch
            value={schedule.isActive}
            onValueChange={() => toggleScheduleActive(schedule.id)}
            trackColor={{ false: '#D1D5DB', true: '#10B981' }}
            thumbColor={'white'}
          />
        </View>
      </View>
      
      <View style={styles.scheduleDetails}>
        <View style={styles.scheduleFeatures}>
          {schedule.smartScheduling && (
            <View style={styles.featureBadge}>
              <Ionicons name="flash" size={12} color="#10B981" />
              <Text style={styles.featureText}>Smart</Text>
            </View>
          )}
          {schedule.weatherIntegration && (
            <View style={styles.featureBadge}>
              <Ionicons name="partly-sunny" size={12} color="#3B82F6" />
              <Text style={styles.featureText}>Weather</Text>
            </View>
          )}
          <View style={styles.featureBadge}>
            <Ionicons name="water" size={12} color="#8B5CF6" />
            <Text style={styles.featureText}>{schedule.moistureThreshold}%</Text>
          </View>
        </View>
        
        <View style={styles.scheduleButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditSchedule(schedule)}
          >
            <Ionicons name="pencil" size={16} color="#3B82F6" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteSchedule(schedule.id)}
          >
            <Ionicons name="trash" size={16} color="#EF4444" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEditForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>
          {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
        </Text>
        <TouchableOpacity onPress={() => setShowAddForm(false)}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
        {/* Schedule Name */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Schedule Name</Text>
          <TextInput
            style={styles.textInput}
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="e.g., Morning Watering"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>

        {/* Time and Duration */}
        <View style={styles.formRow}>
          <View style={styles.formHalf}>
            <Text style={styles.formLabel}>Start Time</Text>
            <TextInput
              style={styles.textInput}
              value={formData.startTime}
              onChangeText={(text) => setFormData(prev => ({ ...prev, startTime: text }))}
              placeholder="06:00"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
          </View>
          <View style={styles.formHalf}>
            <Text style={styles.formLabel}>Duration (min)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.duration.toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, duration: parseInt(text) || 0 }))}
              placeholder="5"
              keyboardType="numeric"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
          </View>
        </View>

        {/* Volume and Threshold */}
        <View style={styles.formRow}>
          <View style={styles.formHalf}>
            <Text style={styles.formLabel}>Volume (L)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.volume.toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, volume: parseInt(text) || 0 }))}
              placeholder="10"
              keyboardType="numeric"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
          </View>
          <View style={styles.formHalf}>
            <Text style={styles.formLabel}>Moisture Threshold (%)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.moistureThreshold.toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, moistureThreshold: parseInt(text) || 0 }))}
              placeholder="65"
              keyboardType="numeric"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
          </View>
        </View>

        {/* Frequency */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Frequency</Text>
          <View style={styles.frequencyButtons}>
            {(['daily', 'weekly', 'custom'] as const).map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.frequencyButton,
                  formData.frequency === freq && styles.frequencyButtonActive,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, frequency: freq }))}
              >
                <Text
                  style={[
                    styles.frequencyButtonText,
                    formData.frequency === freq && styles.frequencyButtonTextActive,
                  ]}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Days Selection (for custom frequency) */}
        {formData.frequency === 'custom' && (
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Select Days</Text>
            <View style={styles.daysGrid}>
              {daysOfWeek.map((day) => (
                <TouchableOpacity
                  key={day.key}
                  style={[
                    styles.dayButton,
                    formData.days.includes(day.key) && styles.dayButtonActive,
                  ]}
                  onPress={() => toggleDay(day.key)}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      formData.days.includes(day.key) && styles.dayButtonTextActive,
                    ]}
                  >
                    {day.label.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Smart Features */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Smart Features</Text>
          
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Smart Scheduling</Text>
              <Text style={styles.switchDescription}>AI optimizes timing based on conditions</Text>
            </View>
            <Switch
              value={formData.smartScheduling}
              onValueChange={(value) => setFormData(prev => ({ ...prev, smartScheduling: value }))}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor={'white'}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Weather Integration</Text>
              <Text style={styles.switchDescription}>Skip watering on rainy days</Text>
            </View>
            <Switch
              value={formData.weatherIntegration}
              onValueChange={(value) => setFormData(prev => ({ ...prev, weatherIntegration: value }))}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor={'white'}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={handleSaveSchedule}
          disabled={saving}
        >
          {saving ? (
            <>
              <Ionicons name="hourglass" size={20} color="white" />
              <Text style={styles.saveButtonText}>Saving...</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={styles.saveButtonText}>
                {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading schedules...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header */}
      <LinearGradient colors={['#1F2937', '#374151']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Schedule Settings</Text>
          <TouchableOpacity onPress={handleAddSchedule} style={styles.addButton}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      {showAddForm ? (
        renderEditForm()
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {schedules.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
              <Text style={styles.emptyTitle}>No Schedules Yet</Text>
              <Text style={styles.emptySubtitle}>
                Create your first watering schedule to get started
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={handleAddSchedule}>
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.emptyButtonText}>Add Schedule</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Active Schedules</Text>
                <Text style={styles.summaryCount}>
                  {schedules.filter(s => s.isActive).length} of {schedules.length}
                </Text>
              </View>
              
              {schedules.map(renderScheduleItem)}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  header: {
    paddingTop: 15,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  addButton: {
    padding: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  summaryCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
  },
  summaryCount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#10B981',
  },
  scheduleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  scheduleInfo: {
    flex: 1,
    paddingRight: 16,
  },
  scheduleName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 6,
  },
  scheduleTime: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    fontWeight: '500',
  },
  scheduleFrequency: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  scheduleActions: {
    alignItems: 'center',
  },
  scheduleDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  scheduleFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 11,
    color: 'white',
    marginLeft: 4,
    fontWeight: '500',
  },
  scheduleButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  editButtonText: {
    fontSize: 13,
    color: '#3B82F6',
    marginLeft: 4,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteButtonText: {
    fontSize: 13,
    color: '#EF4444',
    marginLeft: 4,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  formContainer: {
    flex: 1,
  },
  formHeader: {
    backgroundColor: '#1F2937',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  formContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  formSection: {
    marginBottom: 28,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  formHalf: {
    flex: 0.47,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    fontWeight: '500',
  },
  frequencyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  frequencyButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  frequencyButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  frequencyButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 40,
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  dayButtonText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  dayButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  switchInfo: {
    flex: 1,
    paddingRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: 'white',
    marginBottom: 4,
    fontWeight: '600',
  },
  switchDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 18,
    marginTop: 32,
    marginBottom: 60,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(16, 185, 129, 0.5)',
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default ScheduleSettingsScreen;
