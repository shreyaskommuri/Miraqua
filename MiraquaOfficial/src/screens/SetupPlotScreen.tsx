import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addPlot } from '../api/plots';

interface SetupPlotScreenProps {
  navigation: any;
}

const SetupPlotScreen = ({ navigation }: SetupPlotScreenProps) => {
  const [plotName, setPlotName] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [area, setArea] = useState('');
  const [phLevel, setPhLevel] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [plantingDate, setPlantingDate] = useState('');
  const [ageAtEntry, setAgeAtEntry] = useState('');
  const [customConstraints, setCustomConstraints] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const crops = [
    { id: 'tomatoes',     name: 'Tomatoes',     emoji: '🍅', wateringFreq: 'Daily',         difficulty: 'Beginner',     popular: true  },
    { id: 'herbs',        name: 'Herbs',         emoji: '🌿', wateringFreq: 'Every 2-3 days', difficulty: 'Beginner',     popular: true  },
    { id: 'strawberries', name: 'Strawberries',  emoji: '🍓', wateringFreq: 'Daily',         difficulty: 'Intermediate', popular: true  },
    { id: 'lettuce',      name: 'Lettuce',       emoji: '🥬', wateringFreq: 'Every 2 days',  difficulty: 'Beginner',     popular: false },
    { id: 'carrots',      name: 'Carrots',       emoji: '🥕', wateringFreq: 'Every 2 days',  difficulty: 'Beginner',     popular: false },
    { id: 'peppers',      name: 'Peppers',       emoji: '🌶️', wateringFreq: 'Daily',         difficulty: 'Intermediate', popular: false },
    { id: 'broccoli',     name: 'Broccoli',      emoji: '🥦', wateringFreq: 'Daily',         difficulty: 'Intermediate', popular: false },
    { id: 'beans',        name: 'Beans',         emoji: '🫘', wateringFreq: 'Every 2 days',  difficulty: 'Beginner',     popular: false },
    { id: 'custom',       name: 'Other/Custom',  emoji: '✨', wateringFreq: 'Custom',        difficulty: 'Variable',     popular: false },
  ];

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (plotName.trim().length < 2) newErrors.plotName = 'At least 2 characters';
      if (!selectedCrop) newErrors.selectedCrop = 'Please select a crop';
    }
    if (step === 2) {
      if (!zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
      if (!area.trim()) newErrors.area = 'Area is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep === 1) { setCurrentStep(2); return; }
    handleSubmit();
  };

  const handleBack = () => {
    if (currentStep === 1) navigation.goBack();
    else setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    setIsSubmitting(true);
    try {
      const plotData = {
        name: plotName.trim(),
        crop: selectedCrop,
        zip_code: zipCode.trim(),
        area: parseFloat(area) || 100,
        ph_level: parseFloat(phLevel) || 6.5,
        lat: parseFloat(latitude) || null,
        lon: parseFloat(longitude) || null,
        flex_type: crops.find(c => c.id === selectedCrop)?.name || 'Custom',
        planting_date: plantingDate || new Date().toISOString().split('T')[0],
        age_at_entry: parseFloat(ageAtEntry) || 0,
        custom_constraints: customConstraints.trim(),
      };
      const response = await addPlot(plotData);
      if (response.success) {
        Alert.alert('Plot Created', 'Your AI irrigation system is now active.', [
          { text: 'View Home', onPress: () => navigation.navigate('Home') },
        ]);
      } else {
        Alert.alert('Error', response.error || 'Failed to create plot.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = plotName.trim().length >= 2 && !!selectedCrop;
  const isStep2Valid = zipCode.trim().length > 0 && area.trim().length > 0;
  const canProceed = currentStep === 1 ? isStep1Valid : isStep2Valid;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {currentStep === 1 ? 'New Plot' : 'Location & Details'}
          </Text>
          <Text style={styles.headerSubtitle}>Step {currentStep} of 2</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress dots */}
      <View style={styles.progressRow}>
        {[1, 2].map(s => (
          <View
            key={s}
            style={[styles.progressDot, s === currentStep && styles.progressDotActive, s < currentStep && styles.progressDotDone]}
          />
        ))}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep === 1 ? (
            <>
              {/* Hero */}
              <View style={styles.hero}>
                <View style={styles.heroIcon}>
                  <Ionicons name="leaf" size={32} color="white" />
                </View>
                <Text style={styles.heroTitle}>What are you growing?</Text>
                <Text style={styles.heroSubtitle}>Name your plot and pick a crop — Miraqua handles the rest</Text>
              </View>

              {/* Plot name */}
              <View style={styles.section}>
                <Text style={styles.label}>Plot Name</Text>
                <TextInput
                  style={[styles.input, errors.plotName ? styles.inputError : null]}
                  placeholder="e.g., Backyard Tomatoes"
                  placeholderTextColor="#4B5563"
                  value={plotName}
                  onChangeText={t => { setPlotName(t); setErrors(p => ({ ...p, plotName: '' })); }}
                  maxLength={50}
                />
                {errors.plotName ? (
                  <Text style={styles.errorText}>{errors.plotName}</Text>
                ) : (
                  <Text style={styles.hint}>{plotName.length}/50</Text>
                )}
              </View>

              {/* Crop grid */}
              <View style={styles.section}>
                <Text style={styles.label}>Crop Type</Text>
                {errors.selectedCrop ? <Text style={styles.errorText}>{errors.selectedCrop}</Text> : null}
                <View style={styles.cropGrid}>
                  {crops.map(crop => {
                    const selected = selectedCrop === crop.id;
                    return (
                      <TouchableOpacity
                        key={crop.id}
                        style={[styles.cropCard, selected && styles.cropCardSelected]}
                        onPress={() => { setSelectedCrop(crop.id); setErrors(p => ({ ...p, selectedCrop: '' })); }}
                        activeOpacity={0.75}
                      >
                        {selected && (
                          <View style={styles.cropCheck}>
                            <Ionicons name="checkmark" size={10} color="white" />
                          </View>
                        )}
                        <Text style={styles.cropEmoji}>{crop.emoji}</Text>
                        <Text style={[styles.cropName, selected && styles.cropNameSelected]}>{crop.name}</Text>
                        <Text style={styles.cropFreq}>{crop.wateringFreq}</Text>
                        {crop.popular && (
                          <View style={styles.popularBadge}>
                            <Text style={styles.popularBadgeText}>Popular</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Hero */}
              <View style={styles.hero}>
                <View style={[styles.heroIcon, { backgroundColor: 'rgba(59,130,246,0.2)' }]}>
                  <Ionicons name="location" size={32} color="#60A5FA" />
                </View>
                <Text style={styles.heroTitle}>Location & Details</Text>
                <Text style={styles.heroSubtitle}>Used to pull weather data and calibrate your irrigation schedule</Text>
              </View>

              {/* Required */}
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Required</Text>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>ZIP Code</Text>
                  <TextInput
                    style={[styles.input, errors.zipCode ? styles.inputError : null]}
                    placeholder="e.g., 94103"
                    placeholderTextColor="#4B5563"
                    value={zipCode}
                    onChangeText={t => { setZipCode(t); setErrors(p => ({ ...p, zipCode: '' })); }}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                  {errors.zipCode ? <Text style={styles.errorText}>{errors.zipCode}</Text> : null}
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Plot Area (sq ft)</Text>
                  <TextInput
                    style={[styles.input, errors.area ? styles.inputError : null]}
                    placeholder="e.g., 100"
                    placeholderTextColor="#4B5563"
                    value={area}
                    onChangeText={t => { setArea(t); setErrors(p => ({ ...p, area: '' })); }}
                    keyboardType="numeric"
                  />
                  {errors.area ? <Text style={styles.errorText}>{errors.area}</Text> : null}
                </View>
              </View>

              {/* Optional */}
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Optional</Text>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Soil pH</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 6.5  (ideal: 6.0–7.0)"
                    placeholderTextColor="#4B5563"
                    value={phLevel}
                    onChangeText={setPhLevel}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Coordinates</Text>
                  <View style={styles.row}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="Latitude"
                      placeholderTextColor="#4B5563"
                      value={latitude}
                      onChangeText={setLatitude}
                      keyboardType="numeric"
                    />
                    <View style={{ width: 10 }} />
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="Longitude"
                      placeholderTextColor="#4B5563"
                      value={longitude}
                      onChangeText={setLongitude}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Planting Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#4B5563"
                    value={plantingDate}
                    onChangeText={setPlantingDate}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Special Requirements</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="e.g., shade-loving, container growing…"
                    placeholderTextColor="#4B5563"
                    value={customConstraints}
                    onChangeText={setCustomConstraints}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.ctaButton, !canProceed && styles.ctaButtonDisabled]}
          onPress={handleNext}
          disabled={!canProceed || isSubmitting}
          activeOpacity={0.85}
        >
          <Text style={[styles.ctaText, !canProceed && styles.ctaTextDisabled]}>
            {isSubmitting ? 'Creating…' : currentStep === 1 ? 'Continue' : 'Create Plot'}
          </Text>
          {!isSubmitting && (
            <Ionicons
              name={currentStep === 1 ? 'arrow-forward' : 'checkmark'}
              size={16}
              color={canProceed ? 'white' : '#4B5563'}
            />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  progressDotActive: {
    width: 24,
    backgroundColor: '#1aa179',
  },
  progressDotDone: {
    backgroundColor: '#1aa179',
    opacity: 0.5,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 28,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(26,161,121,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  section: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    color: 'white',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 5,
    textAlign: 'right',
  },
  errorText: {
    fontSize: 12,
    color: '#F87171',
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
  },
  cropGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  cropCard: {
    width: '30.5%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    alignItems: 'center',
    position: 'relative',
  },
  cropCardSelected: {
    backgroundColor: 'rgba(26,161,121,0.15)',
    borderColor: '#1aa179',
  },
  cropCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1aa179',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  cropName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 3,
  },
  cropNameSelected: {
    color: '#1aa179',
  },
  cropFreq: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  popularBadge: {
    marginTop: 5,
    backgroundColor: 'rgba(26,161,121,0.15)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(26,161,121,0.3)',
  },
  popularBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#1aa179',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 16,
    backgroundColor: 'rgba(17,24,39,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1aa179',
    borderRadius: 14,
    paddingVertical: 16,
  },
  ctaButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.2,
  },
  ctaTextDisabled: {
    color: '#4B5563',
  },
});

export default SetupPlotScreen;
