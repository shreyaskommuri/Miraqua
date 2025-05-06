import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { getIrrigationPlan } from '../api/api';
import { useNavigation } from '@react-navigation/native';

const AddPlotScreen = () => {
  const [zip, setZip] = useState('');
  const [crop, setCrop] = useState('');
  const [area, setArea] = useState('');
  const navigation = useNavigation<any>();

  const handleSubmit = async () => {
    try {
      const data = await getIrrigationPlan(zip, crop, area);
      await fetch('http://10.35.67.235:5050/add_plot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop,
          zip,
          area,
          summary: data.summary,
          schedule: data.schedule
        })
      });

      Alert.alert("Success", data.summary, [
        {
          text: "OK",
          onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }]
          })
        }
      ]);
    } catch (error) {
      Alert.alert("Failed to add plot. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Plot</Text>
      <Text>ZIP Code</Text>
      <TextInput style={styles.input} value={zip} onChangeText={setZip} keyboardType="numeric" />
      <Text>Crop</Text>
      <TextInput style={styles.input} value={crop} onChangeText={setCrop} autoCapitalize="none" />
      <Text>Area (m²)</Text>
      <TextInput style={styles.input} value={area} onChangeText={setArea} keyboardType="numeric" />
      <Button title="Add Plot" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 8
  }
});

export default AddPlotScreen;
