
import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddPlotScreen = () => {
  const [plotName, setPlotName] = useState('');
  const [cropType, setCropType] = useState('');
  const [location, setLocation] = useState('');

  const handleAddPlot = () => {
    if (!plotName || !cropType || !location) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    Alert.alert('Success', 'Plot added successfully!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add New Plot</Text>
        <Text style={styles.subtitle}>Set up your garden plot</Text>
      </View>

      <View style={styles.content}>
        {/* Plot Name */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Plot Name</Text>
          <TextInput
            style={styles.textInput}
            value={plotName}
            onChangeText={setPlotName}
            placeholder="e.g., Tomato Garden"
          />
        </View>

        {/* Crop Type */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Crop Type</Text>
          <TextInput
            style={styles.textInput}
            value={cropType}
            onChangeText={setCropType}
            placeholder="e.g., Tomatoes, Herbs"
          />
        </View>

        {/* Location */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Location</Text>
          <TextInput
            style={styles.textInput}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g., Backyard, Balcony"
          />
        </View>

        {/* Quick Setup Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Setup</Text>
          
          <View style={styles.optionCard}>
            <Ionicons name="water" size={20} color="#3B82F6" />
            <Text style={styles.optionText}>Add Irrigation System</Text>
            <TouchableOpacity style={styles.optionButton}>
              <Text style={styles.optionButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.optionCard}>
            <Ionicons name="hardware-chip" size={20} color="#F59E0B" />
            <Text style={styles.optionText}>Add Soil Sensors</Text>
            <TouchableOpacity style={styles.optionButton}>
              <Text style={styles.optionButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.optionCard}>
            <Ionicons name="calendar" size={20} color="#10B981" />
            <Text style={styles.optionText}>Set Watering Schedule</Text>
            <TouchableOpacity style={styles.optionButton}>
              <Text style={styles.optionButtonText}>Set</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Plot Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddPlot}>
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Add Plot</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
    marginLeft: 12,
  },
  optionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  optionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AddPlotScreen;
