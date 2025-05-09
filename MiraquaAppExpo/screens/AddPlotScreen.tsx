import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const AddPlotScreen = () => {
  const [name, setName] = useState('');
  const [crop, setCrop] = useState('');
  const [location, setLocation] = useState('');
  const [size, setSize] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSubmit = async () => {
    if (!name || !crop || !location || !size) {
      Alert.alert('Please fill out all fields');
      return;
    }

    try {
      const response = await fetch('http://10.35.67.235:5050/add_plot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, crop, location, size }),
      });

      if (response.ok) {
        Alert.alert('Plot added successfully!');
        navigation.navigate('MainTabs');
      } else {
        Alert.alert('Error adding plot');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Failed to connect to backend');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Plot Name" onChangeText={setName} value={name} />
      <TextInput style={styles.input} placeholder="Crop Type" onChangeText={setCrop} value={crop} />
      <TextInput style={styles.input} placeholder="Location" onChangeText={setLocation} value={location} />
      <TextInput
        style={styles.input}
        placeholder="Plot Size (m²)"
        onChangeText={setSize}
        value={size}
        keyboardType="numeric"
      />
      <Button title="Add Plot" onPress={handleSubmit} />
    </View>
  );
};

export default AddPlotScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  input: { borderWidth: 1, borderRadius: 6, padding: 10, marginBottom: 12 },
});
