import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import { getMockScheduleEntry } from '../utils/mockSchedule';
import { environment } from '../config/environment';

interface ScheduleEntry {
  liters: number;
  optimal_time: string;
  explanation?: string;
}

interface CalendarDay {
  date: string;
  day: number;
  isToday: boolean;
  hasWatering: boolean;
  entry: ScheduleEntry | null;
  isCurrentMonth: boolean;
}

const localDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

interface CalendarScreenProps {
  route: any;
  navigation: any;
}

const CalendarScreen = ({ route, navigation }: CalendarScreenProps) => {
  const { plotId } = route.params;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [scheduleData, setScheduleData] = useState<Record<string, ScheduleEntry>>({});
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      const today = new Date();
      const realDates = new Set<string>();
      const data: Record<string, ScheduleEntry> = {};

      try {
        const res = await fetch(`${environment.apiUrl}/get_plan`, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ plot_id: plotId, use_original: false, force_refresh: false }),
        });

        if (res.ok) {
          const json = await res.json();
          const schedule: any[] = json.schedule || [];
          // Any dates not in the real schedule will be filled with mock below
          schedule.forEach((entry: any) => {
            if (!entry.date) return;
            const parts = entry.date.split('/');
            if (parts.length !== 3) return;
            const [month, day, year] = parts;
            const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
            const dateStr = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            realDates.add(dateStr);
            if (entry.liters > 0) {
              data[dateStr] = {
                liters: entry.liters,
                optimal_time: entry.optimal_time || '',
                explanation: entry.explanation,
              };
            }
          });

        }
      } catch (_) {
        // fall through to mock
      }

      // Fill surrounding dates (past 5 days + beyond 14 days up to +30) with mock
      for (let i = -5; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dateStr = localDateStr(d);
        if (realDates.has(dateStr)) continue; // don't overwrite real data
        const mock = getMockScheduleEntry(dateStr);
        if (mock) data[dateStr] = mock;
      }

      setScheduleData(data);
      setLoading(false);
    };

    fetchSchedule();
  }, [plotId]));


  const generateMonthDays = (): CalendarDay[] => {
    const today = new Date();
    const todayStr = localDateStr(today);
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const days: CalendarDay[] = [];

    // Pad start with previous month days
    const startDow = firstDay.getDay();
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), -i);
      days.push({
        date: localDateStr(d),
        day: d.getDate(),
        isToday: false,
        hasWatering: false,
        entry: null,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateStr = localDateStr(d);
      const entry = scheduleData[dateStr] || null;
      days.push({
        date: dateStr,
        day,
        isToday: dateStr === todayStr,
        hasWatering: !!entry,
        entry,
        isCurrentMonth: true,
      });
    }

    // Pad end to 42 cells
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i);
      days.push({
        date: localDateStr(d),
        day: i,
        isToday: false,
        hasWatering: false,
        entry: null,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const calendarDays = generateMonthDays();

  const monthWateringDays = calendarDays.filter(d => d.isCurrentMonth && d.hasWatering).length;
  const monthSkipDays = calendarDays.filter(d => d.isCurrentMonth && !d.hasWatering).length;
  const totalLiters = calendarDays
    .filter(d => d.isCurrentMonth && d.entry)
    .reduce((sum, d) => sum + (d.entry?.liters || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Schedule</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? 'Loading…' : 'Model-generated irrigation plan'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Month navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          >
            <Ionicons name="chevron-back" size={18} color="white" />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          >
            <Ionicons name="chevron-forward" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Month stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{monthWateringDays}</Text>
            <Text style={styles.statLabel}>Irrigating</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{monthSkipDays}</Text>
            <Text style={styles.statLabel}>Skipping</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalLiters}L</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarCard}>
          {/* Day-of-week headers */}
          <View style={styles.daysHeader}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <Text key={d} style={styles.dayHeader}>{d}</Text>
            ))}
          </View>

          {/* Weeks */}
          {Array.from({ length: 6 }, (_, wi) => (
            <View key={wi} style={styles.weekRow}>
              {calendarDays.slice(wi * 7, wi * 7 + 7).map((day, di) => (
                <TouchableOpacity
                  key={`${wi}-${di}`}
                  style={[
                    styles.dayCell,
                    !day.isCurrentMonth && styles.dayFaded,
                    day.isToday && styles.dayToday,
                    day.hasWatering && day.isCurrentMonth && styles.dayWater,
                  ]}
                  onPress={() => {
                    if (day.isCurrentMonth) {
                      navigation.navigate('SpecificDay', {
                        plotId,
                        date: day.date,
                        schedule: day.entry,
                      });
                    }
                  }}
                  activeOpacity={day.isCurrentMonth ? 0.7 : 1}
                >
                  <Text style={[
                    styles.dayNumber,
                    !day.isCurrentMonth && styles.dayNumberFaded,
                    day.isToday && styles.dayNumberToday,
                  ]}>
                    {day.day}
                  </Text>
                  {day.hasWatering && day.isCurrentMonth && (
                    <View style={styles.waterDot} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, styles.legendToday]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, styles.legendWater]} />
            <Text style={styles.legendText}>Irrigating</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, styles.legendSkip]} />
            <Text style={styles.legendText}>Skip day</Text>
          </View>
        </View>

        {/* Ask Miraqua */}
        <TouchableOpacity
          style={styles.askButton}
          onPress={() => navigation.navigate('Chat', { plotId })}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-outline" size={18} color="#1aa179" />
          <Text style={styles.askButtonText}>Ask Miraqua about this month</Text>
          <Ionicons name="arrow-forward" size={16} color="#1aa179" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');
const CELL = Math.floor((width - 40 - 32) / 7);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  calendarCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 14,
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayHeader: {
    width: CELL,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  dayCell: {
    width: CELL,
    height: CELL,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  dayFaded: {
    opacity: 0.25,
  },
  dayToday: {
    backgroundColor: 'rgba(26, 161, 121, 0.18)',
    borderWidth: 1.5,
    borderColor: '#1aa179',
  },
  dayWater: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  dayNumberFaded: {
    color: '#4B5563',
  },
  dayNumberToday: {
    color: '#1aa179',
    fontWeight: '700',
  },
  waterDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#60A5FA',
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendToday: {
    backgroundColor: 'rgba(26, 161, 121, 0.18)',
    borderWidth: 1.5,
    borderColor: '#1aa179',
  },
  legendWater: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.4)',
  },
  legendSkip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  legendText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(26, 161, 121, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(26, 161, 121, 0.25)',
    borderRadius: 14,
    paddingVertical: 14,
  },
  askButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1aa179',
    flex: 1,
    textAlign: 'center',
  },
});

export default CalendarScreen;
