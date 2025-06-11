// screens/PickLocationScreen.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { OPENCAGE_API_KEY } from '@env';

const PickLocationScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);

  const searchAddress = async () => {
    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        query
      )}&key=${OPENCAGE_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;
        setRegion({ ...region, latitude: lat, longitude: lng });
        setMarker({ latitude: lat, longitude: lng });
      } else {
        Alert.alert('Address not found');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error fetching address');
    }
  };

  const handleMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
  };

  const confirmLocation = () => {
    if (!marker) {
      Alert.alert('Please select a location');
      return;
    }

    // ✅ Pass selected lat/lon to AddPlotScreen
    navigation.setParams({
      lat: marker.latitude,
      lon: marker.longitude,
    });

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1 }}>
        <TextInput
          style={styles.input}
          placeholder="Search address"
          value={query}
          onChangeText={setQuery}
        />
        <Button title="Search" onPress={searchAddress} />

        <MapView style={styles.map} region={region} onPress={handleMapPress}>
          {marker && <Marker coordinate={marker} />}
        </MapView>

        <Button title="Confirm Location" onPress={confirmLocation} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  input: {
    padding: 10,
    borderBottomWidth: 1,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  map: {
    flex: 1,
  },
});

export default PickLocationScreen;
