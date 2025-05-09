import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MaterialIcons } from '@expo/vector-icons';

type PlotDetailsRouteProp = RouteProp<RootStackParamList, 'PlotDetails'>;

const PlotDetailsScreen = () => {
  const { params } = useRoute<PlotDetailsRouteProp>();
  const plot = params.plot;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>{plot.name}</Text>
        <Detail icon="eco" label="Crop" value={plot.crop} color="#4CAF50" />
        <Detail icon="place" label="Location" value={plot.location} color="#2196F3" />
        <Detail icon="square-foot" label="Size" value={plot.size} color="#FF9800" />
        <Detail icon="opacity" label="Soil Moisture" value="23% (from API)" color="#009688" />
        <Detail icon="water" label="Irrigation" value="Scheduled" color="#03A9F4" />
      </View>
    </ScrollView>
  );
};

const Detail = ({ icon, label, value, color }: { icon: any; label: string; value: string; color: string }) => (
  <View style={styles.detailRow}>
    <MaterialIcons name={icon} size={20} color={color} />
    <Text style={styles.label}> {label}:</Text>
    <Text style={styles.value}> {value}</Text>
  </View>
);

export default PlotDetailsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f4f4f4',
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 18,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  value: {
    fontSize: 16,
    color: '#555',
  },
});
