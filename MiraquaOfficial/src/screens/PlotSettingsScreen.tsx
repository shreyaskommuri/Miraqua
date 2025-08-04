import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
  Switch,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PlotData {
  id: string;
  name: string;
  cropType: string;
  variety: string;
  zoneNumber: string;
  location: string;
  coordinates: { lat: number; lng: number };
  area: number;
  soilType: string;
  irrigationMethod: string;
  plantingDate: Date;
  expectedHarvest: Date;
  autoWatering: boolean;
  smartScheduling: boolean;
  notifications: boolean;
  weatherIntegration: boolean;
  moistureThreshold: number;
  wateringDuration: number;
  sensors: {
    moisture: { status: 'online' | 'offline'; battery: number; signal: string };
    temperature: { status: 'online' | 'offline'; battery: number; signal: string };
  };
}

export default function PlotSettingsScreen({ navigation, route }: any) {
  const { plotId } = route.params || { plotId: '1' };
  
  const [plotData, setPlotData] = useState<PlotData>({
    id: plotId,
    name: "Tomato Garden",
    cropType: "cherry-tomatoes",
    variety: "Sweet 100",
    zoneNumber: "A-1",
    location: "Backyard Plot A",
    coordinates: { lat: 37.7749, lng: -122.4194 },
    area: 25,
    soilType: "loamy",
    irrigationMethod: "drip",
    plantingDate: new Date("2024-05-15"),
    expectedHarvest: new Date("2024-08-15"),
    autoWatering: true,
    smartScheduling: true,
    notifications: true,
    weatherIntegration: true,
    moistureThreshold: 65,
    wateringDuration: 10,
    sensors: {
      moisture: { status: 'online', battery: 89, signal: 'Strong' },
      temperature: { status: 'online', battery: 76, signal: 'Good' }
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPlotData();
  }, [plotId]);

  const loadPlotData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Data is already set in state
    } catch (error) {
      Alert.alert('Error', 'Failed to load plot data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field: keyof PlotData, value: any) => {
    setPlotData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Plot settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Plot',
      'Are you sure you want to delete this plot? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await new Promise(resolve => setTimeout(resolve, 1000));
              Alert.alert('Success', 'Plot deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete plot');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const testWatering = async () => {
    Alert.alert(
      'Test Watering',
      'This will run a 30-second test watering cycle. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Test',
          onPress: async () => {
            setIsLoading(true);
            try {
              await new Promise(resolve => setTimeout(resolve, 3000));
              Alert.alert('Success', 'Test watering completed successfully');
            } catch (error) {
              Alert.alert('Error', 'Test watering failed');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderGeneralSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>General Settings</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Plot Name</Text>
        <TextInput
          style={styles.input}
          value={plotData.name}
          onChangeText={(text) => handleFieldChange('name', text)}
          placeholder="Enter plot name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Crop Type</Text>
        <TextInput
          style={styles.input}
          value={plotData.cropType}
          onChangeText={(text) => handleFieldChange('cropType', text)}
          placeholder="Enter crop type"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Variety</Text>
        <TextInput
          style={styles.input}
          value={plotData.variety}
          onChangeText={(text) => handleFieldChange('variety', text)}
          placeholder="Enter variety"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Zone Number</Text>
        <TextInput
          style={styles.input}
          value={plotData.zoneNumber}
          onChangeText={(text) => handleFieldChange('zoneNumber', text)}
          placeholder="Enter zone number"
        />
      </View>
    </View>
  );

  const renderWateringSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Watering Settings</Text>
      
      <View style={styles.switchGroup}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Auto Watering</Text>
          <Switch
            value={plotData.autoWatering}
            onValueChange={(value) => handleFieldChange('autoWatering', value)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={plotData.autoWatering ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Smart Scheduling</Text>
          <Switch
            value={plotData.smartScheduling}
            onValueChange={(value) => handleFieldChange('smartScheduling', value)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={plotData.smartScheduling ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Weather Integration</Text>
          <Switch
            value={plotData.weatherIntegration}
            onValueChange={(value) => handleFieldChange('weatherIntegration', value)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={plotData.weatherIntegration ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Moisture Threshold (%)</Text>
        <TextInput
          style={styles.input}
          value={plotData.moistureThreshold.toString()}
          onChangeText={(text) => handleFieldChange('moistureThreshold', parseInt(text) || 0)}
          placeholder="Enter threshold"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Watering Duration (minutes)</Text>
        <TextInput
          style={styles.input}
          value={plotData.wateringDuration.toString()}
          onChangeText={(text) => handleFieldChange('wateringDuration', parseInt(text) || 0)}
          placeholder="Enter duration"
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.testButton} onPress={testWatering}>
        <Ionicons name="water" size={20} color="#3B82F6" />
        <Text style={styles.testButtonText}>Test Watering</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSensorSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Sensor Settings</Text>
      
      <View style={styles.sensorCard}>
        <View style={styles.sensorHeader}>
          <Ionicons name="thermometer" size={24} color="#3B82F6" />
          <Text style={styles.sensorTitle}>Moisture Sensor</Text>
        </View>
        <View style={styles.sensorStatus}>
          <Text style={[styles.statusText, { color: plotData.sensors.moisture.status === 'online' ? '#10B981' : '#EF4444' }]}>
            {plotData.sensors.moisture.status.toUpperCase()}
          </Text>
          <Text style={styles.batteryText}>Battery: {plotData.sensors.moisture.battery}%</Text>
        </View>
      </View>

      <View style={styles.sensorCard}>
        <View style={styles.sensorHeader}>
          <Ionicons name="thermometer" size={24} color="#F59E0B" />
          <Text style={styles.sensorTitle}>Temperature Sensor</Text>
        </View>
        <View style={styles.sensorStatus}>
          <Text style={[styles.statusText, { color: plotData.sensors.temperature.status === 'online' ? '#10B981' : '#EF4444' }]}>
            {plotData.sensors.temperature.status.toUpperCase()}
          </Text>
          <Text style={styles.batteryText}>Battery: {plotData.sensors.temperature.battery}%</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#6b7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plot Settings</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Ionicons name="checkmark" size={20} color="#10B981" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'general' && styles.activeTab]}
          onPress={() => setActiveTab('general')}
        >
          <Text style={[styles.tabText, activeTab === 'general' && styles.activeTabText]}>General</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'watering' && styles.activeTab]}
          onPress={() => setActiveTab('watering')}
        >
          <Text style={[styles.tabText, activeTab === 'watering' && styles.activeTabText]}>Watering</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sensors' && styles.activeTab]}
          onPress={() => setActiveTab('sensors')}
        >
          <Text style={[styles.tabText, activeTab === 'sensors' && styles.activeTabText]}>Sensors</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'watering' && renderWateringSettings()}
        {activeTab === 'sensors' && renderSensorSettings()}
      </ScrollView>

      {/* Delete Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash" size={20} color="#EF4444" />
          <Text style={styles.deleteButtonText}>Delete Plot</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  saveButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  switchGroup: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  switchLabel: {
    fontSize: 16,
    color: '#374151',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
  },
  testButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  sensorCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sensorTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  sensorStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  batteryText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 12,
  },
  deleteButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
}); 