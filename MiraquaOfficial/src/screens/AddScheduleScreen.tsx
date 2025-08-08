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
              {['daily', 'weekly', 'bi-weekly'].map((freq) => (
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
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
});

export default AddScheduleScreen;
