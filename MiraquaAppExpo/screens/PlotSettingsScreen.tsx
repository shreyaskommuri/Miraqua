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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { updatePlotSettings, fetchPlotById } from '../api/api';

const PlotSettingsScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'PlotSettings'>>();
  const navigation = useNavigation();
  const plotId = route.params.plot.id;

  const [crop, setCrop] = useState('');
  const [area, setArea] = useState('');
  const [plantingDate, setPlantingDate] = useState('');
  const [ageAtEntry, setAgeAtEntry] = useState('');
  const [flexType, setFlexType] = useState(false);

  // 🔄 Load updated plot on screen open
  useEffect(() => {
    const loadPlot = async () => {
      const updated = await fetchPlotById(plotId);
      if (updated) {
        setCrop(updated.crop || '');
        setArea(String(updated.area || ''));
        setPlantingDate(updated.planting_date || '');
        setAgeAtEntry(String(updated.age_at_entry || ''));
        setFlexType(updated.flex_type === 'monthly');
      }
    };
    loadPlot();
  }, [plotId]);

  const handleSave = async () => {
    const updates = {
      crop,
      area: parseFloat(area),
      planting_date: plantingDate,
      age_at_entry: parseFloat(ageAtEntry),
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

      <Text style={styles.label}>Planting Date (YYYY-MM-DD)</Text>
      <TextInput
        value={plantingDate}
        onChangeText={setPlantingDate}
        placeholder="e.g., 2022-03-15"
        style={styles.input}
      />

      <Text style={styles.label}>Age at Entry (years)</Text>
      <TextInput
        value={ageAtEntry}
        onChangeText={setAgeAtEntry}
        keyboardType="numeric"
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
    marginTop: 16,
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
