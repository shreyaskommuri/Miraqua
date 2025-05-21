import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MYIPADRESS } from '@env';

const PlotDetailsScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'PlotDetails'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { plot } = route.params;

  const [tab, setTab] = useState<'plants' | 'details'>('details');
  const [schedule, setSchedule] = useState<any[]>([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const [avgMoisture, setAvgMoisture] = useState('');
  const [avgTemp, setAvgTemp] = useState('');
  const [avgSunlight, setAvgSunlight] = useState('');

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://${MYIPADRESS}:5050/get_plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            zip: plot.zip_code,
            crop: plot.crop.toLowerCase(),
            area: plot.area || 100,
          }),
        });
        const json = await response.json();
        setSchedule(json.schedule || []);
        setSummary(json.summary || '');

        if (json.schedule && json.schedule.length > 0) {
          const moistures = json.schedule.map((d: any) => d.soil_moisture);
          const temps = json.schedule.map((d: any) => d.temp);
          const sunlights = json.schedule.map((d: any) => 57); // placeholder until backend sends actual sunlight

          const avg = (arr: number[]) =>
            arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : '--';

          const avgMoistureNum = moistures.length
            ? moistures.reduce((a, b) => a + b, 0) / moistures.length
            : null;

          setAvgMoisture(avgMoistureNum !== null ? `${(avgMoistureNum ).toFixed(3)}%` : '--');
          setAvgTemp(`${avg(temps)}°F`);
          setAvgSunlight(`${avg(sunlights)}%`);
        }
      } catch (err) {
        console.error('Error fetching plan:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [plot]);

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
        <TouchableOpacity onPress={() => setTab('plants')}>
          <Text style={[styles.tabText, tab === 'plants' && styles.activeTab]}>Plants</Text>
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
        </View>
      )}

      {tab === 'plants' && (
        <View style={styles.plantBox}>
          <Text style={styles.plantNote}>🌱 Plants section coming soon.</Text>
        </View>
      )}

      <View style={styles.scheduleBox}>
        <Text style={styles.scheduleTitle}>💧 Irrigation Schedule</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#1aa179" />
        ) : schedule.length > 0 ? (
          schedule.map((item, index) => (
            <View key={index} style={styles.scheduleRow}>
              <Text style={styles.scheduleDay}>{item.day}</Text>
              <Text style={styles.scheduleLiters}>{item.liters} liters</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noSchedule}>No schedule available</Text>
        )}
      </View>

      {summary && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>What To Expect</Text>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.farmerButton} onPress={() => navigation.navigate('FarmerChat', { plot })}>
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
  scheduleTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#1aa179' },
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  scheduleDay: { fontSize: 15, color: '#333' },
  scheduleLiters: { fontSize: 15, fontWeight: '600', color: '#444' },
  noSchedule: { fontSize: 14, color: '#999' },
  summaryBox: { backgroundColor: '#f3f9f6', padding: 16, borderRadius: 12, marginBottom: 20 },
  summaryTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: '#1aa179' },
  summaryText: { fontSize: 14, color: '#555' },
  farmerButton: { backgroundColor: '#1aa179', paddingVertical: 14, alignItems: 'center', borderRadius: 30, marginBottom: 40 },
  farmerText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  plantBox: { alignItems: 'center', paddingVertical: 24 },
  plantNote: { fontSize: 14, color: '#888' },
});
