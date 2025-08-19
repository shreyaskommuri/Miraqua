import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import FormField from './FormField';

interface Props {
  data: {
    name: string;
    crop: string;
  };
  onNext: (data: { name: string; crop: string }) => void;
}

const Step1BasicInfo: React.FC<Props> = ({ data, onNext }) => {
  const [name, setName] = useState(data.name || '');
  const [crop, setCrop] = useState(data.crop || '');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setIsValid(name.trim().length > 0 && crop.trim().length > 0);
  }, [name, crop]);

  const handleNext = () => {
    if (isValid) {
      onNext({ name: name.trim(), crop: crop.trim() });
    }
  };

  return (
    <View style={styles.container}>
      <FormField
        label="Plot Name"
        placeholder="e.g., Front Field"
        value={name}
        onChangeText={setName}
      />

      <FormField
        label="Crop Type"
        placeholder="e.g., Tomatoes"
        value={crop}
        onChangeText={setCrop}
      />

      <View style={styles.button}>
        <Button title="Next" onPress={handleNext} disabled={!isValid} />
      </View>
    </View>
  );
};

export default Step1BasicInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    marginTop: 20,
  },
  button: {
    marginTop: 30,
  },
}); 