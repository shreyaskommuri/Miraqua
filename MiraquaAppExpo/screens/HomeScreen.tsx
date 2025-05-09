import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type Plot = {
  id: string;
  name: string;
  crop: string;
  location: string;
  size: string;
};

const HomeScreen = () => {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const fetchPlots = async () => {
    try {
      const response = await fetch('http://10.35.67.235:5050/get_plots');
      const data = await response.json();
      setPlots(data.plots);
    } catch (error) {
      console.error('Failed to fetch plots:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPlots();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPlots();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Plot }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PlotDetails', { plot: item })}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.meta}>Crop: {item.crop}</Text>
      <Text style={styles.meta}>Location: {item.location}</Text>
      <Text style={styles.meta}>Size: {item.size} m²</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Plots</Text>
      <FlatList
        data={plots}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fefefe' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12, color: '#2e7d32' },
  card: {
    backgroundColor: '#f4f4f4',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#81c784',
  },
  name: { fontSize: 18, fontWeight: '600' },
  meta: { fontSize: 14, color: '#555' },
});
