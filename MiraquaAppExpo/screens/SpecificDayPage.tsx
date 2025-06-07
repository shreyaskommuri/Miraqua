import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  ScrollView,
  Alert,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { EXPO_PUBLIC_MYIPADRESS } from '@env';

const BASE_URL = `http://${EXPO_PUBLIC_MYIPADRESS}:5050`;

const SpecificDayPage = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'SpecificDay'>>();
  const { plotId, dayData, dayIndex } = route.params;

  const [startTime, setStartTime] = useState(dayData.start_time || '06:00');
  const [endTime, setEndTime] = useState(dayData.end_time || '06:45');
  const [notes, setNotes] = useState(dayData.notes || '');

  const handleSave = async () => {
    try {
      const res = await fetch(`${BASE_URL}/update_schedule_day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plot_id: plotId,
          day_index: dayIndex,
          day_data: {
            start_time: startTime,
            end_time: endTime,
            notes: notes,
          },
        }),
      });

      const result = await res.json();
      if (result.success) {
        Alert.alert("✅ Saved", "Your changes have been saved.");
      } else {
        Alert.alert("❌ Error", result.error || "Something went wrong.");
      }
    } catch (err) {
      console.error("Error saving day data:", err);
      Alert.alert("❌ Network Error", "Could not connect to server.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{dayData.day || `Day ${dayIndex + 1}`}</Text>

      <Text style={styles.label}>💧 Liters</Text>
      <Text style={styles.value}>{dayData.liters} L</Text>

      <Text style={styles.label}>🕐 Start Time</Text>
      <TextInput value={startTime} onChangeText={setStartTime} style={styles.input} />

      <Text style={styles.label}>🕐 End Time</Text>
      <TextInput value={endTime} onChangeText={setEndTime} style={styles.input} />

      <Text style={styles.label}>📓 Notes</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={4}
        placeholder="Add observations, crop conditions, or reminders..."
        style={styles.notes}
      />

      {dayData.weather && (
        <>
          <Text style={styles.label}>🌤️ Weather</Text>
          <Text>Temperature: {dayData.weather.temp_f} °F</Text>
          <Text>Humidity: {dayData.weather.humidity} %</Text>
          <Text>Sunlight: {dayData.weather.sunlight}</Text>
        </>
      )}

      <View style={styles.button}>
        <Button title="Save Changes" color="#1aa179" onPress={handleSave} />
      </View>
    </ScrollView>
  );
};

export default SpecificDayPage;

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1aa179' },
  label: { marginTop: 16, fontWeight: '600', fontSize: 16 },
  value: { fontSize: 18, color: '#333', marginTop: 4 },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    fontSize: 16,
    marginTop: 4,
  },
  notes: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  button: { marginTop: 32 },
});
