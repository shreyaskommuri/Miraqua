import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList } from '../navigation/types';
import { supabase } from '../utils/supabase';
import { addPlot } from '../api/api';

type AddPlotRouteProp = RouteProp<MainTabParamList, 'Add Plot'>;

const AddPlotScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<AddPlotRouteProp>();

  const [name, setName] = useState('');
  const [crop, setCrop] = useState('');
  const [area, setArea] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [zip, setZip] = useState('');
  const [flexType, setFlexType] = useState<'daily' | 'monthly'>('daily');

  useEffect(() => {
    if (route.params?.lat && route.params?.lon) {
      setLat(route.params.lat);
      setLon(route.params.lon);
    }
  }, [route.params]);

  useEffect(() => {
    const fetchZip = async () => {
      if (lat !== null && lon !== null) {
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
          );
          const data = await res.json();
          const postalCode = data?.postcode || '';
          setZip(postalCode);
        } catch (error) {
          console.error('Failed to fetch ZIP code:', error);
        }
      }
    };
    fetchZip();
  }, [lat, lon]);

  const handleAddPlot = async () => {
    const { data: userData, error } = await supabase.auth.getUser();
    if (error || !userData?.user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    if (lat === null || lon === null) {
      Alert.alert('Missing Location', 'Please select a location on the map.');
      return;
    }

    const plotData = {
      user_id: userData.user.id,
      crop,
      area: parseFloat(area),
      name,
      lat,
      lon,
      flex_type: flexType,
      zip_code: zip,
    };

    const response = await addPlot(plotData);
    if (response && !response.error) {
      Alert.alert('Success', 'Plot added successfully!');
      navigation.navigate('Home');
    } else {
      Alert.alert('Error', 'Failed to add plot.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Plot Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g., Front Field" />

      <Text style={styles.label}>Crop Type</Text>
      <TextInput style={styles.input} value={crop} onChangeText={setCrop} placeholder="e.g., Tomato" />

      <Text style={styles.label}>Area (sq m)</Text>
      <TextInput style={styles.input} value={area} onChangeText={setArea} placeholder="e.g., 1000" keyboardType="numeric" />

      <Text style={styles.label}>Flex Type</Text>
      <View style={styles.flexTypeContainer}>
        <Button
          title={flexType === 'daily' ? '🌿 Daily (moisture)' : '📅 Monthly (ET-based)'}
          onPress={() => setFlexType(flexType === 'daily' ? 'monthly' : 'daily')}
        />
      </View>

      <Text style={styles.label}>Location</Text>
      <Button
        title={lat && lon ? `📍 Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}` : 'Pick Location on Map'}
        onPress={() => navigation.navigate('PickLocation')}
      />

      {zip ? (
        <Text style={styles.label}>📫 Auto ZIP: {zip}</Text>
      ) : (
        <Text style={styles.label}>📫 Detecting ZIP...</Text>
      )}

      <View style={{ marginTop: 30 }}>
        <Button title="Add Plot" onPress={handleAddPlot} />
      </View>
    </ScrollView>
  );
};

export default AddPlotScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  flexTypeContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
});
