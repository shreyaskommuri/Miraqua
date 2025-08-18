import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AddScheduleScreenProps {
  route: any;
  navigation: any;
}

const AddScheduleScreen = ({ route, navigation }: AddScheduleScreenProps) => {
  const { plotId } = route.params;
  const [scheduleName, setScheduleName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [wateringTime, setWateringTime] = useState('06:00');
  const [duration, setDuration] = useState('5');
  const [volume, setVolume] = useState('10');
  const [isActive, setIsActive] = useState(true);
  
  // Advanced scheduling options
  const [smartScheduling, setSmartScheduling] = useState(true);
  const [weatherIntegration, setWeatherIntegration] = useState(true);
  const [moistureThreshold, setMoistureThreshold] = useState('65');
  const [skipRainyDays, setSkipRainyDays] = useState(true);
  const [multipleTimes, setMultipleTimes] = useState(false);
  const [secondaryTime, setSecondaryTime] = useState('18:00');
  const [secondaryDuration, setSecondaryDuration] = useState('3');
  const [zoneSpecific, setZoneSpecific] = useState(false);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [seasonalAdjustment, setSeasonalAdjustment] = useState(true);
  const [customDays, setCustomDays] = useState<string[]>([]);
  const [exceptions, setExceptions] = useState<string[]>([]);

  const handleSaveSchedule = () => {
    if (!scheduleName || !startDate || !endDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    Alert.alert('Success', 'Schedule created successfully!');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="add" size={20} color="white" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Add Schedule</Text>
            <Text style={styles.headerSubtitle}>Plot {plotId}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveSchedule}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Schedule Header */}
        <View style={styles.scheduleHeader}>
          <LinearGradient
            colors={['#10B981', '#3B82F6']}
            style={styles.scheduleGradient}
          >
            <View style={styles.scheduleContent}>
              <Ionicons name="calendar" size={24} color="white" />
              <Text style={styles.scheduleText}>New Watering Schedule</Text>
              <Text style={styles.scheduleSubtext}>Configure your automated watering</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Schedule Form */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Schedule Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Schedule Name *</Text>
            <TextInput
              style={styles.textInput}
              value={scheduleName}
              onChangeText={setScheduleName}
              placeholder="Enter schedule name"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Start Date *</Text>
            <TextInput
              style={styles.textInput}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>End Date *</Text>
            <TextInput
              style={styles.textInput}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Frequency</Text>
            <View style={styles.frequencyButtons}>
              {['daily', 'weekly', 'bi-weekly', 'custom'].map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.frequencyButton,
                    frequency === freq && styles.frequencyButtonActive
                  ]}
                  onPress={() => setFrequency(freq)}
                >
                  <Text style={[
                    styles.frequencyText,
                    frequency === freq && styles.frequencyTextActive
                  ]}>
                    {freq === 'bi-weekly' ? 'Bi-weekly' : freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {frequency === 'custom' && (
              <View style={styles.customDaysContainer}>
                <Text style={styles.customDaysLabel}>Select Days</Text>
                <View style={styles.daysGrid}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayButton,
                        customDays.includes(day) && styles.dayButtonActive
                      ]}
                      onPress={() => {
                        if (customDays.includes(day)) {
                          setCustomDays(customDays.filter(d => d !== day));
                        } else {
                          setCustomDays([...customDays, day]);
                        }
                      }}
                    >
                      <Text style={[
                        styles.dayButtonText,
                        customDays.includes(day) && styles.dayButtonTextActive
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Watering Settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Watering Settings</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Watering Time</Text>
            <TextInput
              style={styles.textInput}
              value={wateringTime}
              onChangeText={setWateringTime}
              placeholder="06:00"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Duration (minutes)</Text>
            <TextInput
              style={styles.textInput}
              value={duration}
              onChangeText={setDuration}
              placeholder="5"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Volume (L)</Text>
            <TextInput
              style={styles.textInput}
              value={volume}
              onChangeText={setVolume}
              placeholder="10"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <View style={styles.optionItem}>
              <View style={styles.optionInfo}>
                <Ionicons name="time" size={16} color="#6B7280" />
                <Text style={styles.optionText}>Multiple watering times</Text>
              </View>
              <Switch
                value={multipleTimes}
                onValueChange={setMultipleTimes}
                trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                thumbColor={multipleTimes ? 'white' : '#9CA3AF'}
              />
            </View>
            
            {multipleTimes && (
              <View style={styles.secondaryTimeContainer}>
                <Text style={styles.secondaryTimeLabel}>Evening Watering</Text>
                <View style={styles.timeInputRow}>
                  <TextInput
                    style={[styles.textInput, styles.timeInput]}
                    value={secondaryTime}
                    onChangeText={setSecondaryTime}
                    placeholder="18:00"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  />
                  <TextInput
                    style={[styles.textInput, styles.durationInput]}
                    value={secondaryDuration}
                    onChangeText={setSecondaryDuration}
                    placeholder="3"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    keyboardType="numeric"
                  />
                  <Text style={styles.durationUnit}>min</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Smart Scheduling */}
        <View style={styles.smartCard}>
          <View style={styles.smartHeader}>
            <Ionicons name="sparkles" size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Smart Scheduling</Text>
          </View>
          
          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Ionicons name="analytics" size={16} color="#6B7280" />
              <Text style={styles.optionText}>AI-powered optimization</Text>
            </View>
            <Switch
              value={smartScheduling}
              onValueChange={setSmartScheduling}
              trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
              thumbColor={smartScheduling ? 'white' : '#9CA3AF'}
            />
          </View>
          
          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Ionicons name="sunny" size={16} color="#6B7280" />
              <Text style={styles.optionText}>Weather integration</Text>
            </View>
            <Switch
              value={weatherIntegration}
              onValueChange={setWeatherIntegration}
              trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
              thumbColor={weatherIntegration ? 'white' : '#9CA3AF'}
            />
          </View>
          
          {weatherIntegration && (
            <View style={styles.optionItem}>
              <View style={styles.optionInfo}>
                <Ionicons name="rainy" size={16} color="#6B7280" />
                <Text style={styles.optionText}>Skip on rainy days</Text>
              </View>
              <Switch
                value={skipRainyDays}
                onValueChange={setSkipRainyDays}
                trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                thumbColor={skipRainyDays ? 'white' : '#9CA3AF'}
              />
            </View>
          )}
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Moisture Threshold (%)</Text>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: `${moistureThreshold}%` }]} />
              </View>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>20% (Dry)</Text>
                <Text style={styles.sliderLabel}>{moistureThreshold}%</Text>
                <Text style={styles.sliderLabel}>100% (Saturated)</Text>
              </View>
            </View>
            <TextInput
              style={[styles.textInput, styles.thresholdInput]}
              value={moistureThreshold}
              onChangeText={setMoistureThreshold}
              placeholder="65"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Options */}
        <View style={styles.optionsCard}>
          <Text style={styles.sectionTitle}>Options</Text>
          
          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Ionicons name="play" size={16} color="#6B7280" />
              <Text style={styles.optionText}>Activate immediately</Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor={isActive ? 'white' : '#9CA3AF'}
            />
          </View>
          
          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Ionicons name="leaf" size={16} color="#6B7280" />
              <Text style={styles.optionText}>Seasonal adjustments</Text>
            </View>
            <Switch
              value={seasonalAdjustment}
              onValueChange={setSeasonalAdjustment}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor={seasonalAdjustment ? 'white' : '#9CA3AF'}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleSaveSchedule}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.createButtonText}>Create Schedule</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scheduleHeader: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scheduleGradient: {
    padding: 20,
  },
  scheduleContent: {
    alignItems: 'center',
  },
  scheduleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    textAlign: 'center',
  },
  scheduleSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: '#10B981',
  },
  frequencyText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  frequencyTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  settingsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  optionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 8,
  },
  actionsCard: {
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  
  // Custom days styling
  customDaysContainer: {
    marginTop: 12,
  },
  customDaysLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dayButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  dayButtonText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  dayButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  
  // Multiple times styling
  secondaryTimeContainer: {
    marginTop: 12,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  secondaryTimeLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInput: {
    flex: 1,
  },
  durationInput: {
    width: 80,
  },
  durationUnit: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  
  // Smart scheduling styling
  smartCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  smartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  // Slider styling
  sliderContainer: {
    marginTop: 8,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    position: 'relative',
    marginBottom: 8,
  },
  sliderFill: {
    height: 6,
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  thresholdInput: {
    width: 80,
    alignSelf: 'center',
    textAlign: 'center',
  },
});

export default AddScheduleScreen;
