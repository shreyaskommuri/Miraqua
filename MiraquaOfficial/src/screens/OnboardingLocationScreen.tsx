import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface OnboardingLocationScreenProps {
  navigation: any;
  route: any;
}

const OnboardingLocationScreen = ({ navigation, route }: OnboardingLocationScreenProps) => {
  const { plotName, selectedCrop, cropDetails } = route.params || {};
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUseMyLocation = async () => {
    setIsLoading(true);
    // Simulate getting location
    setTimeout(() => {
      setLatitude('37.7749');
      setLongitude('-122.4194');
      setAddress('San Francisco, CA');
      setIsLoading(false);
    }, 1000);
  };

  const handleNext = () => {
    if (!latitude || !longitude) {
      Alert.alert('Error', 'Please enter valid coordinates or use your current location');
      return;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      Alert.alert('Error', 'Please enter valid coordinates');
      return;
    }

    navigation.navigate('OnboardingComplete', {
      plotName,
      selectedCrop,
      cropDetails,
      latitude: lat,
      longitude: lon,
      address
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const isValid = latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Choose Location</Text>
          <Text style={styles.headerSubtitle}>Step 2 of 4</Text>
        </View>
        
        <View style={styles.headerRight} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introSection}>
          <View style={styles.introIcon}>
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8']}
              style={styles.iconGradient}
            >
              <Ionicons name="location" size={32} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.introTitle}>Where's your garden?</Text>
          <Text style={styles.introDescription}>
            Help us provide accurate weather data and growing recommendations for your location
          </Text>
        </View>

        {/* Current Location Button */}
        <View style={styles.locationSection}>
          <TouchableOpacity
            style={styles.useLocationButton}
            onPress={handleUseMyLocation}
            disabled={isLoading}
          >
            <Ionicons name="location" size={20} color="white" />
            <Text style={styles.useLocationText}>
              {isLoading ? 'Getting location...' : 'Use my current location'}
            </Text>
            {isLoading && (
              <View style={styles.loadingSpinner}>
                <Ionicons name="refresh" size={16} color="white" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Manual Input */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Or enter coordinates manually</Text>
          
          <View style={styles.coordinatesContainer}>
            <View style={styles.coordinateInput}>
              <Text style={styles.inputLabel}>Latitude</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 37.7749"
                placeholderTextColor="#9CA3AF"
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.coordinateInput}>
              <Text style={styles.inputLabel}>Longitude</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., -122.4194"
                placeholderTextColor="#9CA3AF"
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.addressContainer}>
            <Text style={styles.inputLabel}>Address (optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., San Francisco, CA"
              placeholderTextColor="#9CA3AF"
              value={address}
              onChangeText={setAddress}
            />
          </View>
        </View>

        {/* Location Preview */}
        {isValid && (
          <View style={styles.previewSection}>
            <View style={styles.previewHeader}>
              <Ionicons name="sparkles" size={20} color="#10B981" />
              <Text style={styles.previewTitle}>Location Preview</Text>
            </View>
            
            <View style={styles.previewCard}>
              <View style={styles.previewItem}>
                <Ionicons name="sunny" size={16} color="#F59E0B" />
                <Text style={styles.previewLabel}>Climate Zone</Text>
                <Text style={styles.previewValue}>Temperate</Text>
              </View>
              
              <View style={styles.previewItem}>
                <Ionicons name="water" size={16} color="#3B82F6" />
                <Text style={styles.previewLabel}>Growing Season</Text>
                <Text style={styles.previewValue}>Spring-Fall</Text>
              </View>
              
              <View style={styles.previewItem}>
                <Ionicons name="thermometer" size={16} color="#EF4444" />
                <Text style={styles.previewLabel}>Avg Temperature</Text>
                <Text style={styles.previewValue}>50-70°F</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Next Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            isValid ? styles.nextButtonActive : styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!isValid}
        >
          <Text style={[
            styles.nextButtonText,
            isValid ? styles.nextButtonTextActive : styles.nextButtonTextDisabled
          ]}>
            Next: Complete Setup
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={16} 
            color={isValid ? "white" : "#9CA3AF"} 
            style={styles.nextButtonIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  introSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  introIcon: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  introDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  locationSection: {
    marginBottom: 24,
  },
  useLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  useLocationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingSpinner: {
    marginLeft: 8,
  },
  inputSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  coordinateInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: 'white',
  },
  addressContainer: {
    marginTop: 8,
  },
  previewSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  previewCard: {
    gap: 12,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  previewLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    marginLeft: 8,
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  bottomContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  nextButtonActive: {
    backgroundColor: '#10B981',
  },
  nextButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  nextButtonTextActive: {
    color: 'white',
  },
  nextButtonTextDisabled: {
    color: '#9CA3AF',
  },
  nextButtonIcon: {
    marginLeft: 8,
  },
});

export default OnboardingLocationScreen; 