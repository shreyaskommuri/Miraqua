// components/ProgressHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  step: number;
  total: number;
}

const ProgressHeader: React.FC<Props> = ({ step, total }) => {
  const percentage = (step / total) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Step {step} of {total}</Text>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
};

export default ProgressHeader;

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  progressBarBackground: {
    height: 6,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
});
