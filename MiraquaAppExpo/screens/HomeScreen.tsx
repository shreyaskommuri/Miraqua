// screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getPlots } from '../api/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [plots, setPlots] = useState<any[]>([]);

  const fetchPlots = async () => {
    const response = await getPlots();
    if (response.success) {
      setPlots(response.plots);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchPlots();
    }, [])
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Home</Text>
        <Ionicons name="person-circle-outline" size={28} color="#1aa179" />
      </View>

      <View style={styles.mapCard}>
        <Ionicons name="location" size={22} color="#1aa179" />
        <Text style={styles.mapText}>Smart Irrigation Dashboard</Text>
      </View>

      {plots.map((plot, index) => (
        <TouchableOpacity
          key={index}
          style={styles.plotCard}
          onPress={() => navigation.navigate('PlotDetails', { plot })}
        >
          <View style={styles.plotTop}>
            <Text style={styles.plotName}>{plot.name?.trim() || 'Unnamed Plot'}</Text>
            <Text style={styles.plotZip}>{plot.zip_code}</Text>
          </View>
          <View style={styles.progressRow}>
            <View style={styles.statusBox}>
              <Text style={styles.statusLabel}>Watering</Text>
              <Text style={styles.statusValue}>45%</Text>
            </View>
            <View style={styles.statusBox}>
              <Text style={styles.statusLabel}>Sunlight</Text>
              <Text style={styles.statusValue}>60%</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {plots.length === 0 && (
        <Text style={{ textAlign: 'center', marginTop: 40, color: '#999' }}>
          No plots found. Add one using the tab below.
        </Text>
      )}
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fefefe', flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: { fontSize: 26, fontWeight: '700', color: '#1aa179' },
  mapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e4f4ee',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  mapText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  plotCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  plotTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  plotName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2a2a2a',
    maxWidth: '70%',
  },
  plotZip: {
    fontSize: 14,
    color: '#999',
    maxWidth: '30%',
    textAlign: 'right',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusBox: {
    backgroundColor: '#f2f7f5',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '48%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#777',
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1aa179',
  },
});
