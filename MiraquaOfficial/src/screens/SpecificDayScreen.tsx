import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { environment } from '../config/environment';

interface ScheduleEntry {
  liters: number;
  optimal_time: string;
  explanation?: string;
}

interface SpecificDayScreenProps {
  route: any;
  navigation: any;
}

const SpecificDayScreen = ({ route, navigation }: SpecificDayScreenProps) => {
  const { plotId, date } = route.params as { plotId: string; date: string };

  const [schedule, setSchedule] = useState<ScheduleEntry | null>(
    route.params.schedule ?? null
  );
  const [loading, setLoading] = useState(!route.params.schedule);

  useEffect(() => {
    // Always fetch from API to ensure data is current
    const fetchEntry = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${environment.apiUrl}/get_plan`, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ plot_id: plotId, use_original: false, force_refresh: false }),
        });
        if (res.ok) {
          const json = await res.json();
          const entries: any[] = json.schedule || [];
          const found = entries.find((entry: any) => {
            if (!entry.date) return false;
            const parts = entry.date.split('/');
            if (parts.length !== 3) return false;
            const [m, d, y] = parts;
            const fullYear = parseInt(y) < 50 ? `20${y}` : `19${y}`;
            return `${fullYear}-${m.padStart(2, '0')}-${d.padStart(2, '0')}` === date;
          });
          setSchedule(found && found.liters > 0 ? {
            liters: found.liters,
            optimal_time: found.optimal_time || '',
            explanation: found.explanation,
          } : null);
        }
      } catch (e) {
        // keep whatever was passed via route params
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [plotId, date]);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isWateringDay = !!schedule && schedule.liters > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Day Schedule</Text>
          <Text style={styles.headerSubtitle}>{formatDate(date)}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#1aa179" size="large" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Status Banner */}
          <View style={[styles.banner, isWateringDay ? styles.bannerWater : styles.bannerSkip]}>
            <Ionicons
              name={isWateringDay ? 'water' : 'checkmark-circle-outline'}
              size={28}
              color={isWateringDay ? '#60A5FA' : '#6B7280'}
            />
            <Text style={[styles.bannerTitle, !isWateringDay && styles.bannerTitleSkip]}>
              {isWateringDay ? 'Irrigation Scheduled' : 'Skip Day'}
            </Text>
            <Text style={styles.bannerSub}>
              {isWateringDay ? 'Irrigation planned for this day' : 'No watering needed today'}
            </Text>
          </View>

          {isWateringDay && schedule ? (
            <>
              {/* Main stats */}
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Ionicons name="water" size={20} color="#60A5FA" />
                  <Text style={styles.statValue}>{schedule.liters}L</Text>
                  <Text style={styles.statLabel}>Volume</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="time-outline" size={20} color="#1aa179" />
                  <Text style={styles.statValue}>{schedule.optimal_time || '—'}</Text>
                  <Text style={styles.statLabel}>Optimal Time</Text>
                </View>
              </View>

              {/* Explanation */}
              {schedule.explanation ? (
                <View style={styles.explainCard}>
                  <View style={styles.explainHeader}>
                    <Ionicons name="bulb-outline" size={16} color="#F59E0B" />
                    <Text style={styles.explainTitle}>Why this schedule?</Text>
                  </View>
                  <Text style={styles.explainText}>{schedule.explanation}</Text>
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.skipInfo}>
              <Text style={styles.skipText}>
                The model determined irrigation is not needed on this day — soil moisture and forecast conditions are sufficient.
              </Text>
            </View>
          )}

          {/* Ask Miraqua */}
          <TouchableOpacity
            style={styles.askButton}
            onPress={() => navigation.navigate('Chat', {
              plotId,
              contextDate: date,
              contextSchedule: schedule,
            })}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#1aa179" />
            <Text style={styles.askButtonText}>Adjust this day in chat</Text>
            <Ionicons name="arrow-forward" size={16} color="#1aa179" />
          </TouchableOpacity>
        </ScrollView>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  banner: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  bannerWater: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  bannerSkip: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#60A5FA',
    letterSpacing: -0.4,
  },
  bannerTitleSkip: {
    color: '#6B7280',
  },
  bannerSub: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  explainCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  explainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  explainTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  explainText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  skipInfo: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 16,
  },
  skipText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
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
    marginTop: 4,
  },
  askButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1aa179',
    flex: 1,
    textAlign: 'center',
  },
});

export default SpecificDayScreen;
