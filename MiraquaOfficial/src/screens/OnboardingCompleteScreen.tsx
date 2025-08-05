import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface OnboardingCompleteScreenProps {
  navigation: any;
  route: any;
}

const OnboardingCompleteScreen = ({ navigation, route }: OnboardingCompleteScreenProps) => {
  const { plotName, selectedCrop, cropDetails, latitude, longitude, address } = route.params || {};

  const handleComplete = () => {
    // Navigate back to home with the new plot data
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Setup Complete!</Text>
          <Text style={styles.headerSubtitle}>Step 4 of 4</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Animation */}
        <View style={styles.successSection}>
          <View style={styles.successIcon}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.iconGradient}
            >
              <Ionicons name="checkmark" size={32} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.successTitle}>Your plot is ready!</Text>
          <Text style={styles.successDescription}>
            We've configured your smart irrigation system for optimal growth
          </Text>
        </View>

        {/* Plot Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Plot Summary</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Ionicons name="leaf" size={20} color="#10B981" />
              <Text style={styles.summaryLabel}>Plot Name</Text>
              <Text style={styles.summaryValue}>{plotName || 'My Garden'}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryEmoji}>{cropDetails?.emoji || '🌱'}</Text>
              <Text style={styles.summaryLabel}>Crop Type</Text>
              <Text style={styles.summaryValue}>{cropDetails?.name || selectedCrop || 'Mixed Vegetables'}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Ionicons name="location" size={20} color="#3B82F6" />
              <Text style={styles.summaryLabel}>Location</Text>
              <Text style={styles.summaryValue}>{address || `${latitude}, ${longitude}`}</Text>
            </View>
          </View>
        </View>

        {/* Smart Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Smart Features Enabled</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="water" size={20} color="#3B82F6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Automated Watering</Text>
                <Text style={styles.featureDescription}>
                  Smart irrigation based on weather, soil moisture, and crop needs
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="sunny" size={20} color="#F59E0B" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Weather Integration</Text>
                <Text style={styles.featureDescription}>
                  Real-time weather data for optimal growing conditions
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="analytics" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Growth Analytics</Text>
                <Text style={styles.featureDescription}>
                  Track progress and get insights for better yields
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.nextStepsSection}>
          <Text style={styles.sectionTitle}>What's Next?</Text>
          
          <View style={styles.nextStepsList}>
            <View style={styles.nextStepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.nextStepText}>Monitor your plot's health and moisture levels</Text>
            </View>
            
            <View style={styles.nextStepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.nextStepText}>Receive notifications for watering schedules</Text>
            </View>
            
            <View style={styles.nextStepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.nextStepText}>Track growth progress and harvest predictions</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Complete Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
        >
          <Text style={styles.completeButtonText}>
            Start Growing!
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={16} 
            color="white" 
            style={styles.completeButtonIcon}
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
  successSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  successIcon: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  summarySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    marginLeft: 12,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  nextStepsSection: {
    marginBottom: 24,
  },
  nextStepsList: {
    gap: 12,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  nextStepText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  bottomContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButtonIcon: {
    marginLeft: 8,
  },
});

export default OnboardingCompleteScreen; 