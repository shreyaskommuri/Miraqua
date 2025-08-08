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
        {/* Date Header */}
        <View style={styles.dateHeader}>
          <LinearGradient
            colors={['#10B981', '#3B82F6']}
            style={styles.dateGradient}
          >
            <View style={styles.dateContent}>
              <Ionicons name="calendar" size={24} color="white" />
              <Text style={styles.dateText}>{formatDate(date)}</Text>
              <Text style={styles.dateSubtext}>Plot {plotId} Schedule</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Ionicons name="water" size={20} color="#3B82F6" />
            <Text style={styles.summaryValue}>{getTotalVolume(currentSchedule)}L</Text>
            <Text style={styles.summaryLabel}>Total Water</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="time" size={20} color="#10B981" />
            <Text style={styles.summaryValue}>
              {Object.values(currentSchedule).filter(Boolean).length}
            </Text>
            <Text style={styles.summaryLabel}>Sessions</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="leaf" size={20} color="#F59E0B" />
            <Text style={styles.summaryValue}>
              {getTotalVolume(currentSchedule) * 0.1}%
            </Text>
            <Text style={styles.summaryLabel}>Efficiency</Text>
          </View>
        </View>

        {/* Watering Sessions */}
        <View style={styles.sessionsCard}>
          <Text style={styles.sectionTitle}>Watering Sessions</Text>
          
          {/* Morning Session */}
          <View style={styles.sessionItem}>
            <View style={styles.sessionHeader}>
              <View style={styles.sessionInfo}>
                <Ionicons name="sunny" size={16} color="#F59E0B" />
                <Text style={styles.sessionTitle}>Morning</Text>
              </View>
              {currentSchedule.morning ? (
                <View style={styles.sessionDetails}>
                  <Text style={styles.sessionTime}>{currentSchedule.morning.time}</Text>
                  <Text style={styles.sessionVolume}>{currentSchedule.morning.volume}L</Text>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => handleRemoveWatering('morning')}
                  >
                    <Ionicons name="close" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => handleAddWatering('morning')}
                >
                  <Ionicons name="add" size={16} color="#10B981" />
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Afternoon Session */}
          <View style={styles.sessionItem}>
            <View style={styles.sessionHeader}>
              <View style={styles.sessionInfo}>
                <Ionicons name="partly-sunny" size={16} color="#F59E0B" />
                <Text style={styles.sessionTitle}>Afternoon</Text>
              </View>
              {currentSchedule.afternoon ? (
                <View style={styles.sessionDetails}>
                  <Text style={styles.sessionTime}>{currentSchedule.afternoon.time}</Text>
                  <Text style={styles.sessionVolume}>{currentSchedule.afternoon.volume}L</Text>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => handleRemoveWatering('afternoon')}
                  >
                    <Ionicons name="close" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => handleAddWatering('afternoon')}
                >
                  <Ionicons name="add" size={16} color="#10B981" />
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Evening Session */}
          <View style={styles.sessionItem}>
            <View style={styles.sessionHeader}>
              <View style={styles.sessionInfo}>
                <Ionicons name="moon" size={16} color="#8B5CF6" />
                <Text style={styles.sessionTitle}>Evening</Text>
              </View>
              {currentSchedule.evening ? (
                <View style={styles.sessionDetails}>
                  <Text style={styles.sessionTime}>{currentSchedule.evening.time}</Text>
                  <Text style={styles.sessionVolume}>{currentSchedule.evening.volume}L</Text>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => handleRemoveWatering('evening')}
                  >
                    <Ionicons name="close" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => handleAddWatering('evening')}
                >
                  <Ionicons name="add" size={16} color="#10B981" />
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Settings</Text>
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
              onPress={() => navigation.navigate('ScheduleAnalytics', { plotId })}
            >
              <Ionicons name="analytics" size={20} color="#8B5CF6" />
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('ExportSchedule', { plotId })}
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
  dateHeader: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dateGradient: {
    padding: 20,
  },
  dateContent: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    textAlign: 'center',
  },
  dateSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  sessionsCard: {
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
  sessionItem: {
    marginBottom: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginLeft: 8,
  },
  sessionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginRight: 8,
  },
  sessionVolume: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  addButtonText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 4,
  },
  settingsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 14,
    color: 'white',
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