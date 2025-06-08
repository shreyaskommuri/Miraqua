import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  useRoute,
  useNavigation,
  RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { EXPO_PUBLIC_MYIPADRESS } from '@env';
import { parse, format } from 'date-fns';

const BASE_URL = `http://${EXPO_PUBLIC_MYIPADRESS}:5050`;

const PlotDetailsScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'PlotDetails'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { plot } = route.params;

  const [tab, setTab] = useState<'schedule' | 'details'>('details');
  const [schedule, setSchedule] = useState<any[]>([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const [avgMoisture, setAvgMoisture] = useState('--');
  const [avgTemp, setAvgTemp] = useState('--');
  const [avgSunlight, setAvgSunlight] = useState('--');

  const fetchSchedule = async () => {
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
        }),
      });

      const json = await response.json();

      setSchedule(json.schedule || []);
      setSummary(json.gem_summary || json.summary || 'No forecast available.');

      setAvgMoisture(
        typeof json.moisture === 'number' ? `${json.moisture.toFixed(2)}%` : '--'
      );

      setAvgTemp(
        typeof json.current_temp_f === 'number' ? `${json.current_temp_f.toFixed(1)}°F` : '--'
      );

      setAvgSunlight(
        typeof json.sunlight === 'number' ? `${json.sunlight.toFixed(0)}%` : '--'
      );

    } catch (err) {
      console.error('Error fetching schedule:', err);
      setSummary('Failed to load schedule.');
      setAvgMoisture('--');
      setAvgTemp('--');
      setAvgSunlight('--');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [plot.id]);

  useFocusEffect(
    useCallback(() => {
      fetchSchedule();
    }, [plot.id])
  );

  const renderCalendarGrid = () => {
    const getDayLabel = (dateStr: string) => {
      try {
        const parsed = parse(dateStr, 'MM/dd/yy', new Date());
        return format(parsed, 'EEE');
      } catch {
        return '--';
      }
    };

    const getDayNum = (dateStr: string) => {
      try {
        const parsed = parse(dateStr, 'MM/dd/yy', new Date());
        return parsed.getDate();
      } catch {
        return '--';
      }
    };

    const paddedSchedule = [...schedule];
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

  if (loading && schedule.length === 0 && summary === '') {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1aa179" />
        <Text style={{ marginTop: 8, color: '#1aa179' }}>Loading plot data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.image} />

      <View style={styles.headerRow}>
        <Text style={styles.plotName}>{plot.name}</Text>
        <View style={styles.metaBox}>
          <Text style={styles.metaText}>Crop</Text>
          <Text style={styles.metaValue}>{plot.crop}</Text>
        </View>
        <View style={styles.metaBox}>
          <Text style={styles.metaText}>Coords</Text>
          <Text style={styles.metaValue}>
            {plot.lat?.toFixed(2)}, {plot.lon?.toFixed(2)}
          </Text>
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

          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>What To Expect</Text>
            <Text style={styles.summaryText}>{summary || 'Loading forecast summary...'}</Text>
          </View>
        </View>
      )}

      {tab === 'schedule' && (
        <View style={styles.scheduleBox}>
          <Text style={styles.scheduleTitle}>Irrigation Schedule</Text>
          <TouchableOpacity onPress={fetchSchedule}>
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
          console.log("🧭 Navigating to FarmerChat with plot:", plot);
          navigation.navigate('FarmerChat', { plot });
        }}
      >
        <Text style={styles.farmerText}>Farmer</Text>
      </TouchableOpacity>
    </ScrollView>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  plotName: { fontSize: 24, fontWeight: 'bold', flex: 1 },
  metaBox: { alignItems: 'center', marginLeft: 16 },
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
  farmerButton: { backgroundColor: '#1aa179', paddingVertical: 14, alignItems: 'center', borderRadius: 30, marginBottom: 40 },
  farmerText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
