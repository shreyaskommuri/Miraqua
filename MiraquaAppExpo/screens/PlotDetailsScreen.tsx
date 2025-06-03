// screens/PlotDetailsScreen.tsx
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
// import { getPlan } from '../api/api.ts';

// const BASE_URL = __DEV__
//   ? `http://${EXPO_PUBLIC_MYIPADRESS}:5050`
//   : 'https://miraqua.onrender.com';
const BASE_URL = `http://${EXPO_PUBLIC_MYIPADRESS}:5050`;

console.log('🔍 Fetching from:', `${BASE_URL}/get_plan`);


//https://miraqua.onrender.com or http://${MYIPADRESS}:5050 depending on what environment you are in
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
          zip_code: plot.zip_code,
          crop: plot.crop.toLowerCase(),
          area: plot.area || 100,
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
    const today = new Date();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const cells = Array.from({ length: 14 }).map((_, i) => {
      const day = schedule[i];
      const cellDate = new Date();
      cellDate.setDate(today.getDate() + i);
      const dayNum = cellDate.getDate();
      return (
        <View key={i} style={styles.calendarCell}>
          <Text style={{ fontSize: 10, alignSelf: 'flex-start', paddingLeft: 4 }}>{dayNum}</Text>
          <Text> {day?.liters != null ? `${day.liters}L` : ''}</Text>
        </View>
      );
    });

    return (
      <View style={styles.calendarWrapper}>
        <View style={styles.calendarRow}>
          {daysOfWeek.map((day, idx) => (
            <Text key={idx} style={styles.dayHeader}>{day}</Text>
          ))}
        </View>
        <View style={styles.calendarRow}>{cells.slice(0, 7)}</View>
        <View style={styles.calendarRow}>{cells.slice(7)}</View>
      </View>
    );
  };

  // ✅ Fix: Add loading screen to prevent flicker
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
          <Text style={styles.metaText}>ZIP</Text>
          <Text style={styles.metaValue}>{plot.zip_code}</Text>
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
  dayHeader: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#777' },
  calendarCell: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
  },
  cellText: { fontSize: 13, color: '#1aa179', textAlign: 'center' },
  summaryBox: { backgroundColor: '#f3f9f6', padding: 16, borderRadius: 12, marginBottom: 20 },
  summaryTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: '#1aa179' },
  summaryText: { fontSize: 14, color: '#555' },
  farmerButton: { backgroundColor: '#1aa179', paddingVertical: 14, alignItems: 'center', borderRadius: 30, marginBottom: 40 },
  farmerText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  plantBox: { alignItems: 'center', paddingVertical: 24 },
  plantNote: { fontSize: 14, color: '#888' },
});
