import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { HomeStackParamList } from '../navigation/HomeStackNavigator';

type PlotDetailsRouteProp = RouteProp<HomeStackParamList, 'PlotDetails'>;

const PlotDetailsScreen = () => {
  const route = useRoute<PlotDetailsRouteProp>();
  const { plot } = route.params;

  const moistureDisplay = plot.soil_moisture !== undefined ? `${(plot.soil_moisture * 100).toFixed(1)}%` : 'N/A';
  const tempDisplay = plot.temp !== undefined ? `${plot.temp.toFixed(1)}°C` : 'N/A';

  return (
    <View style={styles.container}>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageText}>📸 Photo/Upload Area</Text>
      </View>
      <Text style={styles.crop}>{plot.crop}</Text>
      <Text style={styles.line}>🌿 Soil Moisture: {moistureDisplay}</Text>
      <Text style={styles.line}>🌡️ Temperature: {tempDisplay}</Text>
      <Text style={styles.line}>🗓️ Last Watered: {plot.last_run || 'N/A'}</Text>
      <Text style={styles.line}>🗓️ Next Watering: {plot.next_run || 'N/A'}</Text>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>💡 Optimized Summary:</Text>
        <Text>🌾 {plot.summary || 'No summary available.'}</Text>
      </View>
    </View>
  );
};

export default PlotDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FA', padding: 20 },
  imagePlaceholder: {
    height: 100,
    backgroundColor: '#E6ECF0',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  imageText: { color: '#555', fontSize: 16 },
  crop: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  line: { fontSize: 16, marginBottom: 5 },
  summaryBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  summaryTitle: { fontWeight: 'bold', marginBottom: 5 },
});
