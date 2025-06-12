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
import { updatePlotSettings, fetchPlotById } from '../api/api';

const PlotSettingsScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'PlotSettings'>>();
  const navigation = useNavigation();
  const plotId = route.params.plot.id;

  const [crop, setCrop] = useState('');
  const [area, setArea] = useState('');
  const [plantingDate, setPlantingDate] = useState<Date>(new Date());
  const [ageAtEntry, setAgeAtEntry] = useState('');
  const [flexType, setFlexType] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const loadPlot = async () => {
      const updated = await fetchPlotById(plotId);
      if (updated) {
        setCrop(updated.crop || '');
        setArea(String(updated.area || ''));
        setAgeAtEntry(String(updated.age_at_entry || ''));
        setFlexType(updated.flex_type === 'monthly');

        if (updated.planting_date) {
          setPlantingDate(new Date(updated.planting_date));
        }
      }
    };
    loadPlot();
  }, [plotId]);

  const handleSave = async () => {
    const parsedArea = parseFloat(area);
    const parsedAge = parseFloat(ageAtEntry);

    if (!crop || isNaN(parsedArea) || isNaN(parsedAge)) {
      Alert.alert('❌ Missing or invalid input', 'Please fill out all fields correctly.');
      return;
    }

    const updates = {
      crop,
      area: parsedArea,
      planting_date: plantingDate.toISOString().split('T')[0],
      age_at_entry: parseFloat(parsedAge.toFixed(1)),
      flex_type: flexType ? 'monthly' : 'daily',
    };

    const result = await updatePlotSettings(plotId, updates);
    if (result.success) {
      Alert.alert('✅ Settings Updated', 'Schedule will regenerate accordingly.');
      navigation.goBack();
    } else {
      Alert.alert('❌ Error', result.error || 'Failed to update settings.');
    }
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      if (selectedDate > new Date()) {
        Alert.alert('Invalid date', 'Planted date cannot be in the future.');
        return;
      }
      setPlantingDate(selectedDate);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Edit Plot Settings</Text>

      <Text style={styles.label}>Crop Type</Text>
      <TextInput value={crop} onChangeText={setCrop} style={styles.input} />

      <Text style={styles.label}>Area (m² or acres)</Text>
      <TextInput
        value={area}
        onChangeText={setArea}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Planted Date</Text>
      <Button title={`📆 ${plantingDate.toDateString()}`} onPress={() => setShowPicker(true)} />
      {showPicker && (
        <DateTimePicker
          value={plantingDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={handleDateChange}
        />
      )}

      <Text style={styles.label}>Crop age at time of planting (in months)</Text>
      <TextInput
        value={ageAtEntry}
        onChangeText={setAgeAtEntry}
        keyboardType="numeric"
        placeholder="e.g., 2.5"
        style={styles.input}
      />

      <View style={styles.flexRow}>
        <Text style={styles.label}>Flex Type</Text>
        <Switch value={flexType} onValueChange={setFlexType} />
        <Text style={{ marginLeft: 8 }}>{flexType ? 'Monthly' : 'Daily'}</Text>
      </View>

      <View style={styles.button}>
        <Button title="Save Changes" color="#1aa179" onPress={handleSave} />
      </View>
    </ScrollView>
  );
};

export default PlotSettingsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1aa179',
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    marginTop: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    fontSize: 16,
    marginTop: 4,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    marginTop: 40,
  },
});
