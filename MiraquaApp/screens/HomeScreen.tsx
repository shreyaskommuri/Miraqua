import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { getPlots } from '../api/api';

interface Plot {
  id: string;
  crop: string;
  area: number;
  zip: string;
  summary: string;
  schedule: { day: string; date: string; soil_moisture: number }[];
}

const HomeScreen = () => {
  const [plots, setPlots] = useState<Plot[]>([]);

  const fetchPlots = async () => {
    try {
      const data = await getPlots();
      setPlots(data);
    } catch (error) {
      console.error('Error loading plots:', error);
      Alert.alert('Error', 'Failed to fetch plots');
    }
  };

  useEffect(() => {
    fetchPlots();
  }, []);

  const renderItem = ({ item }: { item: Plot }) => {
    const today = item.schedule?.[0];
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.crop}</Text>
        <Text>Soil Moisture: {today?.soil_moisture ?? '--'}%</Text>
        <Text>Last run: {today?.date ?? '--'}</Text>
        <Text>Next run: {item.schedule?.[1]?.date ?? '--'}</Text>
        <TouchableOpacity>
          <Text style={styles.adjustText}>🔧 ADJUST</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Plots</Text>
      <FlatList
        data={plots}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f6f9', padding: 10 },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  row: { justifyContent: 'space-between' },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    flex: 0.48,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  adjustText: { color: '#007AFF', fontWeight: '600', marginTop: 8 },
});

export default HomeScreen;
