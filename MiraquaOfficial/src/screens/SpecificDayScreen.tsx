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
  Switch,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ScheduleSlot {
  time: string;
  volume: number;
}

interface ScheduleEntry {
  morning: ScheduleSlot | null;
  afternoon: ScheduleSlot | null;
  evening: ScheduleSlot | null;
}

interface SpecificDayScreenProps {
  route: any;
  navigation: any;
}

const SpecificDayScreen = ({ route, navigation }: SpecificDayScreenProps) => {
  const { plotId, date, schedule } = route.params;
  const [currentSchedule, setCurrentSchedule] = useState<ScheduleEntry>(schedule || {
    morning: null,
    afternoon: null,
    evening: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [autoWatering, setAutoWatering] = useState(true);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTotalVolume = (schedule: ScheduleEntry) => {
    return (schedule.morning?.volume || 0) + 
           (schedule.afternoon?.volume || 0) + 
           (schedule.evening?.volume || 0);
  };

  const handleAddWatering = (period: 'morning' | 'afternoon' | 'evening') => {
    const newSchedule = { ...currentSchedule };
    newSchedule[period] = { time: '06:00', volume: 10 };
    setCurrentSchedule(newSchedule);
    setIsEditing(true);
  };

  const handleRemoveWatering = (period: 'morning' | 'afternoon' | 'evening') => {
    const newSchedule = { ...currentSchedule };
    newSchedule[period] = null;
    setCurrentSchedule(newSchedule);
    setIsEditing(true);
  };

  const handleSaveSchedule = () => {
    Alert.alert('Success', 'Schedule saved successfully!');
    setIsEditing(false);
  };

  const handleWaterNow = () => {
    Alert.alert('Watering', 'Starting manual watering...');
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
            <Ionicons name="calendar" size={20} color="white" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Day Schedule</Text>
            <Text style={styles.headerSubtitle}>{formatDate(date)}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveSchedule}
          disabled={!isEditing}
        >
          <Text style={[styles.saveButtonText, !isEditing && styles.saveButtonDisabled]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Schedule Card */}
        <View style={styles.mainScheduleCard}>
          <LinearGradient
            colors={['#10B981', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainGradient}
          >
            <View style={styles.mainScheduleHeader}>
              <View style={styles.dateIcon}>
                <Ionicons name="calendar" size={24} color="white" />
              </View>
              <View style={styles.dateTextContainer}>
                <Text style={styles.dayOfWeek}>
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
                </Text>
                <Text style={styles.fullDate}>
                  {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
                <Text style={styles.plotLabel}>Plot {plotId} • Add kick-back watering hour schedule</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Scheduled Watering */}
        <View style={styles.scheduledSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionIcon}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              </View>
              <Text style={styles.sectionTitleText}>Scheduled Watering</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="add" size={24} color="#10B981" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.wateringTimeCard}>
            <View style={styles.timeCardLeft}>
              <View style={styles.timeIconWrapper}>
                <Ionicons name="water" size={24} color="#3B82F6" />
              </View>
              <View style={styles.timeDetails}>
                <Text style={styles.largeTime}>7:00 AM</Text>
                <Text style={styles.timeSubtext}>5 min • 10L</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Watering Sessions */}
        <View style={styles.sessionsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionIcon}>
                <Ionicons name="time" size={16} color="#F59E0B" />
              </View>
              <Text style={styles.sectionTitleText}>Watering Sessions</Text>
            </View>
          </View>
          
          <View style={styles.sessionsList}>
            {/* Morning */}
            <TouchableOpacity style={styles.sessionCard}>
              <View style={styles.sessionLeft}>
                <View style={[styles.sessionIconWrapper, { backgroundColor: 'rgba(251, 146, 60, 0.15)' }]}>
                  <Ionicons name="sunny" size={20} color="#FB923C" />
                </View>
                <Text style={styles.sessionText}>Morning</Text>
              </View>
              <TouchableOpacity style={styles.addSessionButton}>
                <Ionicons name="add" size={18} color="#10B981" />
                <Text style={styles.addSessionText}>Add</Text>
              </TouchableOpacity>
            </TouchableOpacity>
            
            {/* Afternoon */}
            <TouchableOpacity style={styles.sessionCard}>
              <View style={styles.sessionLeft}>
                <View style={[styles.sessionIconWrapper, { backgroundColor: 'rgba(251, 146, 60, 0.15)' }]}>
                  <Ionicons name="partly-sunny" size={20} color="#FB923C" />
                </View>
                <Text style={styles.sessionText}>Afternoon</Text>
              </View>
              <TouchableOpacity style={styles.addSessionButton}>
                <Ionicons name="add" size={18} color="#10B981" />
                <Text style={styles.addSessionText}>Add</Text>
              </TouchableOpacity>
            </TouchableOpacity>
            
            {/* Evening */}
            <TouchableOpacity style={styles.sessionCard}>
              <View style={styles.sessionLeft}>
                <View style={[styles.sessionIconWrapper, { backgroundColor: 'rgba(167, 139, 250, 0.15)' }]}>
                  <Ionicons name="moon" size={20} color="#A78BFA" />
                </View>
                <Text style={styles.sessionText}>Evening</Text>
              </View>
              <TouchableOpacity style={styles.addSessionButton}>
                <Ionicons name="add" size={18} color="#10B981" />
                <Text style={styles.addSessionText}>Add</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionIcon}>
                <Ionicons name=\"settings\" size={16} color=\"#8B5CF6\" />
              </View>
              <Text style={styles.sectionTitleText}>Settings</Text>
            </View>
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="settings" size={16} color="#6B7280" />
              <Text style={styles.settingText}>Auto Watering</Text>
            </View>
            <Switch
              value={autoWatering}
              onValueChange={setAutoWatering}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor={autoWatering ? 'white' : '#9CA3AF'}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleWaterNow}
            >
              <Ionicons name="play" size={20} color="#10B981" />
              <Text style={styles.actionText}>Water Now</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('ScheduleSettings', { plotId })}
            >
              <Ionicons name="settings" size={20} color="#3B82F6" />
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Analytics')}
            >
              <Ionicons name="analytics" size={20} color="#8B5CF6" />
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('ExportReports')}
            >
              <Ionicons name="download" size={20} color="#F59E0B" />
              <Text style={styles.actionText}>Export</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

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
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
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
  saveButtonDisabled: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mainScheduleCard: {
    marginBottom: 24,
    marginTop: 8,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  mainGradient: {
    padding: 24,
  },
  mainScheduleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dateIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dateTextContainer: {
    flex: 1,
  },
  dayOfWeek: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  fullDate: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  plotLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  scheduledSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  wateringTimeCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  timeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  timeDetails: {
    flex: 1,
  },
  largeTime: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 4,
  },
  timeSubtext: {
    fontSize: 14,
    color: '#60A5FA',
    fontWeight: '500',
  },
  sessionsSection: {
    marginBottom: 20,
  },
  sessionsList: {
    gap: 12,
  },
  sessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sessionText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  addSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  addSessionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  settingsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 15,
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
  actionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: (width - 64) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: 'white',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SpecificDayScreen; 