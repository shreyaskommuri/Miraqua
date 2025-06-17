import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { updatePlotSettings } from '../api/api';

type Props = RouteProp<RootStackParamList, 'PlotSettings'>;

export default function PlotSettingsScreen() {
  const navigation = useNavigation();
  const route = useRoute<Props>();
  // we expect the navigator to pass the full plot object here:
  const { plot } = route.params;

  // initialize state from the passed-in plot
  const [crop, setCrop]                 = useState<string>(plot.crop || '');
  const [area, setArea]                 = useState<string>(String(plot.area || ''));
  const [plantingDate, setPlantingDate] = useState<Date>(
    plot.planting_date ? new Date(plot.planting_date) : new Date()
  );
  const [ageAtEntry, setAgeAtEntry]     = useState<string>(
    String(plot.age_at_entry ?? '')
  );
  const [flexType, setFlexType]         = useState<boolean>(
    plot.flex_type === 'monthly'
  );
  const [showPicker, setShowPicker]     = useState<boolean>(false);

  // In case someone re-opens the screen with new params, re-seed:
  useEffect(() => {
    setCrop(plot.crop || '');
    setArea(String(plot.area || ''));
    setAgeAtEntry(String(plot.age_at_entry ?? ''));
    setFlexType(plot.flex_type === 'monthly');
    if (plot.planting_date) {
      setPlantingDate(new Date(plot.planting_date));
    }
  }, [plot]);

  const handleSave = async () => {
    const parsedArea = parseFloat(area);
    const parsedAge  = parseFloat(ageAtEntry);

    if (!crop || isNaN(parsedArea) || isNaN(parsedAge)) {
      Alert.alert('❌ Missing or invalid input', 'Please fill out all fields correctly.');
      return;
    }

    const updates = {
      crop,
      area: parsedArea,
      planting_date: plantingDate.toISOString().split('T')[0], // "YYYY-MM-DD"
      age_at_entry: parseFloat(parsedAge.toFixed(1)),
      flex_type: flexType ? 'monthly' : 'daily',
    };

    const result = await updatePlotSettings(plot.id, updates);
    if (result.success) {
      Alert.alert('✅ Settings Updated', 'A new schedule will be generated.');
      navigation.goBack();
    } else {
      Alert.alert('❌ Error', result.error || 'Failed to update settings.');
    }
  };

  const onDateChange = (_: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate && selectedDate <= new Date()) {
      setPlantingDate(selectedDate);
    } else if (selectedDate) {
      Alert.alert('Invalid date', 'Planted date cannot be in the future.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Edit Plot Settings</Text>

      <Text style={styles.label}>Crop Type</Text>
      <TextInput
        style={styles.input}
        value={crop}
        onChangeText={setCrop}
        placeholder="e.g., Tomatoes"
      />

      <Text style={styles.label}>Area (m² or acres)</Text>
      <TextInput
        style={styles.input}
        value={area}
        onChangeText={setArea}
        placeholder="e.g., 50"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Planted Date</Text>
      <Button
        title={`📆 ${plantingDate.toDateString()}`}
        onPress={() => setShowPicker(true)}
      />
      {showPicker && (
        <DateTimePicker
          value={plantingDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={onDateChange}
        />
      )}

      <Text style={styles.label}>Crop age at time of planting (in months)</Text>
      <TextInput
        style={styles.input}
        value={ageAtEntry}
        onChangeText={setAgeAtEntry}
        placeholder="e.g., 2.5"
        keyboardType="numeric"
      />

      <View style={styles.flexRow}>
        <Text style={styles.label}>Flex Type</Text>
        <Switch
          value={flexType}
          onValueChange={setFlexType}
        />
        <Text style={{ marginLeft: 8 }}>
          {flexType ? 'Monthly' : 'Daily'}
        </Text>
      </View>

      <View style={styles.button}>
        <Button
          title="Save Changes"
          color="#1aa179"
          onPress={handleSave}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:  { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  header:     { fontSize: 22, fontWeight: 'bold', marginBottom: 24, color: '#1aa179' },
  label:      { fontWeight: '600', fontSize: 16, marginTop: 20 },
  input:      { borderBottomWidth: 1, borderColor: '#ccc', paddingVertical: 8, fontSize: 16 },
  flexRow:    { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  button:     { marginTop: 40 },
});
