// MiraquaApp/screens/HomeScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getPlots } from '../api/api';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

export interface Plot {
  id: number;
  zip: string;
  crop: string;
  area: string;
  soil_moisture?: number;
  temp?: number;
  last_run?: string;
  next_run?: string;
  summary?: string;
  liters?: number;
  avgLiters?: number;
  schedule?: any[];
}

const HomeScreen = () => {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const fetchPlots = async () => {
    try {
      const data = await getPlots();
      setPlots(data);
    } catch (error) {
      console.error('Error loading plots:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchPlots();
    }
  }, [isFocused]);

  const renderItem = ({ item }: { item: Plot }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PlotDetails', { plot: item })}
    >
      <Text style={styles.crop}>{item.crop}</Text>
      <Text>
        Soil Moisture:{' '}
        {item.soil_moisture !== undefined
          ? `${(item.soil_moisture * 100).toFixed(1)}%`
          : 'N/A'}
      </Text>
      <Text>Last run: {item.last_run || '—'}</Text>
      <Text>Next run: {item.next_run || '—'}</Text>
      <Text style={styles.adjust}>🛠️ ADJUST</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Plots</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={plots}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.content}
        />
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    backgroundColor: '#F2F3F4',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    width: '48%',
    marginBottom: 15,
  },
  crop: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  adjust: {
    color: '#007AFF',
    marginTop: 5,
  },
});
