// screens/AddPlotScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { supabase } from '../utils/supabase';
import { addPlot } from '../api/api';

const AddPlotScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [zipCode, setZipCode] = useState('');
  const [crop, setCrop] = useState('');
  const [area, setArea] = useState('');
  const [name, setName] = useState('');

  const handleAddPlot = async () => {
    const { data: userData, error } = await supabase.auth.getUser();
    if (error || !userData?.user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    const plotData = {
      user_id: userData.user.id,
      zip_code: zipCode,
      crop,
      area: parseFloat(area),
      name,
    };

    const response = await addPlot(plotData);
    if (response.success) {
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

      <Text style={styles.label}>ZIP Code</Text>
      <TextInput style={styles.input} value={zipCode} onChangeText={setZipCode} placeholder="e.g., 94582" keyboardType="numeric" />

      <Text style={styles.label}>Area (sq ft)</Text>
      <TextInput style={styles.input} value={area} onChangeText={setArea} placeholder="e.g., 1000" keyboardType="numeric" />

      <Button title="Add Plot" onPress={handleAddPlot} />
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
});
