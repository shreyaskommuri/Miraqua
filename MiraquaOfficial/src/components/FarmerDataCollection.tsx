import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface FarmerData {
  // Soil Data
  soilType: string;
  drainage: string;
  currentMoisture: number;
  phLevel: number;
  organicMatter: number;
  
  // Crop Data
  cropType: string;
  variety: string;
  plantingDate: string;
  growthStage: string;
  expectedHarvest: string;
  
  // Environmental Data
  location: string;
  coordinates: { lat: number; lng: number };
  elevation: number;
  microclimate: string;
  
  // Irrigation Data
  irrigationMethod: string;
  waterSource: string;
  systemEfficiency: number;
  historicalWatering: string;
  
  // Additional Parameters
  soilDepth: number;
  rootDepth: number;
  fieldCapacity: number;
  wiltingPoint: number;
}

interface FarmerDataCollectionProps {
  plotId: string;
  onSave: (data: FarmerData) => void;
  onCancel: () => void;
  initialData?: Partial<FarmerData>;
}

const FarmerDataCollection: React.FC<FarmerDataCollectionProps> = ({
  plotId,
  onSave,
  onCancel,
  initialData = {}
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FarmerData>({
    soilType: 'loamy',
    drainage: 'moderate',
    currentMoisture: 0.3,
    phLevel: 6.5,
    organicMatter: 3.0,
    cropType: 'tomato',
    variety: 'Standard',
    plantingDate: new Date().toISOString().split('T')[0],
    growthStage: 'vegetative',
    expectedHarvest: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    location: '',
    coordinates: { lat: 0, lng: 0 },
    elevation: 100,
    microclimate: 'temperate',
    irrigationMethod: 'drip',
    waterSource: 'municipal',
    systemEfficiency: 0.85,
    historicalWatering: 'daily',
    soilDepth: 60,
    rootDepth: 30,
    fieldCapacity: 0.4,
    wiltingPoint: 0.15,
    ...initialData
  });

  const steps = [
    { title: 'Soil Data', icon: 'leaf' },
    { title: 'Crop Data', icon: 'flower' },
    { title: 'Environment', icon: 'location' },
    { title: 'Irrigation', icon: 'water' },
    { title: 'Advanced', icon: 'settings' }
  ];

  const soilTypes = [
    { value: 'sandy', label: 'Sandy (Fast drainage)' },
    { value: 'loamy', label: 'Loamy (Moderate drainage)' },
    { value: 'clay', label: 'Clay (Slow drainage)' },
    { value: 'silty', label: 'Silty (Moderate drainage)' },
    { value: 'peaty', label: 'Peaty (High organic matter)' },
    { value: 'chalky', label: 'Chalky (Alkaline)' }
  ];

  const drainageOptions = [
    { value: 'poor', label: 'Poor (Waterlogged)' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'good', label: 'Good (Well-drained)' },
    { value: 'excellent', label: 'Excellent (Very well-drained)' }
  ];

  const cropTypes = [
    { value: 'tomato', label: 'Tomato' },
    { value: 'pepper', label: 'Pepper' },
    { value: 'lettuce', label: 'Lettuce' },
    { value: 'cucumber', label: 'Cucumber' },
    { value: 'herbs', label: 'Herbs' },
    { value: 'other', label: 'Other' }
  ];

  const growthStages = [
    { value: 'germination', label: 'Germination (0-2 weeks)' },
    { value: 'seedling', label: 'Seedling (2-4 weeks)' },
    { value: 'vegetative', label: 'Vegetative (4-8 weeks)' },
    { value: 'flowering', label: 'Flowering (8-12 weeks)' },
    { value: 'fruiting', label: 'Fruiting (12+ weeks)' }
  ];

  const irrigationMethods = [
    { value: 'drip', label: 'Drip Irrigation' },
    { value: 'sprinkler', label: 'Sprinkler System' },
    { value: 'soaker', label: 'Soaker Hose' },
    { value: 'manual', label: 'Manual Watering' },
    { value: 'flood', label: 'Flood Irrigation' }
  ];

  const handleFieldChange = (field: keyof FarmerData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSave();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.location || !formData.coordinates.lat || !formData.coordinates.lng) {
      Alert.alert('Missing Data', 'Please provide location and coordinates');
      return;
    }

    onSave(formData);
  };

  const renderSoilData = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Soil Information</Text>
      <Text style={styles.stepDescription}>
        Accurate soil data helps calculate precise irrigation needs
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Soil Type</Text>
        <View style={styles.optionsGrid}>
          {soilTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.optionButton,
                formData.soilType === type.value && styles.optionButtonSelected
              ]}
              onPress={() => handleFieldChange('soilType', type.value)}
            >
              <Text style={[
                styles.optionText,
                formData.soilType === type.value && styles.optionTextSelected
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Drainage</Text>
        <View style={styles.optionsGrid}>
          {drainageOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                formData.drainage === option.value && styles.optionButtonSelected
              ]}
              onPress={() => handleFieldChange('drainage', option.value)}
            >
              <Text style={[
                styles.optionText,
                formData.drainage === option.value && styles.optionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Moisture (%)</Text>
          <TextInput
            style={styles.input}
            value={formData.currentMoisture.toString()}
            onChangeText={(text) => handleFieldChange('currentMoisture', parseFloat(text) || 0)}
            placeholder="30"
            keyboardType="numeric"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>pH Level</Text>
          <TextInput
            style={styles.input}
            value={formData.phLevel.toString()}
            onChangeText={(text) => handleFieldChange('phLevel', parseFloat(text) || 6.5)}
            placeholder="6.5"
            keyboardType="numeric"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>
      </View>
    </View>
  );

  const renderCropData = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Crop Information</Text>
      <Text style={styles.stepDescription}>
        Crop details help determine growth stage and water requirements
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Crop Type</Text>
        <View style={styles.optionsGrid}>
          {cropTypes.map((crop) => (
            <TouchableOpacity
              key={crop.value}
              style={[
                styles.optionButton,
                formData.cropType === crop.value && styles.optionButtonSelected
              ]}
              onPress={() => handleFieldChange('cropType', crop.value)}
            >
              <Text style={[
                styles.optionText,
                formData.cropType === crop.value && styles.optionTextSelected
              ]}>
                {crop.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Variety</Text>
          <TextInput
            style={styles.input}
            value={formData.variety}
            onChangeText={(text) => handleFieldChange('variety', text)}
            placeholder="e.g., Cherry, Roma"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Growth Stage</Text>
          <View style={styles.optionsGrid}>
            {growthStages.map((stage) => (
              <TouchableOpacity
                key={stage.value}
                style={[
                  styles.optionButton,
                  formData.growthStage === stage.value && styles.optionButtonSelected
                ]}
                onPress={() => handleFieldChange('growthStage', stage.value)}
              >
                <Text style={[
                  styles.optionText,
                  formData.growthStage === stage.value && styles.optionTextSelected
                ]}>
                  {stage.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Planting Date</Text>
          <TextInput
            style={styles.input}
            value={formData.plantingDate}
            onChangeText={(text) => handleFieldChange('plantingDate', text)}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Expected Harvest</Text>
          <TextInput
            style={styles.input}
            value={formData.expectedHarvest}
            onChangeText={(text) => handleFieldChange('expectedHarvest', text)}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>
      </View>
    </View>
  );

  const renderEnvironmentData = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Environmental Data</Text>
      <Text style={styles.stepDescription}>
        Location and environmental factors affect irrigation calculations
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Location Description</Text>
        <TextInput
          style={styles.input}
          value={formData.location}
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
            value={formData.coordinates.lat.toString()}
            onChangeText={(text) => handleFieldChange('coordinates', { 
              ...formData.coordinates, 
              lat: parseFloat(text) || 0 
            })}
            placeholder="37.7749"
            keyboardType="numeric"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Longitude</Text>
          <TextInput
            style={styles.input}
            value={formData.coordinates.lng.toString()}
            onChangeText={(text) => handleFieldChange('coordinates', { 
              ...formData.coordinates, 
              lng: parseFloat(text) || 0 
            })}
            placeholder="-122.4194"
            keyboardType="numeric"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Elevation (m)</Text>
          <TextInput
            style={styles.input}
            value={formData.elevation.toString()}
            onChangeText={(text) => handleFieldChange('elevation', parseFloat(text) || 0)}
            placeholder="100"
            keyboardType="numeric"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Microclimate</Text>
          <TextInput
            style={styles.input}
            value={formData.microclimate}
            onChangeText={(text) => handleFieldChange('microclimate', text)}
            placeholder="temperate, tropical, etc."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>
      </View>
    </View>
  );

  const renderIrrigationData = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Irrigation System</Text>
      <Text style={styles.stepDescription}>
        Irrigation system details affect water efficiency calculations
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Irrigation Method</Text>
        <View style={styles.optionsGrid}>
          {irrigationMethods.map((method) => (
            <TouchableOpacity
              key={method.value}
              style={[
                styles.optionButton,
                formData.irrigationMethod === method.value && styles.optionButtonSelected
              ]}
              onPress={() => handleFieldChange('irrigationMethod', method.value)}
            >
              <Text style={[
                styles.optionText,
                formData.irrigationMethod === method.value && styles.optionTextSelected
              ]}>
                {method.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Water Source</Text>
          <TextInput
            style={styles.input}
            value={formData.waterSource}
            onChangeText={(text) => handleFieldChange('waterSource', text)}
            placeholder="municipal, well, rain, etc."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>System Efficiency (%)</Text>
          <TextInput
            style={styles.input}
            value={formData.systemEfficiency.toString()}
            onChangeText={(text) => handleFieldChange('systemEfficiency', parseFloat(text) || 0.85)}
            placeholder="85"
            keyboardType="numeric"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Historical Watering Pattern</Text>
        <TextInput
          style={styles.input}
          value={formData.historicalWatering}
          onChangeText={(text) => handleFieldChange('historicalWatering', text)}
          placeholder="daily, every 2 days, weekly, etc."
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
        />
      </View>
    </View>
  );

  const renderAdvancedData = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Advanced Parameters</Text>
      <Text style={styles.stepDescription}>
        These parameters fine-tune the scientific calculations
      </Text>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Soil Depth (cm)</Text>
          <TextInput
            style={styles.input}
            value={formData.soilDepth.toString()}
            onChangeText={(text) => handleFieldChange('soilDepth', parseFloat(text) || 60)}
            placeholder="60"
            keyboardType="numeric"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Root Depth (cm)</Text>
          <TextInput
            style={styles.input}
            value={formData.rootDepth.toString()}
            onChangeText={(text) => handleFieldChange('rootDepth', parseFloat(text) || 30)}
            placeholder="30"
            keyboardType="numeric"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Field Capacity</Text>
          <TextInput
            style={styles.input}
            value={formData.fieldCapacity.toString()}
            onChangeText={(text) => handleFieldChange('fieldCapacity', parseFloat(text) || 0.4)}
            placeholder="0.4"
            keyboardType="numeric"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Wilting Point</Text>
          <TextInput
            style={styles.input}
            value={formData.wiltingPoint.toString()}
            onChangeText={(text) => handleFieldChange('wiltingPoint', parseFloat(text) || 0.15)}
            placeholder="0.15"
            keyboardType="numeric"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Organic Matter (%)</Text>
        <TextInput
          style={styles.input}
          value={formData.organicMatter.toString()}
          onChangeText={(text) => handleFieldChange('organicMatter', parseFloat(text) || 3.0)}
          placeholder="3.0"
          keyboardType="numeric"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
        />
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderSoilData();
      case 1: return renderCropData();
      case 2: return renderEnvironmentData();
      case 3: return renderIrrigationData();
      case 4: return renderAdvancedData();
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Farmer Data Collection</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {steps.map((step, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.stepButton,
                currentStep === index && styles.stepButtonActive
              ]}
              onPress={() => setCurrentStep(index)}
            >
              <Ionicons 
                name={step.icon as any} 
                size={16} 
                color={currentStep === index ? '#8B5CF6' : 'rgba(255, 255, 255, 0.6)'} 
              />
              <Text style={[
                styles.stepButtonText,
                currentStep === index && styles.stepButtonTextActive
              ]}>
                {step.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {renderStepContent()}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity 
          style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]} 
          onPress={handlePrevious}
          disabled={currentStep === 0}
        >
          <Ionicons name="arrow-back" size={20} color="white" />
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={handleNext}>
          <Text style={styles.navButtonText}>
            {currentStep === steps.length - 1 ? 'Save Data' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cancelButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
  },
  stepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  stepButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  stepButtonText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 4,
  },
  stepButtonTextActive: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8B5CF6',
  },
  optionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  optionTextSelected: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default FarmerDataCollection;
