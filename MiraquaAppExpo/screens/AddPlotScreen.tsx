// screens/AddPlotScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Step1BasicInfo from './Step1BasicInfo';
import Step2Details from './Step2Details';
import Step3Location from './Step3Location';
import Step4Review from './Step4Review';
import ProgressHeader from './ProgressHeader';
import { addPlot } from '../api/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../utils/supabase';

const TOTAL_STEPS = 4;

const initialFormData = {
  name: '',
  crop: '',
  area: '',
  flexType: 'daily' as 'daily' | 'monthly',
  lat: null as number | null,
  lon: null as number | null,
  zip: '',
};

const AddPlotScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);

  // ✅ Only reset if truly returning to the start
  useFocusEffect(
    useCallback(() => {
      if (step === 0) {
        setStep(0);
        setFormData(initialFormData);
      }
    }, [step])
  );

  const handleNext = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
  };

  const handleBack = (updates?: Partial<typeof formData>) => {
    if (updates) setFormData((prev) => ({ ...prev, ...updates }));
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    const { data: userData, error } = await supabase.auth.getUser();
    if (error || !userData?.user?.id) {
      Alert.alert('Authentication Error', 'Please sign in again.');
      return;
    }

    const { name, crop, area, flexType, lat, lon, zip } = formData;

    if (!name || !crop || !area || !lat || !lon || !zip) {
      Alert.alert('Missing Info', 'Please complete all fields before submitting.');
      return;
    }

    const payload = {
      user_id: userData.user.id,
      name: name.trim(),
      crop: crop.trim(),
      area: parseFloat(area),
      flex_type: flexType,
      lat,
      lon,
      zip_code: zip,
    };

    try {
      const res = await addPlot(payload);

      if (res && !res.error) {
        Alert.alert('✅ Plot Added', 'Your plot was successfully added.');

        // ✅ Reset onboarding state immediately
        setStep(0);
        setFormData(initialFormData);

        // Optional: slight delay before leaving
        setTimeout(() => {
          navigation.navigate('Home');
        }, 250);
      } else {
        throw new Error(res.message || 'Failed to add plot.');
      }
    } catch (err: any) {
      Alert.alert('❌ Error', err.message || 'Something went wrong.');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <Step1BasicInfo data={formData} onNext={handleNext} />;
      case 1:
        return <Step2Details data={formData} onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <Step3Location data={formData} onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <Step4Review data={formData} onBack={handleBack} onSubmit={handleSubmit} />;
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <ProgressHeader step={step + 1} total={TOTAL_STEPS} />
        {renderStep()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddPlotScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#fff',
  },
});
