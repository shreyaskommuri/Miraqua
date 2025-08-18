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

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockSchedules: ScheduleEntry[] = [
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
      
      setSchedules(mockSchedules);
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

  const handleSaveSchedule = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a schedule name');
      return;
    }

    const newSchedule: ScheduleEntry = {
      id: editingSchedule?.id || Date.now().toString(),
      ...formData,
    };

    if (editingSchedule) {
      setSchedules(prev => prev.map(s => s.id === editingSchedule.id ? newSchedule : s));
      Alert.alert('Success', 'Schedule updated successfully');
    } else {
      setSchedules(prev => [...prev, newSchedule]);
      Alert.alert('Success', 'Schedule created successfully');
    }

    setShowAddForm(false);
    setEditingSchedule(null);
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
          onPress: () => {
            setSchedules(prev => prev.filter(s => s.id !== scheduleId));
            Alert.alert('Success', 'Schedule deleted successfully');
          },
        },
      ]
    );
  };

  const toggleScheduleActive = (scheduleId: string) => {
    setSchedules(prev =>
      prev.map(s =>
        s.id === scheduleId ? { ...s, isActive: !s.isActive } : s
      )
    );
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
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveSchedule}>
          <Ionicons name="checkmark" size={20} color="white" />
          <Text style={styles.saveButtonText}>
            {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
          </Text>
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
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  summaryCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  scheduleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  scheduleFrequency: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  scheduleActions: {
    marginLeft: 16,
  },
  scheduleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  scheduleFeatures: {
    flexDirection: 'row',
    flex: 1,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  featureText: {
    fontSize: 10,
    color: 'white',
    marginLeft: 4,
  },
  scheduleButtons: {
    flexDirection: 'row',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  editButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 4,
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  formContent: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  formHalf: {
    flex: 0.48,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    color: 'white',
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ScheduleSettingsScreen;
