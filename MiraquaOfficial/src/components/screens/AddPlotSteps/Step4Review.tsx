import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface Props {
  data: {
    name: string;
    crop: string;
    area: string;
    flexType: 'daily' | 'monthly';
    lat: number | null;
    lon: number | null;
    zip: string;
  };
  onBack: () => void;
  onSubmit: () => void;
}

const Step4Review: React.FC<Props> = ({ data, onBack, onSubmit }) => {
  const { name, crop, area, flexType, lat, lon, zip } = data;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🔍 Review Your Plot Info</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Plot Name:</Text>
        <Text style={styles.value}>{name}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Crop Type:</Text>
        <Text style={styles.value}>{crop}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Area:</Text>
        <Text style={styles.value}>{area} sq m</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Flex Type:</Text>
        <Text style={styles.value}>
          {flexType === 'daily' ? '🌿 Daily (moisture)' : '📅 Monthly (ET-based)'}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>ZIP Code:</Text>
        <Text style={styles.value}>{zip}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Coordinates:</Text>
        <Text style={styles.value}>
          {lat?.toFixed(4)}, {lon?.toFixed(4)}
        </Text>
      </View>

      <View style={styles.controls}>
        <Button title="Back" onPress={onBack} />
        <Button title="Submit Plot" onPress={onSubmit} />
      </View>
    </View>
  );
};

export default Step4Review;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    marginTop: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'column',
    gap: 4,
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#111',
  },
  controls: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}); 