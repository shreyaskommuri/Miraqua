// screens/Step2Details.tsx
import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import FormField from './FormField';

interface Props {
  data: {
    area: string;
    flexType: 'daily' | 'monthly';
  };
  onNext: (updates: { area: string; flexType: 'daily' | 'monthly' }) => void;
  onBack: (updates?: { area: string; flexType: 'daily' | 'monthly' }) => void;
}

const Step2Details: React.FC<Props> = ({ data, onNext, onBack }) => {
  const [area, setArea] = useState(data.area || '');
  const [flexType, setFlexType] = useState<'daily' | 'monthly'>(data.flexType || 'daily');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const parsed = parseFloat(area);
    setIsValid(!isNaN(parsed) && parsed > 0);
  }, [area]);

  const toggleFlexType = () => {
    setFlexType((prev) => (prev === 'daily' ? 'monthly' : 'daily'));
  };

  const handleNext = () => {
    if (isValid) {
      onNext({ area, flexType });
    }
  };

  const handleBack = () => {
    onBack({ area, flexType });
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
          onPress={toggleFlexType}
        />
      </View>

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
  controls: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
