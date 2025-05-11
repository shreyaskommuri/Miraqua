// screens/AddPlotScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { addPlot } from '../api/api';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../navigation/types';

const AddPlotScreen = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const [name, setName] = useState('');
  const [crop, setCrop] = useState('');
  const [zipCode, setZipCode] = useState('');

  const handleSubmit = async () => {
    const plot = { name, crop, zip_code: zipCode };
    const response = await addPlot(plot);
    if (response.success) {
      navigation.navigate('Home');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a New Plot</Text>
      <View style={styles.formCard}>
        <TextInput style={styles.input} placeholder="Plot Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Crop Type" value={crop} onChangeText={setCrop} />
        <TextInput style={styles.input} placeholder="ZIP Code" value={zipCode} onChangeText={setZipCode} keyboardType="numeric" />
        <Button title="Add Plot" onPress={handleSubmit} color="#1aa179" />
      </View>
    </View>
  );
};

export default AddPlotScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f0faf5' },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 16, color: '#1aa179' },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
});
