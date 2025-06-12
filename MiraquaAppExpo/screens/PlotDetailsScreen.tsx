import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import {
  useRoute,
  useNavigation,
  RouteProp,
  useFocusEffect,
  CompositeNavigationProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { HomeStackParamList } from '../navigation/HomeStackNavigator';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { EXPO_PUBLIC_MYIPADRESS } from '@env';
import { parse, format, differenceInYears } from 'date-fns';
import { parseISO } from 'date-fns';

const BASE_URL = `http://${EXPO_PUBLIC_MYIPADRESS}:5050`;

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'PlotDetails'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const PlotDetailsScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'PlotDetails'>>();
  const navigation = useNavigation<NavigationProp>();
  const { plot } = route.params;

  const [tab, setTab] = useState<'schedule' | 'details'>('details');
  const [schedule, setSchedule] = useState<any[]>([]);
  const [originalSchedule, setOriginalSchedule] = useState<any[]>([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [avgMoisture, setAvgMoisture] = useState('--');
  const [avgTemp, setAvgTemp] = useState('--');
  const [avgSunlight, setAvgSunlight] = useState('--');
  const [showModified, setShowModified] = useState(true);

  // Ref for managing the delayed re-fetch (polling) for the summary
  const summaryPollingRef = useRef<{
    timeoutId: NodeJS.Timeout | null;
    attempts: number;
    maxAttempts: number;
    delay: number;
  }>({ timeoutId: null, attempts: 0, maxAttempts: 5, delay: 3000 });

  const fetchSchedule = useCallback(async (retries = 3) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/get_plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plot_id: plot.id,
          lat: plot.lat,
          lon: plot.lon,
          crop: plot.crop.toLowerCase(),
          area: plot.area || 100,
          zip_code: plot.zip_code,
          flex_type: plot.flex_type || 'daily',
        }),
      });

      const json = await response.json();

      setOriginalSchedule(json.schedule || []);
      setSchedule(json.schedule || []); 

      setSummary(json.gem_summary || json.summary || 'No irrigation schedule found for this plot.');

      setAvgMoisture(
        typeof json.moisture === 'number' ? `${json.moisture.toFixed(2)}%` : '--'
      );

      setAvgTemp(
        typeof json.current_temp_f === 'number' ? `${json.current_temp_f.toFixed(1)}°F` : '--'
      );

      setAvgSunlight(
        typeof json.sunlight === 'number' ? `${json.sunlight.toFixed(0)}%` : '--'
      );
    } catch (err: any) {
      console.error('Error fetching schedule:', err);
      if (retries > 0) {
        console.log(`Retrying fetchSchedule... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
        return fetchSchedule(retries - 1);
      }
      setSummary('Failed to load schedule.');
      setAvgMoisture('--');
      setAvgTemp('--');
      setAvgSunlight('--');
    } finally {
      setLoading(false);
    }
  }, [plot.id, plot.lat, plot.lon, plot.crop, plot.area, plot.zip_code, plot.flex_type]);

  useFocusEffect(
    useCallback(() => {
      // Reset polling attempts when the screen gains focus or plot.id changes
      if (summaryPollingRef.current.timeoutId) {
        clearTimeout(summaryPollingRef.current.timeoutId);
        summaryPollingRef.current.timeoutId = null;
      }
      summaryPollingRef.current.attempts = 0;

      // Initial fetch when the screen comes into focus or plot.id changes
      fetchSchedule();

      // Cleanup function for when the component unmounts or loses focus
      return () => {
        if (summaryPollingRef.current.timeoutId) {
          clearTimeout(summaryPollingRef.current.timeoutId);
          summaryPollingRef.current.timeoutId = null;
        }
      };
    }, [plot.id, fetchSchedule])
  );

  // useEffect for polling the summary if it's not immediately available
  useEffect(() => {
    const { timeoutId, attempts, maxAttempts, delay } = summaryPollingRef.current;

    // If summary is not yet available, not loading, and we haven't exceeded max attempts
    if (summary === 'No irrigation schedule found for this plot.' && !loading && plot.id && attempts < maxAttempts) {
      if (!timeoutId) { // Only schedule if no timeout is already pending
        console.log(`Scheduling summary re-fetch attempt ${attempts + 1}/${maxAttempts} in ${delay / 1000} seconds...`);
        summaryPollingRef.current.timeoutId = setTimeout(() => {
          summaryPollingRef.current.attempts++;
          console.log(`Attempting summary re-fetch #${summaryPollingRef.current.attempts}...`);
          fetchSchedule(0); // Trigger fetch without additional network retries for this polling attempt
          summaryPollingRef.current.timeoutId = null; // Clear timeout ID after execution
        }, delay);
      }
    } else if (summary !== 'No irrigation schedule found for this plot.' && timeoutId) {
      // If summary becomes available, clear any pending polling
      console.log('Summary found, clearing polling timeout.');
      clearTimeout(timeoutId);
      summaryPollingRef.current.timeoutId = null;
      summaryPollingRef.current.attempts = 0; // Reset attempts
    } else if (summary === 'No irrigation schedule found for this plot.' && attempts >= maxAttempts) {
      // If summary is still not available after max attempts, log and stop trying
      console.log('Max summary polling attempts reached. Summary still not available.');
    }
  }, [summary, loading, plot.id, fetchSchedule]);

  const getCropAgeDisplay = () => {
    if (!plot.planting_date || typeof plot.age_at_entry !== 'number') return '--';
    try {
      const plantingDate = parse(plot.planting_date, 'yyyy-MM-dd', new Date());
      const now = new Date();
  
      const monthsSince = Math.floor((now.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
      const totalMonths = Math.floor(plot.age_at_entry + monthsSince);
      const totalYears = Math.floor(totalMonths / 12);
      const remainingMonths = totalMonths % 12;
  
      return `${totalYears}y ${remainingMonths}m (as of ${format(plantingDate, 'MMM d, yyyy')})`;
    } catch {
      return '--';
    }
  };
  
  

  const renderCalendarGrid = () => {
    const displaySchedule = showModified ? schedule : originalSchedule;

    const getDayLabel = (dateStr: string) => {
      try {
        const parsed = parseISO(dateStr);
        return format(parsed, 'EEE');
      } catch {
        return '--';
      }
    };
    
    const getDayNum = (dateStr: string) => {
      try {
        const parsed = parseISO(dateStr);
        return parsed.getDate();
      } catch {
        return '--';
      }
    };
    

    const paddedSchedule = [...displaySchedule];
    while (paddedSchedule.length < 14) paddedSchedule.push(null);

    const week1 = paddedSchedule.slice(0, 7);
    const week2 = paddedSchedule.slice(7, 14);

    const renderRow = (week: any[]) => (
      <View style={styles.calendarRow}>
        {week.map((day, i) => (
          <TouchableOpacity
            key={i}
            style={styles.calendarCell}
            onPress={() =>
              day &&
              navigation.navigate('SpecificDay', {
                plotId: plot.id,
                dayData: day,
                dayIndex: i,
              })
            }
          >
            <Text style={styles.cellDate}>{day ? getDayNum(day.date) : ''}</Text>
            {day ? (
              <>
                <Text style={styles.cellLiters}>{day.liters}L</Text>
                <Text style={styles.cellTime}>{day.optimal_time}</Text>
              </>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>
    );

    const dayHeaders = week1.map((day, i) => (
      <Text key={i} style={styles.dayHeader}>
        {day ? getDayLabel(day.date) : ''}
      </Text>
    ));

    return (
      <View style={styles.calendarWrapper}>
        <View style={styles.calendarRow}>{dayHeaders}</View>
        {renderRow(week1)}
        {renderRow(week2)}
      </View>
    );
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.image} />

        <View style={styles.headerRow}>
          <Text style={styles.plotName}>{plot.name}</Text>
          <TouchableOpacity
            style={{ marginLeft: 12 }}
            onPress={() => navigation.navigate('PlotSettings', { plot })}
          >
            <Ionicons name="settings-outline" size={24} color="#1aa179" />
          </TouchableOpacity>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaBox}>
            <Text style={styles.metaText}>Crop</Text>
            <Text style={styles.metaValue}>{plot.crop}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaText}>ZIP</Text>
            <Text style={styles.metaValue}>{plot.zip_code || '--'}</Text>
          </View>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity onPress={() => setTab('schedule')}>
            <Text style={[styles.tabText, tab === 'schedule' && styles.activeTab]}>Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('details')}>
            <Text style={[styles.tabText, tab === 'details' && styles.activeTab]}>Details</Text>
          </TouchableOpacity>
        </View>

        {tab === 'details' && (
          <View style={styles.detailGrid}>
            <DetailRow icon={<Ionicons name="water" size={24} color="#1aa179" />} label="Moisture" value={avgMoisture} />
            <DetailRow icon={<Ionicons name="thermometer" size={24} color="#1aa179" />} label="Temperature" value={avgTemp} />
            <DetailRow icon={<Ionicons name="sunny" size={24} color="#1aa179" />} label="Sunlight" value={avgSunlight} />
            <DetailRow icon={<MaterialCommunityIcons name="test-tube" size={24} color="#1aa179" />} label="pH Level" value="6.1" />
            <DetailRow icon={<Ionicons name="calendar" size={24} color="#1aa179" />} label="Crop Age" value={getCropAgeDisplay()} />
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>What To Expect</Text>
              <Text style={styles.summaryText}>{summary || 'Loading forecast summary...'}</Text>
            </View>
          </View>
        )}

        {tab === 'schedule' && (
          <View style={styles.scheduleBox}>
            <Text style={styles.scheduleTitle}>Irrigation Schedule</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Switch
                value={showModified}
                onValueChange={setShowModified}
                thumbColor="#1aa179"
              />
              <Text style={{ marginLeft: 8, color: '#333' }}>
                {showModified ? 'Modified' : 'Original'} Schedule
              </Text>
            </View>

            <TouchableOpacity onPress={() => fetchSchedule()}>
              <Text style={{ color: '#1aa179', fontWeight: '600', marginBottom: 8 }}>↻ Refresh</Text>
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator size="small" color="#1aa179" />
            ) : (
              renderCalendarGrid()
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.farmerButton}
          onPress={() => {
            navigation.navigate('FarmerChat', { plot });
          }}
        >
          <Text style={styles.farmerText}>Farmer</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

const DetailRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailLabel}>
      {icon}
      <Text style={styles.labelText}>{label}</Text>
    </View>
    <Text style={styles.valueText}>{value}</Text>
  </View>
);

export default PlotDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  image: { height: 180, backgroundColor: '#cde', borderRadius: 20, marginBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  plotName: { fontSize: 24, fontWeight: 'bold', flex: 1 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  metaBox: { alignItems: 'center', flex: 1 },
  metaText: { fontSize: 12, color: '#777' },
  metaValue: { fontSize: 16, fontWeight: '600', color: '#222' },
  tabRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 },
  tabText: { fontSize: 16, color: '#aaa' },
  activeTab: { color: '#1aa179', fontWeight: '600' },
  detailGrid: { paddingVertical: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8, alignItems: 'center' },
  detailLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  labelText: { fontSize: 16, marginLeft: 8, color: '#333' },
  valueText: { fontSize: 16, fontWeight: '600', color: '#444' },
  scheduleBox: { backgroundColor: '#f4faf7', padding: 16, borderRadius: 12, marginBottom: 20 },
  scheduleTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4, color: '#1aa179' },
  calendarWrapper: { gap: 4 },
  calendarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  calendarCell: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#777',
  },
  cellDate: {
    fontSize: 10,
    position: 'absolute',
    top: 4,
    left: 4,
    color: '#333',
  },
  cellLiters: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1aa179',
    textAlign: 'center',
    marginTop: 16,
  },
  cellTime: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginTop: 2,
  },
  summaryBox: { backgroundColor: '#f3f9f6', padding: 16, borderRadius: 12, marginBottom: 20 },
  summaryTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: '#1aa179' },
  summaryText: { fontSize: 14, color: '#555' },
  farmerButton: { backgroundColor: '#1aa179', paddingVertical: 14, alignItems: 'center', borderRadius: 30, marginBottom: 12 },
  farmerText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
