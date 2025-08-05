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

interface SetupPlotScreenProps {
  navigation: any;
}

const SetupPlotScreen = ({ navigation }: SetupPlotScreenProps) => {
  const [plotName, setPlotName] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const crops = [
    { 
      id: "tomatoes", 
      name: "Tomatoes", 
      emoji: "🍅", 
      season: "Spring/Summer", 
      difficulty: "Beginner",
      wateringFreq: "Daily",
      benefits: "High yield, easy to grow",
      popular: true
    },
    { 
      id: "herbs", 
      name: "Herbs", 
      emoji: "🌿", 
      season: "Year-round", 
      difficulty: "Beginner",
      wateringFreq: "Every 2-3 days",
      benefits: "Continuous harvest, aromatic",
      popular: true
    },
    { 
      id: "strawberries", 
      name: "Strawberries", 
      emoji: "🍓", 
      season: "Spring/Summer", 
      difficulty: "Intermediate",
      wateringFreq: "Daily",
      benefits: "Perennial, sweet fruit",
      popular: true
    },
    { 
      id: "lettuce", 
      name: "Lettuce", 
      emoji: "🥬", 
      season: "Spring/Fall", 
      difficulty: "Beginner",
      wateringFreq: "Every 2 days",
      benefits: "Fast growing, low maintenance"
    },
    { 
      id: "carrots", 
      name: "Carrots", 
      emoji: "🥕", 
      season: "Spring/Fall", 
      difficulty: "Beginner",
      wateringFreq: "Every 2 days",
      benefits: "Root vegetable, stores well"
    },
    { 
      id: "peppers", 
      name: "Peppers", 
      emoji: "🌶️", 
      season: "Summer", 
      difficulty: "Intermediate",
      wateringFreq: "Daily",
      benefits: "Heat-loving, colorful varieties"
    },
    { 
      id: "broccoli", 
      name: "Broccoli", 
      emoji: "🥦", 
      season: "Spring/Fall", 
      difficulty: "Intermediate",
      wateringFreq: "Daily",
      benefits: "Nutritious, cool-weather crop"
    },
    { 
      id: "beans", 
      name: "Beans", 
      emoji: "🫘", 
      season: "Spring/Summer", 
      difficulty: "Beginner",
      wateringFreq: "Every 2 days",
      benefits: "Nitrogen-fixing, protein-rich"
    },
    { 
      id: "custom", 
      name: "Other/Custom", 
      emoji: "✨", 
      season: "Variable", 
      difficulty: "Variable",
      wateringFreq: "Custom",
      benefits: "Tailored to your needs"
    }
  ];

  // Filter crops based on search
  const filteredCrops = crops.filter(crop => 
    crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crop.difficulty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crop.season.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Popular crops for recommendations
  const popularCrops = crops.filter(crop => crop.popular);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!plotName.trim()) {
      newErrors.plotName = "Plot name is required";
    } else if (plotName.length < 2) {
      newErrors.plotName = "Plot name must be at least 2 characters";
    }
    
    if (!selectedCrop) {
      newErrors.selectedCrop = "Please select a crop type";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateForm()) return;

    const cropDetails = crops.find(crop => crop.id === selectedCrop);
    navigation.navigate('OnboardingLocation', {
      plotName: plotName.trim(),
      selectedCrop,
      cropDetails
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const isFormValid = plotName.trim().length >= 2 && selectedCrop;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Setup Your Plot</Text>
          <Text style={styles.headerSubtitle}>Step 1 of 4</Text>
        </View>
        
        <View style={styles.headerRight} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '25%' }]} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introSection}>
          <View style={styles.introIcon}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.iconGradient}
            >
              <Ionicons name="leaf" size={32} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.introTitle}>Let's set up your garden plot</Text>
          <Text style={styles.introDescription}>
            Give your plot a name and choose what you're growing for personalized care
          </Text>
        </View>

        {/* Popular for beginners */}
        {!selectedCrop && (
          <View style={styles.popularSection}>
            <View style={styles.popularHeader}>
              <Ionicons name="sparkles" size={20} color="#10B981" />
              <Text style={styles.popularTitle}>Popular for beginners</Text>
            </View>
            <View style={styles.popularCrops}>
              {popularCrops.map((crop) => (
                <TouchableOpacity
                  key={crop.id}
                  style={styles.popularCropButton}
                  onPress={() => setSelectedCrop(crop.id)}
                >
                  <Text style={styles.popularCropEmoji}>{crop.emoji}</Text>
                  <Text style={styles.popularCropName}>{crop.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Plot Name */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Plot Name</Text>
          <Text style={styles.inputDescription}>Give your plot a memorable name</Text>
          <TextInput
            style={[styles.textInput, errors.plotName ? styles.inputError : null]}
            placeholder="e.g., Backyard Garden, Herb Corner"
            placeholderTextColor="#9CA3AF"
            value={plotName}
            onChangeText={(text) => {
              setPlotName(text);
              if (errors.plotName) {
                setErrors(prev => ({ ...prev, plotName: '' }));
              }
            }}
            maxLength={50}
          />
          {errors.plotName && (
            <Text style={styles.errorText}>{errors.plotName}</Text>
          )}
          <Text style={styles.characterCount}>{plotName.length}/50 characters</Text>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search crops (e.g., tomatoes, beginner, summer)..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Crop Selection */}
        <View style={styles.cropsSection}>
          <Text style={styles.sectionTitle}>Choose your crop</Text>
          <Text style={styles.sectionSubtitle}>
            {filteredCrops.length} crop{filteredCrops.length !== 1 ? 's' : ''} available
          </Text>
          
          <View style={styles.cropsGrid}>
            {filteredCrops.map((crop) => (
              <TouchableOpacity
                key={crop.id}
                style={[
                  styles.cropGridCard,
                  selectedCrop === crop.id && styles.cropGridCardSelected
                ]}
                onPress={() => setSelectedCrop(crop.id)}
              >
                <View style={styles.cropGridHeader}>
                  <Text style={styles.cropGridEmoji}>{crop.emoji}</Text>
                  <View style={styles.cropGridTitleContainer}>
                    <Text style={styles.cropGridTitle}>{crop.name}</Text>
                    {crop.popular && (
                      <View style={styles.popularBadgeSmall}>
                        <Text style={styles.popularBadgeText}>Popular</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <View style={styles.cropGridBadges}>
                  <View style={[
                    styles.cropGridBadge,
                    crop.difficulty === 'Beginner' ? styles.beginnerBadge : styles.intermediateBadge
                  ]}>
                    <Text style={styles.cropBadgeText}>{crop.difficulty}</Text>
                  </View>
                  <View style={styles.cropGridBadge}>
                    <Ionicons name="time" size={12} color="#3B82F6" />
                    <Text style={[styles.cropBadgeText, { color: '#3B82F6' }]}>{crop.season}</Text>
                  </View>
                  <View style={styles.cropGridBadge}>
                    <Ionicons name="water" size={12} color="#06B6D4" />
                    <Text style={[styles.cropBadgeText, { color: '#06B6D4' }]}>{crop.wateringFreq}</Text>
                  </View>
                </View>
                
                <Text style={styles.cropBenefits}>{crop.benefits}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            isFormValid ? styles.nextButtonActive : styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!isFormValid}
        >
          <Text style={[
            styles.nextButtonText,
            isFormValid ? styles.nextButtonTextActive : styles.nextButtonTextDisabled
          ]}>
            Next: Choose Location
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={16} 
            color={isFormValid ? "white" : "#9CA3AF"} 
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
  popularSection: {
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
  popularHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  popularTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  popularCrops: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularCropButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  popularCropEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  popularCropName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
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
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  inputDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
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
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  searchSection: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  cropsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  cropsList: {
    gap: 12,
  },
  cropCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cropCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
    shadowColor: '#10B981',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cropCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cropEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  cropDetails: {
    flex: 1,
  },
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cropName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  popularBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  popularBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
  },
  cropBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  cropBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  beginnerBadge: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  intermediateBadge: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  cropBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 4,
  },
  cropBenefits: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
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
  cropsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  cropGridCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 12,
  },
  cropGridCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
    shadowColor: '#10B981',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cropGridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cropGridEmoji: {
    fontSize: 28,
    marginRight: 8,
  },
  cropGridTitleContainer: {
    flex: 1,
  },
  cropGridTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  popularBadgeSmall: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
    alignSelf: 'flex-start',
  },
  cropGridBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  cropGridBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cropGridBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 2,
  },
  cropGridDescription: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 14,
  },
});

export default SetupPlotScreen; 