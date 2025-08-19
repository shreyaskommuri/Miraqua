import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PickLocationScreen = ({ navigation, route }: any) => {
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');

  const handleLocationPicked = () => {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lonNum)) {
      Alert.alert('Invalid Coordinates', 'Please enter valid latitude and longitude values.');
      return;
    }

    if (latNum < -90 || latNum > 90) {
      Alert.alert('Invalid Latitude', 'Latitude must be between -90 and 90.');
      return;
    }

    if (lonNum < -180 || lonNum > 180) {
      Alert.alert('Invalid Longitude', 'Longitude must be between -180 and 180.');
      return;
    }

    // Call the callback with the coordinates
    if (route.params?.onLocationPicked) {
      route.params.onLocationPicked(latNum, lonNum);
    }
    
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Pick Location</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Enter the coordinates for your plot location. You can find these using Google Maps or any GPS app.
        </Text>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Latitude</Text>
          <TextInput
            style={styles.textInput}
            value={lat}
            onChangeText={setLat}
            placeholder="e.g., 37.7749"
            keyboardType="numeric"
          />
          <Text style={styles.hint}>Range: -90 to 90</Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Longitude</Text>
          <TextInput
            style={styles.textInput}
            value={lon}
            onChangeText={setLon}
            placeholder="e.g., -122.4194"
            keyboardType="numeric"
          />
          <Text style={styles.hint}>Range: -180 to 180</Text>
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={handleLocationPicked}>
          <Ionicons name="checkmark" size={20} color="white" />
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>

        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>💡 How to find coordinates:</Text>
          <Text style={styles.helpText}>• Right-click on Google Maps</Text>
          <Text style={styles.helpText}>• Use GPS apps on your phone</Text>
          <Text style={styles.helpText}>• Ask a local farmer or gardener</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 32,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginLeft: 4,
  },
  confirmButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpSection: {
    marginTop: 32,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
});

export default PickLocationScreen; 