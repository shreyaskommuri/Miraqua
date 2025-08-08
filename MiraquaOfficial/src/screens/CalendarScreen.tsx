import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
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

interface CalendarDay {
  date: string;
  day: number;
  dayOfWeek: string;
  isToday: boolean;
  hasWatering: boolean;
  schedule: ScheduleEntry | null;
  isCurrentMonth: boolean;
}

interface CalendarScreenProps {
  route: any;
  navigation: any;
}

const CalendarScreen = ({ route, navigation }: CalendarScreenProps) => {
  const { plotId } = route.params;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [scheduleData, setScheduleData] = useState<Record<string, ScheduleEntry>>({});

  // Mock schedule data
  const generateScheduleData = (): Record<string, ScheduleEntry> => {
    const data: Record<string, ScheduleEntry> = {};
    const today = new Date();
    
    for (let i = -10; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (Math.random() > 0.6) {
        data[dateStr] = {
          morning: Math.random() > 0.5 ? { time: '06:00', volume: Math.floor(Math.random() * 15) + 5 } : null,
          afternoon: Math.random() > 0.7 ? { time: '14:00', volume: Math.floor(Math.random() * 10) + 3 } : null,
          evening: Math.random() > 0.8 ? { time: '18:00', volume: Math.floor(Math.random() * 8) + 2 } : null,
        };
      }
    }
    
    return data;
  };

  const generateMonthDays = (): CalendarDay[] => {
    const today = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const days: CalendarDay[] = [];
    
    // Generate only the days that belong to the current month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateStr = currentDate.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];
      const isToday = dateStr === todayStr;
      
      const schedule = scheduleData[dateStr];
      const hasWatering = !!schedule;
      
      days.push({
        date: dateStr,
        day: currentDate.getDate(),
        dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday,
        hasWatering,
        schedule,
        isCurrentMonth: true
      });
    }
    
    return days;
  };

  const getTotalVolume = (schedule: ScheduleEntry | null) => {
    if (!schedule) return 0;
    return (schedule.morning?.volume || 0) + (schedule.afternoon?.volume || 0) + (schedule.evening?.volume || 0);
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    // Navigate to specific day view
    navigation.navigate('SpecificDay', { 
      plotId, 
      date: dateStr,
      schedule: scheduleData[dateStr] || null
    });
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const calendarDays = generateMonthDays();

  useEffect(() => {
    setScheduleData(generateScheduleData());
  }, []);

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
            <Text style={styles.headerTitle}>Calendar</Text>
            <Text style={styles.headerSubtitle}>Plot {plotId} Schedule</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar Header */}
        <View style={styles.calendarHeader}>
          <LinearGradient
            colors={['#10B981', '#3B82F6']}
            style={styles.calendarGradient}
          >
            <View style={styles.calendarHeaderContent}>
              <View style={styles.calendarTitle}>
                <View style={styles.calendarIcon}>
                  <Ionicons name="calendar" size={16} color="white" />
                </View>
                <View>
                  <Text style={styles.monthTitle}>
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
                  <Text style={styles.calendarSubtitle}>Tap dates for details</Text>
                </View>
              </View>
              
              <View style={styles.monthNavigation}>
                <TouchableOpacity 
                  style={styles.navButton}
                  onPress={goToPreviousMonth}
                >
                  <Ionicons name="chevron-back" size={16} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.navButton}
                  onPress={goToNextMonth}
                >
                  <Ionicons name="chevron-forward" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarCard}>
          {/* Days of Week Header */}
          <View style={styles.daysHeader}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Text key={day} style={styles.dayHeader}>{day}</Text>
            ))}
          </View>

          {/* Calendar Days Grid */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((day) => (
              <TouchableOpacity
                key={day.date}
                style={[
                  styles.calendarDay,
                  day.isToday && styles.todayDay,
                  day.hasWatering && styles.scheduledDay,
                ]}
                onPress={() => handleDateSelect(day.date)}
              >
                <Text style={[
                  styles.dayNumber,
                  day.isToday && styles.todayText,
                  day.hasWatering && styles.scheduledText,
                ]}>
                  {day.day}
                </Text>
                {day.hasWatering && (
                  <View style={styles.wateringIndicator}>
                    <Ionicons name="water" size={8} color="#3B82F6" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={styles.legendToday}>
                <View style={styles.legendTodayDot} />
              </View>
              <Text style={styles.legendText}>Today</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendScheduled}>
                <Ionicons name="water" size={12} color="#3B82F6" />
              </View>
              <Text style={styles.legendText}>Scheduled</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendAvailable} />
              <Text style={styles.legendText}>Available</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('AddSchedule', { plotId })}
            >
              <Ionicons name="add" size={20} color="#10B981" />
              <Text style={styles.actionText}>Add Schedule</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  calendarHeader: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  calendarGradient: {
    padding: 20,
  },
  calendarHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  calendarSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  calendarCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: (width - 80) / 7,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  todayDay: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#059669',
  },
  scheduledDay: {
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  todayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scheduledText: {
    color: '#1E40AF',
    fontWeight: '500',
  },
  wateringIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  legendCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    alignItems: 'center',
  },
  legendToday: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#10B981',
    marginBottom: 4,
  },
  legendTodayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    alignSelf: 'center',
    marginTop: 2,
  },
  legendScheduled: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendAvailable: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 4,
  },
  legendText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  actionsCard: {
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

export default CalendarScreen;
