
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";

interface OnboardingFlowProps {
  onComplete: (plotData: any) => void;
  onCancel: () => void;
}

const OnboardingFlow = ({ onComplete, onCancel }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [plotData, setPlotData] = useState({
    name: "",
    crop: "",
    area: "",
    areaUnit: "sq ft",
    plantingDate: "",
    latitude: "",
    longitude: "",
    flexType: "daily"
  });

  const steps = [
    {
      title: "Welcome to Miraqua",
      description: "Let's set up your smart irrigation system"
    },
    {
      title: "Plot Details",
      description: "Tell us about your garden"
    },
    {
      title: "Location Setup",
      description: "Configure your precise location"
    },
    {
      title: "All Ready!",
      description: "Your smart irrigation is configured"
    }
  ];

  const cropOptions = [
    "Tomatoes", "Lettuce", "Carrots", "Peppers", "Herbs", "Strawberries",
    "Cucumbers", "Beans", "Squash", "Corn", "Other"
  ];

  const validateCoordinates = () => {
    const lat = parseFloat(plotData.latitude);
    const lon = parseFloat(plotData.longitude);
    
    if (isNaN(lat) || isNaN(lon)) {
      return false;
    }
    
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      const newPlot = {
        ...plotData,
        latitude: parseFloat(plotData.latitude),
        longitude: parseFloat(plotData.longitude),
        moisture: Math.floor(Math.random() * 40) + 60,
        temperature: Math.floor(Math.random() * 10) + 68,
        sunlight: Math.floor(Math.random() * 200) + 800,
        nextWatering: "Tomorrow 6:00 AM",
        status: "healthy"
      };
      onComplete(newPlot);
      Alert.alert("Success!", "Your AI irrigation system is now monitoring your plot.");
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return plotData.name && plotData.crop && plotData.area && plotData.plantingDate;
      case 2:
        return validateCoordinates();
      case 3:
        return true;
      default:
        return false;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🌱</Text>
          </View>
          <Text style={styles.title}>{steps[currentStep].title}</Text>
          <Text style={styles.description}>{steps[currentStep].description}</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>Step {currentStep + 1} of {steps.length}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {currentStep === 0 && (
            <View style={styles.welcomeStep}>
              <View style={styles.featureGrid}>
                <View style={styles.featureCard}>
                  <Text style={styles.featureIcon}>💧</Text>
                  <Text style={styles.featureTitle}>Smart Watering</Text>
                  <Text style={styles.featureDescription}>AI-optimized schedules</Text>
                </View>
                <View style={styles.featureCard}>
                  <Text style={styles.featureIcon}>📅</Text>
                  <Text style={styles.featureTitle}>Weather Smart</Text>
                  <Text style={styles.featureDescription}>Real-time integration</Text>
                </View>
                <View style={styles.featureCard}>
                  <Text style={styles.featureIcon}>⚙️</Text>
                  <Text style={styles.featureTitle}>Easy Control</Text>
                  <Text style={styles.featureDescription}>Natural commands</Text>
                </View>
              </View>
            </View>
          )}

          {currentStep === 1 && (
            <View style={styles.formStep}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Plot Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Tomato Garden"
                  value={plotData.name}
                  onChangeText={(text) => setPlotData({ ...plotData, name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Crop Type</Text>
                <View style={styles.pickerContainer}>
                  {cropOptions.map((crop) => (
                    <TouchableOpacity
                      key={crop}
                      style={[
                        styles.pickerOption,
                        plotData.crop === crop && styles.pickerOptionSelected
                      ]}
                      onPress={() => setPlotData({ ...plotData, crop })}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        plotData.crop === crop && styles.pickerOptionTextSelected
                      ]}>
                        {crop}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Area</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="100"
                    keyboardType="numeric"
                    value={plotData.area}
                    onChangeText={(text) => setPlotData({ ...plotData, area: text })}
                  />
                </View>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Unit</Text>
                  <View style={styles.pickerContainer}>
                    {["sq ft", "sq m"].map((unit) => (
                      <TouchableOpacity
                        key={unit}
                        style={[
                          styles.pickerOption,
                          plotData.areaUnit === unit && styles.pickerOptionSelected
                        ]}
                        onPress={() => setPlotData({ ...plotData, areaUnit: unit })}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          plotData.areaUnit === unit && styles.pickerOptionTextSelected
                        ]}>
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Planting Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={plotData.plantingDate}
                  onChangeText={(text) => setPlotData({ ...plotData, plantingDate: text })}
                />
              </View>
            </View>
          )}

          {currentStep === 2 && (
            <View style={styles.formStep}>
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Latitude</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="37.7749"
                    keyboardType="numeric"
                    value={plotData.latitude}
                    onChangeText={(text) => setPlotData({ ...plotData, latitude: text })}
                  />
                  <Text style={styles.hint}>Range: -90 to 90</Text>
                </View>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Longitude</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="-122.4194"
                    keyboardType="numeric"
                    value={plotData.longitude}
                    onChangeText={(text) => setPlotData({ ...plotData, longitude: text })}
                  />
                  <Text style={styles.hint}>Range: -180 to 180</Text>
                </View>
              </View>

              {validateCoordinates() && (
                <View style={styles.validCard}>
                  <Text style={styles.validTitle}>Valid Coordinates</Text>
                  <Text style={styles.validText}>
                    Lat: {parseFloat(plotData.latitude).toFixed(4)}, Lon: {parseFloat(plotData.longitude).toFixed(4)}
                  </Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Watering Flexibility</Text>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[
                      styles.flexCard,
                      plotData.flexType === 'daily' && styles.flexCardSelected
                    ]}
                    onPress={() => setPlotData({ ...plotData, flexType: 'daily' })}
                  >
                    <Text style={styles.flexTitle}>Daily</Text>
                    <Text style={styles.flexDescription}>Water every day as needed</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.flexCard,
                      plotData.flexType === 'flexible' && styles.flexCardSelected
                    ]}
                    onPress={() => setPlotData({ ...plotData, flexType: 'flexible' })}
                  >
                    <Text style={styles.flexTitle}>Flexible</Text>
                    <Text style={styles.flexDescription}>Skip days when possible</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {currentStep === 3 && (
            <View style={styles.completeStep}>
              <View style={styles.successIcon}>
                <Text style={styles.successIconText}>✅</Text>
              </View>
              <Text style={styles.successTitle}>Perfect!</Text>
              <Text style={styles.successDescription}>
                Your plot "{plotData.name}" is ready for AI-powered irrigation at coordinates{' '}
                {plotData.latitude && plotData.longitude && (
                  <Text style={styles.coordinates}>
                    {parseFloat(plotData.latitude).toFixed(4)}, {parseFloat(plotData.longitude).toFixed(4)}
                  </Text>
                )}. 
                The system will analyze weather and soil conditions automatically.
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={currentStep === 0 ? onCancel : handlePrev}
            >
              <Text style={styles.backButtonText}>
                {currentStep === 0 ? "Cancel" : "Back"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={!canProceed()}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === steps.length - 1 ? "Complete Setup" : "Continue"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  progressText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    padding: 24,
  },
  welcomeStep: {
    alignItems: 'center',
  },
  featureGrid: {
    width: '100%',
  },
  featureCard: {
    backgroundColor: '#f3f4f6',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  formStep: {
    width: '100%',
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
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
  },
  pickerOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  pickerOptionTextSelected: {
    color: 'white',
  },
  validCard: {
    backgroundColor: '#dbeafe',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  validTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  validText: {
    fontSize: 14,
    color: '#1e40af',
  },
  flexCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  flexCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#dbeafe',
  },
  flexTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  flexDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  completeStep: {
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#dcfce7',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successIconText: {
    fontSize: 40,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  coordinates: {
    fontWeight: '600',
    color: '#111827',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
  },
  backButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  nextButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  nextButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  nextButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default OnboardingFlow;
