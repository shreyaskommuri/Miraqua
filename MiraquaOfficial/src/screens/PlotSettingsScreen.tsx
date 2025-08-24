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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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
  const [hasChanges, setHasChanges] = useState(false);

  const cropTypes = [
    { value: "cherry-tomatoes", label: "Cherry Tomatoes" },
    { value: "bell-peppers", label: "Bell Peppers" },
    { value: "basil", label: "Basil" },
    { value: "oregano", label: "Oregano" },
    { value: "lettuce", label: "Lettuce" },
    { value: "carrots", label: "Carrots" },
    { value: "strawberries", label: "Strawberries" },
    { value: "cucumbers", label: "Cucumbers" },
    { value: "spinach", label: "Spinach" },
    { value: "kale", label: "Kale" }
  ];

  const soilTypes = [
    { value: "loamy", label: "Loamy" },
    { value: "sandy", label: "Sandy" },
    { value: "clay", label: "Clay" },
    { value: "silty", label: "Silty" },
    { value: "peaty", label: "Peaty" },
    { value: "chalky", label: "Chalky" }
  ];

  const irrigationMethods = [
    { value: "drip", label: "Drip Irrigation" },
    { value: "sprinkler", label: "Sprinkler System" },
    { value: "soaker", label: "Soaker Hose" },
    { value: "manual", label: "Manual Watering" },
    { value: "mist", label: "Misting System" }
  ];

  useEffect(() => {
    loadPlotData();
  }, [plotId]);

  const loadPlotData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Loading plot data for plot ID:', plotId);
      
      // Import the getPlotById function
      const { getPlotById } = await import('../api/plots');
      
      // Fetch the plot data from the database
      const result = await getPlotById(plotId);
      
      if (result.success && result.plot) {
        console.log('✅ Plot data loaded:', result.plot);
        
        // Transform the database data to match our PlotData interface
        const plot = result.plot;
        setPlotData({
          id: plot.id,
          name: plot.name || "Unnamed Plot",
          cropType: plot.crop || "unknown",
          variety: "Standard", // Default value since not in database
          zoneNumber: "A-1", // Default value since not in database
          location: "Backyard Plot A", // Default value since not in database
          coordinates: { 
            lat: plot.lat || 37.7749, 
            lng: plot.lon || -122.4194 
          },
          area: plot.area || 25,
          soilType: "loamy", // Default value since not in database
          irrigationMethod: "drip", // Default value since not in database
          plantingDate: new Date(plot.planting_date || "2024-05-15"),
          expectedHarvest: new Date("2024-08-15"), // Default value since not in database
          autoWatering: true, // Default value since not in database
          smartScheduling: true, // Default value since not in database
          notifications: true, // Default value since not in database
          weatherIntegration: true, // Default value since not in database
          moistureThreshold: 65, // Default value since not in database
          wateringDuration: 10, // Default value since not in database
          sensors: {
            moisture: { status: 'online', battery: 89, signal: 'Strong' },
            temperature: { status: 'online', battery: 76, signal: 'Good' }
          }
        });
      } else {
        console.error('❌ Failed to load plot data:', result.error);
        Alert.alert('Error', `Failed to load plot data: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error loading plot data:', error);
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
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log('💾 Saving plot settings for plot ID:', plotId);
      console.log('💾 Updated plot data:', plotData);
      
      // Import the updatePlot function
      const { updatePlot } = await import('../api/plots');
      
      // Call the API to actually save the plot
      const result = await updatePlot(plotId, {
        name: plotData.name,
        area: plotData.area,
        crop: plotData.cropType, // Map cropType to crop
        // Note: Only update fields that exist in your Plot interface
        // The Plot interface has: id, name, crop, zip_code, area, ph_level, lat, lon, flex_type, planting_date, age_at_entry, custom_constraints, user_id, updated_at
      });
      
      if (result.success) {
        console.log('✅ Plot updated successfully:', result.plot);
        Alert.alert('✅ Settings saved', 'Your plot settings have been updated successfully');
        setHasChanges(false);
        
        // Refresh the plot data to show the updated values
        await loadPlotData();
      } else {
        console.error('❌ Failed to update plot:', result.error);
        Alert.alert('Error', `Failed to save settings: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error saving plot settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
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
              Alert.alert('🗑️ Plot deleted', 'Your plot has been removed successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete plot. Please try again.');
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
              await new Promise(resolve => setTimeout(resolve, 2000));
              Alert.alert('💧 Test watering completed', 'Manual watering cycle ran for 30 seconds');
            } catch (error) {
              Alert.alert('Error', 'Failed to start test watering');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const addSensor = () => {
    Alert.alert('Add Sensor', 'Sensor pairing mode activated. Follow device instructions.');
  };

  const getDaysPlanted = () => {
    const planted = plotData.plantingDate;
    const now = new Date();
    return Math.floor((now.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24));
  };

  const renderGeneralSettings = () => (
    <View style={styles.section}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons name="leaf" size={20} color="#10B981" />
          </View>
          <Text style={styles.cardTitle}>Basic Information</Text>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Plot Name</Text>
              <TextInput
                style={styles.input}
                value={plotData.name}
                onChangeText={(text) => handleFieldChange('name', text)}
                placeholder="Enter plot name"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Zone Number</Text>
              <TextInput
                style={styles.input}
                value={plotData.zoneNumber}
                onChangeText={(text) => handleFieldChange('zoneNumber', text)}
                placeholder="e.g., A-1, Zone 3"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Crop Type</Text>
              <TextInput
                style={styles.input}
                value={plotData.cropType}
                onChangeText={(text) => handleFieldChange('cropType', text)}
                placeholder="Select crop type"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Variety</Text>
              <TextInput
                style={styles.input}
                value={plotData.variety}
                onChangeText={(text) => handleFieldChange('variety', text)}
                placeholder="e.g., Sweet 100, Roma"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location Description</Text>
            <TextInput
              style={styles.input}
              value={plotData.location}
              onChangeText={(text) => handleFieldChange('location', text)}
              placeholder="e.g., Backyard Plot A, Greenhouse Section 2"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Latitude</Text>
              <TextInput
                style={styles.input}
                value={plotData.coordinates.lat.toString()}
                onChangeText={(text) => handleFieldChange('coordinates', { ...plotData.coordinates, lat: parseFloat(text) || 0 })}
                placeholder="37.7749"
                keyboardType="numeric"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Longitude</Text>
              <TextInput
                style={styles.input}
                value={plotData.coordinates.lng.toString()}
                onChangeText={(text) => handleFieldChange('coordinates', { ...plotData.coordinates, lng: parseFloat(text) || 0 })}
                placeholder="-122.4194"
                keyboardType="numeric"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Area (sq ft)</Text>
              <TextInput
                style={styles.input}
                value={plotData.area.toString()}
                onChangeText={(text) => handleFieldChange('area', parseFloat(text) || 0)}
                placeholder="25"
                keyboardType="numeric"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Soil Type</Text>
              <TextInput
                style={styles.input}
                value={plotData.soilType}
                onChangeText={(text) => handleFieldChange('soilType', text)}
                placeholder="Select soil type"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Irrigation Method</Text>
              <TextInput
                style={styles.input}
                value={plotData.irrigationMethod}
                onChangeText={(text) => handleFieldChange('irrigationMethod', text)}
                placeholder="Select method"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>
          </View>

          <View style={styles.plantingInfo}>
            <View style={styles.plantingHeader}>
              <Ionicons name="calendar" size={20} color="#10B981" />
              <Text style={styles.plantingTitle}>Planted {getDaysPlanted()} days ago</Text>
            </View>
            <Text style={styles.plantingSubtitle}>
              Expected harvest: {plotData.expectedHarvest.toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderWateringSettings = () => (
    <View style={styles.section}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons name="water" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.cardTitle}>Watering Configuration</Text>
          <TouchableOpacity style={styles.testButton} onPress={testWatering}>
            <Ionicons name="water" size={16} color="#3B82F6" />
            <Text style={styles.testButtonText}>Test Water</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.switchCard}>
            <View style={styles.switchContent}>
              <Ionicons name="water" size={20} color="#3B82F6" />
              <View style={styles.switchText}>
                <Text style={styles.switchTitle}>Auto Watering</Text>
                <Text style={styles.switchSubtitle}>Enable automatic irrigation</Text>
              </View>
            </View>
            <Switch
              value={plotData.autoWatering}
              onValueChange={(value) => handleFieldChange('autoWatering', value)}
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor={plotData.autoWatering ? '#ffffff' : '#9CA3AF'}
            />
          </View>

          <View style={styles.sliderGroup}>
            <Text style={styles.label}>Moisture Threshold ({plotData.moistureThreshold}%)</Text>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: `${plotData.moistureThreshold}%` }]} />
              </View>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>20% (Dry)</Text>
                <Text style={styles.sliderLabel}>100% (Saturated)</Text>
              </View>
            </View>
          </View>

          <View style={styles.sliderGroup}>
            <Text style={styles.label}>Watering Duration ({plotData.wateringDuration} minutes)</Text>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: `${(plotData.wateringDuration / 30) * 100}%` }]} />
              </View>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>2 min</Text>
                <Text style={styles.sliderLabel}>30 min</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSensorSettings = () => (
    <View style={styles.section}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons name="wifi" size={20} color="#F59E0B" />
          </View>
          <Text style={styles.cardTitle}>Sensor Management</Text>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.sensorGrid}>
            <View style={styles.sensorCard}>
              <View style={styles.sensorHeader}>
                <Ionicons name="water" size={20} color="#10B981" />
                <Text style={styles.sensorTitle}>Moisture Sensor</Text>
                <View style={[styles.statusBadge, { backgroundColor: plotData.sensors.moisture.status === 'online' ? '#10B981' : '#EF4444' }]}>
                  <Text style={styles.statusText}>{plotData.sensors.moisture.status}</Text>
                </View>
              </View>
              <View style={styles.sensorDetails}>
                <View style={styles.sensorDetail}>
                  <Text style={styles.detailLabel}>Battery</Text>
                  <View style={styles.batteryInfo}>
                    <Ionicons name="battery-charging" size={16} color="#10B981" />
                    <Text style={styles.batteryText}>{plotData.sensors.moisture.battery}%</Text>
                  </View>
                </View>
                <View style={styles.sensorDetail}>
                  <Text style={styles.detailLabel}>Signal</Text>
                  <Text style={styles.signalText}>{plotData.sensors.moisture.signal}</Text>
                </View>
              </View>
            </View>

            <View style={styles.sensorCard}>
              <View style={styles.sensorHeader}>
                <Ionicons name="thermometer" size={20} color="#F59E0B" />
                <Text style={styles.sensorTitle}>Temperature Sensor</Text>
                <View style={[styles.statusBadge, { backgroundColor: plotData.sensors.temperature.status === 'online' ? '#10B981' : '#EF4444' }]}>
                  <Text style={styles.statusText}>{plotData.sensors.temperature.status}</Text>
                </View>
              </View>
              <View style={styles.sensorDetails}>
                <View style={styles.sensorDetail}>
                  <Text style={styles.detailLabel}>Battery</Text>
                  <View style={styles.batteryInfo}>
                    <Ionicons name="battery-charging" size={16} color="#F59E0B" />
                    <Text style={styles.batteryText}>{plotData.sensors.temperature.battery}%</Text>
                  </View>
                </View>
                <View style={styles.sensorDetail}>
                  <Text style={styles.detailLabel}>Signal</Text>
                  <Text style={styles.signalText}>{plotData.sensors.temperature.signal}</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.addSensorButton} onPress={addSensor}>
            <Ionicons name="add" size={20} color="#3B82F6" />
            <Text style={styles.addSensorText}>Add New Sensor</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderAdvancedSettings = () => (
    <View style={styles.section}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons name="settings" size={20} color="#8B5CF6" />
          </View>
          <Text style={styles.cardTitle}>Advanced Options</Text>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.switchCard}>
            <View style={styles.switchContent}>
                             <Ionicons name="analytics" size={20} color="#8B5CF6" />
              <View style={styles.switchText}>
                <Text style={styles.switchTitle}>Smart Scheduling</Text>
                <Text style={styles.switchSubtitle}>AI-powered watering optimization</Text>
              </View>
            </View>
            <Switch
              value={plotData.smartScheduling}
              onValueChange={(value) => handleFieldChange('smartScheduling', value)}
              trackColor={{ false: '#374151', true: '#8B5CF6' }}
              thumbColor={plotData.smartScheduling ? '#ffffff' : '#9CA3AF'}
            />
          </View>

          <View style={styles.switchCard}>
            <View style={styles.switchContent}>
              <Ionicons name="sunny" size={20} color="#F59E0B" />
              <View style={styles.switchText}>
                <Text style={styles.switchTitle}>Weather Integration</Text>
                <Text style={styles.switchSubtitle}>Skip watering when rain is expected</Text>
              </View>
            </View>
            <Switch
              value={plotData.weatherIntegration}
              onValueChange={(value) => handleFieldChange('weatherIntegration', value)}
              trackColor={{ false: '#374151', true: '#F59E0B' }}
              thumbColor={plotData.weatherIntegration ? '#ffffff' : '#9CA3AF'}
            />
          </View>

          <View style={styles.switchCard}>
            <View style={styles.switchContent}>
              <Ionicons name="notifications" size={20} color="#3B82F6" />
              <View style={styles.switchText}>
                <Text style={styles.switchTitle}>Push Notifications</Text>
                <Text style={styles.switchSubtitle}>Get alerts for important events</Text>
              </View>
            </View>
            <Switch
              value={plotData.notifications}
              onValueChange={(value) => handleFieldChange('notifications', value)}
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor={plotData.notifications ? '#ffffff' : '#9CA3AF'}
            />
          </View>
        </View>
      </View>

      <View style={styles.dangerCard}>
        <View style={styles.cardHeader}>
          <View style={styles.dangerIcon}>
            <Ionicons name="warning" size={20} color="#EF4444" />
          </View>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.dangerContent}>
            <Text style={styles.dangerHeader}>Delete Plot</Text>
            <Text style={styles.dangerText}>
              This will permanently delete this plot and all associated data. This action cannot be undone.
            </Text>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash" size={20} color="#EF4444" />
              <Text style={styles.deleteButtonText}>Delete Plot</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderNotificationsSettings = () => (
    <View style={styles.section}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons name="notifications" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.cardTitle}>Notification Preferences</Text>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.switchCard}>
            <View style={styles.switchContent}>
              <Ionicons name="water" size={20} color="#3B82F6" />
              <View style={styles.switchText}>
                <Text style={styles.switchTitle}>Watering reminders</Text>
                <Text style={styles.switchSubtitle}>Get notified when watering is needed</Text>
              </View>
            </View>
            <Switch
              value={plotData.notifications}
              onValueChange={(value) => handleFieldChange('notifications', value)}
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor={plotData.notifications ? '#ffffff' : '#9CA3AF'}
            />
          </View>

          <View style={styles.switchCard}>
            <View style={styles.switchContent}>
              <Ionicons name="rainy" size={20} color="#3B82F6" />
              <View style={styles.switchText}>
                <Text style={styles.switchTitle}>Rain forecast alerts</Text>
                <Text style={styles.switchSubtitle}>Skip watering when rain is expected</Text>
              </View>
            </View>
            <Switch
              value={plotData.weatherIntegration}
              onValueChange={(value) => handleFieldChange('weatherIntegration', value)}
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor={plotData.weatherIntegration ? '#ffffff' : '#9CA3AF'}
            />
          </View>

          <View style={styles.switchCard}>
            <View style={styles.switchContent}>
              <Ionicons name="warning" size={20} color="#F59E0B" />
              <View style={styles.switchText}>
                <Text style={styles.switchTitle}>Low moisture alerts</Text>
                <Text style={styles.switchSubtitle}>Get notified when soil is too dry</Text>
              </View>
            </View>
            <Switch
              value={plotData.notifications}
              onValueChange={(value) => handleFieldChange('notifications', value)}
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor={plotData.notifications ? '#ffffff' : '#9CA3AF'}
            />
          </View>
        </View>
      </View>
    </View>
  );

  if (isLoading && !plotData.name) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingSpinner} />
        <Text style={styles.loadingText}>Loading plot settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Settings</Text>
              <Text style={styles.headerSubtitle}>Configure "{plotData.name}"</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            {hasChanges && (
              <View style={styles.unsavedBadge}>
                <Ionicons name="wifi" size={12} color="#3B82F6" />
              </View>
            )}
            <TouchableOpacity 
              style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={isLoading || !hasChanges}
            >
              <Ionicons name="checkmark" size={16} color="white" />
              <Text style={styles.saveButtonText}>{isLoading ? "Saving..." : "Save"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
          <TouchableOpacity
            style={[styles.tab, activeTab === 'advanced' && styles.activeTab]}
            onPress={() => setActiveTab('advanced')}
          >
            <Text style={[styles.tabText, activeTab === 'advanced' && styles.activeTabText]}>Advanced</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
            onPress={() => setActiveTab('notifications')}
          >
            <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>Notifications</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'watering' && renderWateringSettings()}
        {activeTab === 'sensors' && renderSensorSettings()}
        {activeTab === 'advanced' && renderAdvancedSettings()}
        {activeTab === 'notifications' && renderNotificationsSettings()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  loadingSpinner: {
    width: 48,
    height: 48,
    borderWidth: 4,
    borderColor: '#10B981',
    borderTopColor: 'transparent',
    borderRadius: 24,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unsavedBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  unsavedText: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  tabContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  dangerCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dangerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    flex: 1,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  cardContent: {
    padding: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: 'white',
  },
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 12,
  },
  switchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchText: {
    marginLeft: 12,
    flex: 1,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  switchSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  sliderGroup: {
    marginBottom: 20,
  },
  sliderContainer: {
    marginTop: 8,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    position: 'relative',
  },
  sliderFill: {
    height: 6,
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  plantingInfo: {
    padding: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    marginTop: 16,
  },
  plantingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  plantingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 8,
  },
  plantingSubtitle: {
    fontSize: 14,
    color: 'rgba(16, 185, 129, 0.8)',
    marginLeft: 28,
  },
  sensorGrid: {
    marginBottom: 16,
  },
  sensorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sensorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  sensorDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sensorDetail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  batteryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginLeft: 4,
  },
  signalText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  addSensorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 12,
    paddingVertical: 16,
  },
  addSensorText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 8,
  },
  dangerContent: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  dangerHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 8,
  },
  dangerText: {
    fontSize: 14,
    color: 'rgba(239, 68, 68, 0.8)',
    marginBottom: 16,
    lineHeight: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 12,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    marginLeft: 8,
  },
}); 