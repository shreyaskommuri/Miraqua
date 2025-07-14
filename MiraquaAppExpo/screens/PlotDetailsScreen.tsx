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
import { parse, format } from 'date-fns';
import { fetchPlotById } from '../api/api';

const BASE_URL = `http://${EXPO_PUBLIC_MYIPADRESS}:5050`;

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'PlotDetails'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const PlotDetailsScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'PlotDetails'>>();
  const navigation = useNavigation<NavigationProp>();
  const { plot } = route.params;

  const [plotData, setPlotData] = useState(plot);
  const [tab, setTab] = useState<'schedule' | 'details'>('schedule');
  const [schedule, setSchedule] = useState<any[]>([]);
  const [originalSchedule, setOriginalSchedule] = useState<any[]>([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [avgMoisture, setAvgMoisture] = useState('--');
  const [avgTemp, setAvgTemp] = useState('--');
  const [avgSunlight, setAvgSunlight] = useState('--');
  const [showModified, setShowModified] = useState(true);

  const fetchSchedule = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      const modRes = await fetch(`${BASE_URL}/get_plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plot_id: plotData.id,
          use_original: false,
          force_refresh: forceRefresh,
        }),
      });
      const modJson = await modRes.json();
      setSchedule(modJson.schedule || []);
  
      const ogRes = await fetch(`${BASE_URL}/get_plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plot_id: plotData.id,
          use_original: true,
          force_refresh: forceRefresh,
        }),
      });
      const ogJson = await ogRes.json();
      setOriginalSchedule(ogJson.schedule || []);
  
      setSummary(modJson.gem_summary || modJson.summary || 'No irrigation schedule found.');
      setAvgMoisture(typeof modJson.moisture === 'number' ? `${modJson.moisture.toFixed(2)}%` : '--');
      setAvgTemp(typeof modJson.current_temp_f === 'number' ? `${modJson.current_temp_f.toFixed(1)}°F` : '--');
      setAvgSunlight(typeof modJson.sunlight === 'number' ? `${modJson.sunlight.toFixed(0)}%` : '--');
    } catch {
      setSummary('Failed to load schedule.');
    } finally {
      setLoading(false);
    }
  }, [plotData.id]);
  


  useFocusEffect(
    useCallback(() => {
      const refreshPlot = async () => {
        const latest = await fetchPlotById(plot.id);
        if (latest) setPlotData(latest);
      };
      refreshPlot();
      fetchSchedule();
    }, [plot.id, fetchSchedule])
  );

  const getCropAgeDisplay = () => {
    if (!plotData.planting_date || typeof plotData.age_at_entry !== 'number') return '--';
    try {
      const plantingDate = parse(plotData.planting_date, 'yyyy-MM-dd', new Date());
      const now = new Date();
      const monthsSince = Math.floor((now.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
      const totalMonths = Math.floor(plotData.age_at_entry + monthsSince);
      const totalYears = Math.floor(totalMonths / 12);
      const remainingMonths = totalMonths % 12;
      return `${totalYears}y ${remainingMonths}m (as of ${format(plantingDate, 'MMM d, yyyy')})`;
    } catch {
      return '--';
    }
  };

  const getDayLabel = (dateStr: string) => {
    try {
      // Try parsing MM/DD/YY first
      let parsed;
      if (dateStr.includes('/')) {
        parsed = parse(dateStr, 'MM/dd/yy', new Date());
      } else {
        parsed = new Date(dateStr); // ISO fallback
      }
      return format(parsed, 'EEE');
    } catch {
      return '--';
    }
  };
  

  const renderCalendarGrid = () => {
    const displaySchedule = showModified ? schedule : originalSchedule;
    const padded = [...displaySchedule];
    while (padded.length < 14) padded.push(null);
    const week1 = padded.slice(0, 7);
    const week2 = padded.slice(7, 14);

    const renderRow = (week: any[]) => (
      <View style={styles.calendarRow}>
        {week.map((day, i) => (
          <TouchableOpacity
            key={i}
            style={styles.calendarCell}
            onPress={() => day && navigation.navigate('SpecificDay', {
              plotId: plotData.id,
              dayData: day,
              dayIndex: i,
            })}
          >
            {day && (
              <>
                <Text style={styles.cellLiters}>{day.liters}L</Text>
                <Text style={styles.cellTime}>{day.optimal_time}</Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );

    const renderHeaders = (week: any[]) => (
      <View style={styles.calendarRow}>
        {week.map((day, i) => (
          <View key={i} style={[styles.calendarCell, { backgroundColor: 'transparent', borderBottomWidth: 0 }]}>
            <Text style={styles.dayLabel}>{day ? getDayLabel(day.date) : ''}</Text>
          </View>
        ))}
      </View>
    );

    return (
      <View style={styles.calendarWrapper}>
        {renderHeaders(week1)}
        {renderRow(week1)}
        {renderRow(week2)}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.image} />
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.plotName}>{plotData.name}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PlotSettings', { plot: plotData })}>
            <Ionicons name="settings-outline" size={22} color="#1aa179" />
          </TouchableOpacity>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaBox}>
            <Text style={styles.metaText}>Crop</Text>
            <Text style={styles.metaValue}>{plotData.crop}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaText}>ZIP</Text>
            <Text style={styles.metaValue}>{plotData.zip_code || '--'}</Text>
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
          <View>
            <DetailRow icon={<Ionicons name="water" size={20} color="#1aa179" />} label="Moisture" value={avgMoisture} />
            <DetailRow icon={<Ionicons name="thermometer" size={20} color="#1aa179" />} label="Temperature" value={avgTemp} />
            <DetailRow icon={<Ionicons name="sunny" size={20} color="#1aa179" />} label="Sunlight" value={avgSunlight} />
            <DetailRow icon={<MaterialCommunityIcons name="test-tube" size={20} color="#1aa179" />} label="pH Level" value="6.1" />
            <DetailRow icon={<Ionicons name="calendar" size={20} color="#1aa179" />} label="Crop Age" value={getCropAgeDisplay()} />
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>What To Expect</Text>
              <Text style={styles.summaryText}>{summary}</Text>
            </View>
          </View>
        )}

        {tab === 'schedule' && (
          <View style={styles.scheduleBox}>
            <Text style={styles.scheduleTitle}>Irrigation Schedule</Text>
            <View style={styles.toggleRow}>
            <Switch
            value={showModified}
            onValueChange={(val) => {
              setShowModified(val);
              fetchSchedule(false); // no need to force refresh — both versions are already stored
            }}
            
            trackColor={{ true: '#1aa179', false: '#ccc' }}
          />


              <Text style={styles.switchLabel}>Modified Schedule</Text>
            </View>

            <TouchableOpacity onPress={() => fetchSchedule(false)}>
              <Text style={styles.refreshText}>↻ Refresh</Text>
            </TouchableOpacity>



            {loading ? <ActivityIndicator color="#1aa179" /> : renderCalendarGrid()}
          </View>
        )}

        <TouchableOpacity
          style={styles.farmerButton}
          onPress={() => navigation.navigate('FarmerChat', { plot: plotData })}
        >
          <Text style={styles.farmerText}>Farmer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const DetailRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailLabel}>{icon}<Text style={styles.labelText}>{label}</Text></View>
    <Text style={styles.valueText}>{value}</Text>
  </View>
);

export default PlotDetailsScreen;

// 🔧 styles (unchanged) remain here…


const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0d3b23' },
  image: { height: 160, backgroundColor: '#cddacc', borderRadius: 20, marginBottom: 16 },
  card: { backgroundColor: '#f5f1e7', borderRadius: 20, padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  plotName: { fontSize: 24, fontWeight: 'bold', color: '#0d3b23' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 },
  metaBox: { alignItems: 'center', flex: 1 },
  metaText: { fontSize: 12, color: '#777' },
  metaValue: { fontSize: 16, fontWeight: '600', color: '#222' },
  tabRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  tabText: { fontSize: 16, marginHorizontal: 12, color: '#888' },
  activeTab: { color: '#1aa179', fontWeight: 'bold' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6, alignItems: 'center' },
  detailLabel: { flexDirection: 'row', alignItems: 'center' },
  labelText: { fontSize: 16, marginLeft: 8, color: '#0d3b23' },
  valueText: { fontSize: 16, fontWeight: '600', color: '#000' },
  summaryBox: { backgroundColor: '#e4eee7', padding: 14, borderRadius: 12, marginTop: 12 },
  summaryTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 6, color: '#0d3b23' },
  summaryText: { fontSize: 14, color: '#333' },
  scheduleBox: { marginTop: 8 },
  scheduleTitle: { fontSize: 18, fontWeight: '600', color: '#1aa179', marginBottom: 6 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  switchLabel: { marginLeft: 8, fontSize: 14, color: '#1aa179' },
  refreshText: { color: '#1aa179', fontWeight: '600', marginBottom: 8 },
  calendarWrapper: { borderWidth: 1, borderColor: '#ccc', borderRadius: 12, overflow: 'hidden' },
  calendarRow: { flexDirection: 'row' },
  calendarCell: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayLabel: { fontSize: 12, fontWeight: 'bold', color: '#888' },
  cellLiters: { fontSize: 14, fontWeight: '600', color: '#1aa179' },
  cellTime: { fontSize: 12, color: '#333' },
  farmerButton: {
    backgroundColor: '#1aa179',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 30,
    marginTop: 24,
  },
  farmerText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
