import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
} from 'react-native';
import { getIrrigationPlan, savePlot } from '../api/api';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const AddPlotScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [zip, setZip] = useState('');
  const [crop, setCrop] = useState('');
  const [area, setArea] = useState('');

  const handleSubmit = async () => {
    try {
      const data = await getIrrigationPlan(zip, crop, area);

      const plot = {
        id: Date.now(),
        zip,
        crop,
        area,
        soil_moisture: data.schedule[0]?.soil_moisture ?? null,
        temp: data.schedule[0]?.temp ?? null,
        last_run: data.schedule[0]?.date ?? '',
        next_run: data.schedule[1]?.date ?? '',
        summary: data.summary,
        liters: data.schedule.reduce((sum: number, d: any) => sum + d.liters, 0),
        avgLiters: Math.round(
          data.schedule.reduce((sum: number, d: any) => sum + d.liters, 0) / 5
        ),
        schedule: data.schedule,
      };

      await savePlot(plot); // ✅ Save plot to backend

      Alert.alert('Success', data.summary, [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs', params: { onAddPlot: plot } }],
            });
            setZip('');
            setCrop('');
            setArea('');
          },
        },
      ]);
    } catch (error) {
      console.error('Failed to submit plot:', error);
      Alert.alert('Error', 'Failed to add plot. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Plot</Text>

      <Text style={styles.label}>ZIP Code</Text>
      <TextInput
        style={styles.input}
        value={zip}
        onChangeText={setZip}
        keyboardType="numeric"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Crop</Text>
      <TextInput
        style={styles.input}
        value={crop}
        onChangeText={setCrop}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Area (m²)</Text>
      <TextInput
        style={styles.input}
        value={area}
        onChangeText={setArea}
        keyboardType="numeric"
        autoCapitalize="none"
      />

      <Button title="Add Plot" onPress={handleSubmit} />
    </View>
  );
};

export default AddPlotScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#F2F3F4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});
