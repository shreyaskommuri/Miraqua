import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Text, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FormField from './FormField';

interface Props {
  data: {
    area: string;
    flexType: 'daily' | 'monthly';
    planting_date?: string;
    age_at_entry?: number;
  };
  onNext: (updates: {
    area: string;
    flexType: 'daily' | 'monthly';
    planting_date: string;
    age_at_entry: number;
  }) => void;
  onBack: (updates?: {
    area: string;
    flexType: 'daily' | 'monthly';
    planting_date: string;
    age_at_entry: number;
  }) => void;
}

const Step2Details: React.FC<Props> = ({ data, onNext, onBack }) => {
  const [area, setArea] = useState(data.area || '');
  const [flexType, setFlexType] = useState<'daily' | 'monthly'>(data.flexType || 'daily');
  const [plantingDate, setPlantingDate] = useState<Date>(
    data.planting_date ? new Date(data.planting_date) : new Date()
  );
  const [ageInput, setAgeInput] = useState(data.age_at_entry?.toString() || '');
  const [showPicker, setShowPicker] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const parsedArea = parseFloat(area);
    const parsedAge = parseFloat(ageInput);
    setIsValid(
      !isNaN(parsedArea) && parsedArea > 0 &&
      !isNaN(parsedAge) && parsedAge >= 0
    );
  }, [area, ageInput]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') {
      setShowPicker(false);
    }
    if (selectedDate) {
      const today = new Date();
      if (selectedDate > today) {
        Alert.alert("Invalid Date", "Planted date cannot be in the future.");
        return;
      }
      setPlantingDate(selectedDate);
    }
  };

  const handleNext = () => {
    const parsedAge = parseFloat(ageInput);
    if (!isValid) return;

    onNext({
      area,
      flexType,
      planting_date: plantingDate.toISOString().split('T')[0],
      age_at_entry: parseFloat(parsedAge.toFixed(1)),
    });
  };

  const handleBack = () => {
    const parsedAge = parseFloat(ageInput);
    onBack({
      area,
      flexType,
      planting_date: plantingDate.toISOString().split('T')[0],
      age_at_entry: parseFloat(parsedAge.toFixed(1)),
    });
  };

  return (
    <View style={styles.container}>
      <FormField
        label="Area (sq m)"
        placeholder="e.g., 1000"
        value={area}
        onChangeText={setArea}
        keyboardType="numeric"
      />

      <View style={styles.flexTypeToggle}>
        <Text style={styles.label}>Flex Type</Text>
        <Button
          title={flexType === 'daily' ? '🌿 Daily (moisture)' : '📅 Monthly (ET-based)'}
          onPress={() => setFlexType(flexType === 'daily' ? 'monthly' : 'daily')}
        />
      </View>

      <View style={styles.plantingDateSection}>
        <Text style={styles.label}>Planted Date</Text>
        <Button
          title={`📆 ${plantingDate.toDateString()}`}
          onPress={() => setShowPicker(true)}
        />

        {Platform.OS === 'ios' && showPicker && (
          <View style={styles.iosPickerContainer}>
            <DateTimePicker
              value={plantingDate}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setPlantingDate(selectedDate);
                }
              }}
            />
            <View style={styles.iosPickerButtons}>
              <Button title="Cancel" onPress={() => setShowPicker(false)} />
              <Button title="Done" onPress={() => setShowPicker(false)} />
            </View>
          </View>
        )}

        {Platform.OS !== 'ios' && showPicker && (
          <DateTimePicker
            value={plantingDate}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={handleDateChange}
          />
        )}
      </View>

      <FormField
        label="How old was the crop (in months) when planted?"
        placeholder="e.g., 2"
        value={ageInput}
        onChangeText={setAgeInput}
        keyboardType="numeric"
      />

      <Text style={styles.note}>
        Miraqua will track the full crop age using this data.
      </Text>

      <View style={styles.controls}>
        <Button title="Back" onPress={handleBack} />
        <Button title="Next" onPress={handleNext} disabled={!isValid} />
      </View>
    </View>
  );
};

export default Step2Details;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  flexTypeToggle: {
    marginTop: 10,
    gap: 8,
  },
  plantingDateSection: {
    marginTop: 20,
    gap: 10,
  },
  iosPickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 10,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iosPickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  note: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },
  controls: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}); 