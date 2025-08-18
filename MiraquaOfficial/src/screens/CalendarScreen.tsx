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
  isAdjacentMonth: boolean;
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
    
    // Get the day of week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Add previous month's days before the current month starts
    if (firstDayOfWeek > 0) {
      const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 0);
      const daysInPrevMonth = prevMonth.getDate();
      
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, day);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        days.push({
          date: dateStr,
          day: day,
          dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
          isToday: false,
          hasWatering: false,
          schedule: null,
          isCurrentMonth: false,
          isAdjacentMonth: true
        });
      }
    }
    
    // Generate the actual days of the current month
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
        isCurrentMonth: true,
        isAdjacentMonth: false
      });
    }
    
    // Calculate how many cells we need to complete the grid
    // We want exactly 6 rows × 7 days = 42 cells total
    const totalCells = days.length;
    const targetCells = 42;
    const remainingCells = Math.max(0, targetCells - totalCells);
    
    // Add next month's days to complete the grid
    if (remainingCells > 0) {
      for (let i = 1; i <= remainingCells; i++) {
        const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        days.push({
          date: dateStr,
          day: i,
          dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
          isToday: false,
          hasWatering: false,
          schedule: null,
          isCurrentMonth: false,
          isAdjacentMonth: true
        });
      }
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
            {Array.from({ length: 6 }, (_, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => (
                  <View
                    key={dayIndex}
                    style={[
                      styles.calendarDay,
                      day.isAdjacentMonth && styles.adjacentMonthDay,
                      day.isToday && styles.todayDay,
                      day.hasWatering && styles.scheduledDay,
                    ]}
                  >
                    <Text style={[
                      styles.dayNumber,
                      day.isAdjacentMonth && styles.adjacentMonthText,
                      day.isToday && styles.todayText,
                      day.hasWatering && styles.scheduledText,
                    ]}>
                      {day.day}
                    </Text>
                    {day.hasWatering && day.isCurrentMonth && (
                      <View style={styles.wateringIndicator}>
                        <Ionicons name="water" size={10} color="#3B82F6" />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendCard}>
          <View style={styles.legendContent}>
            <View style={styles.legendItem}>
              <View style={styles.legendToday} />
              <Text style={styles.legendText}>Today</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendScheduled}>
                <Ionicons name="water" size={6} color="#3B82F6" />
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
    justifyContent: 'space-between',
  },
  dayHeader: {
    width: (width - 80) / 7,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  calendarGrid: {
    flexDirection: 'column',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calendarDay: {
    width: (width - 80) / 7,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 1,
    padding: 8,
  },
  todayDay: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduledDay: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  todayText: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  scheduledText: {
    color: 'white',
    fontWeight: '500',
  },
  wateringIndicator: {
    alignItems: 'center',
    marginTop: 2,
  },
  adjacentMonthDay: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  adjacentMonthText: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  legendCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  legendContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendToday: {
    width: 12,
    height: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 3,
    marginRight: 4,
  },
  legendScheduled: {
    width: 12,
    height: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 3,
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendAvailable: {
    width: 12,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
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
