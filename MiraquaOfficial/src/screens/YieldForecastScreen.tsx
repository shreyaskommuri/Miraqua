import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface YieldForecast {
  id: string;
  cropName: string;
  plotId: string;
  plotName: string;
  currentStage: string;
  daysToHarvest: number;
  expectedYield: number;
  confidence: number;
  growthProgress: number;
  lastUpdated: string;
  factors: {
    weather: number;
    soil: number;
    water: number;
    nutrients: number;
  };
}

export default function YieldForecastScreen({ navigation }: any) {
  const [forecasts, setForecasts] = useState<YieldForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<YieldForecast | null>(null);

  useEffect(() => {
    fetchForecasts();
  }, []);

  const fetchForecasts = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setForecasts([
        {
          id: '1',
          cropName: 'Tomatoes',
          plotId: 'plot-1',
          plotName: 'Plot A',
          currentStage: 'Fruiting',
          daysToHarvest: 12,
          expectedYield: 45.2,
          confidence: 87,
          growthProgress: 78,
          lastUpdated: '2 hours ago',
          factors: {
            weather: 85,
            soil: 92,
            water: 88,
            nutrients: 76
          }
        },
        {
          id: '2',
          cropName: 'Lettuce',
          plotId: 'plot-2',
          plotName: 'Plot B',
          currentStage: 'Mature',
          daysToHarvest: 3,
          expectedYield: 12.8,
          confidence: 94,
          growthProgress: 95,
          lastUpdated: '1 hour ago',
          factors: {
            weather: 90,
            soil: 88,
            water: 85,
            nutrients: 92
          }
        },
        {
          id: '3',
          cropName: 'Peppers',
          plotId: 'plot-3',
          plotName: 'Plot C',
          currentStage: 'Flowering',
          daysToHarvest: 28,
          expectedYield: 18.5,
          confidence: 72,
          growthProgress: 45,
          lastUpdated: '4 hours ago',
          factors: {
            weather: 78,
            soil: 85,
            water: 82,
            nutrients: 70
          }
        }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load yield forecasts');
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return '#10B981';
    if (confidence >= 70) return '#F59E0B';
    return '#EF4444';
  };

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'mature': return '#10B981';
      case 'fruiting': return '#F59E0B';
      case 'flowering': return '#3B82F6';
      case 'vegetative': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const ForecastCard = ({ forecast }: { forecast: YieldForecast }) => (
    <TouchableOpacity 
      style={styles.forecastCard}
      onPress={() => setSelectedCrop(forecast)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cropInfo}>
          <View style={[styles.cropIcon, { backgroundColor: getStageColor(forecast.currentStage) + '20' }]}>
            <Ionicons name="leaf" size={20} color={getStageColor(forecast.currentStage)} />
          </View>
          <View style={styles.cropDetails}>
            <Text style={styles.cropName}>{forecast.cropName}</Text>
            <Text style={styles.plotName}>{forecast.plotName}</Text>
            <Text style={styles.lastUpdated}>{forecast.lastUpdated}</Text>
          </View>
        </View>
        <View style={styles.yieldInfo}>
          <Text style={styles.yieldValue}>{forecast.expectedYield.toFixed(1)}</Text>
          <Text style={styles.yieldUnit}>kg</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Growth Progress</Text>
          <Text style={styles.progressValue}>{forecast.growthProgress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${forecast.growthProgress}%`,
                backgroundColor: getStageColor(forecast.currentStage)
              }
            ]} 
          />
        </View>
      </View>

      <View style={styles.factorsGrid}>
        <View style={styles.factorItem}>
          <Ionicons name="sunny" size={16} color="#F59E0B" />
          <Text style={styles.factorLabel}>Weather</Text>
          <Text style={styles.factorValue}>{forecast.factors.weather}%</Text>
        </View>
        <View style={styles.factorItem}>
          <Ionicons name="earth" size={16} color="#8B5CF6" />
          <Text style={styles.factorLabel}>Soil</Text>
          <Text style={styles.factorValue}>{forecast.factors.soil}%</Text>
        </View>
        <View style={styles.factorItem}>
          <Ionicons name="water" size={16} color="#3B82F6" />
          <Text style={styles.factorLabel}>Water</Text>
          <Text style={styles.factorValue}>{forecast.factors.water}%</Text>
        </View>
        <View style={styles.factorItem}>
          <Ionicons name="nutrition" size={16} color="#10B981" />
          <Text style={styles.factorLabel}>Nutrients</Text>
          <Text style={styles.factorValue}>{forecast.factors.nutrients}%</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.stageBadge}>
          <Text style={[styles.stageText, { color: getStageColor(forecast.currentStage) }]}>
            {forecast.currentStage}
          </Text>
        </View>
        <View style={styles.harvestInfo}>
          <Ionicons name="calendar" size={14} color="#6B7280" />
          <Text style={styles.harvestText}>{forecast.daysToHarvest} days to harvest</Text>
        </View>
        <View style={styles.confidenceBadge}>
          <Text style={[styles.confidenceText, { color: getConfidenceColor(forecast.confidence) }]}>
            {forecast.confidence}% confidence
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const DetailModal = ({ forecast }: { forecast: YieldForecast }) => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Yield Forecast Details</Text>
          <TouchableOpacity onPress={() => setSelectedCrop(null)}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalBody}>
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Crop Information</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Crop:</Text>
              <Text style={styles.detailValue}>{forecast.cropName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>{forecast.plotName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Current Stage:</Text>
              <Text style={[styles.detailValue, { color: getStageColor(forecast.currentStage) }]}>
                {forecast.currentStage}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expected Yield:</Text>
              <Text style={styles.detailValue}>{forecast.expectedYield.toFixed(1)} kg</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Days to Harvest:</Text>
              <Text style={styles.detailValue}>{forecast.daysToHarvest} days</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Confidence:</Text>
              <Text style={[styles.detailValue, { color: getConfidenceColor(forecast.confidence) }]}>
                {forecast.confidence}%
              </Text>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Growth Factors</Text>
            <View style={styles.factorDetail}>
              <View style={styles.factorHeader}>
                <Ionicons name="sunny" size={20} color="#F59E0B" />
                <Text style={styles.factorTitle}>Weather Conditions</Text>
                <Text style={styles.factorScore}>{forecast.factors.weather}%</Text>
              </View>
              <View style={styles.factorBar}>
                <View style={[styles.factorFill, { width: `${forecast.factors.weather}%`, backgroundColor: '#F59E0B' }]} />
              </View>
            </View>
            <View style={styles.factorDetail}>
              <View style={styles.factorHeader}>
                <Ionicons name="earth" size={20} color="#8B5CF6" />
                <Text style={styles.factorTitle}>Soil Quality</Text>
                <Text style={styles.factorScore}>{forecast.factors.soil}%</Text>
              </View>
              <View style={styles.factorBar}>
                <View style={[styles.factorFill, { width: `${forecast.factors.soil}%`, backgroundColor: '#8B5CF6' }]} />
              </View>
            </View>
            <View style={styles.factorDetail}>
              <View style={styles.factorHeader}>
                <Ionicons name="water" size={20} color="#3B82F6" />
                <Text style={styles.factorTitle}>Water Management</Text>
                <Text style={styles.factorScore}>{forecast.factors.water}%</Text>
              </View>
              <View style={styles.factorBar}>
                <View style={[styles.factorFill, { width: `${forecast.factors.water}%`, backgroundColor: '#3B82F6' }]} />
              </View>
            </View>
            <View style={styles.factorDetail}>
              <View style={styles.factorHeader}>
                <Ionicons name="nutrition" size={20} color="#10B981" />
                <Text style={styles.factorTitle}>Nutrient Levels</Text>
                <Text style={styles.factorScore}>{forecast.factors.nutrients}%</Text>
              </View>
              <View style={styles.factorBar}>
                <View style={[styles.factorFill, { width: `${forecast.factors.nutrients}%`, backgroundColor: '#10B981' }]} />
              </View>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            <View style={styles.recommendationItem}>
              <Ionicons name="bulb" size={16} color="#10B981" />
              <Text style={styles.recommendationText}>
                Optimize watering schedule for current growth stage
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <Ionicons name="trending-up" size={16} color="#3B82F6" />
              <Text style={styles.recommendationText}>
                Monitor weather forecasts for optimal harvest timing
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <Ionicons name="analytics" size={16} color="#F59E0B" />
              <Text style={styles.recommendationText}>
                Consider additional fertilization to improve yield
              </Text>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('PlotDetails', { plot: { id: forecast.plotId, name: forecast.plotName } })}
            >
              <Ionicons name="eye" size={16} color="#3B82F6" />
              <Text style={styles.actionText}>View Plot</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.shareButton]}
              onPress={() => Alert.alert('Share', 'Share yield forecast')}
            >
              <Ionicons name="share" size={16} color="#10B981" />
              <Text style={styles.actionText}>Share Report</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yield Forecast</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={styles.loadingCard} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yield Forecast</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchForecasts}>
          <Ionicons name="refresh" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Stats */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Total Expected Yield</Text>
            <Text style={styles.summaryValue}>
              {forecasts.reduce((sum, f) => sum + f.expectedYield, 0).toFixed(1)} kg
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Average Confidence</Text>
            <Text style={styles.summaryValue}>
              {Math.round(forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length)}%
            </Text>
          </View>
        </View>

        {/* Forecasts List */}
        <View style={styles.forecastsSection}>
          <Text style={styles.sectionTitle}>Crop Forecasts</Text>
          {forecasts.map((forecast) => (
            <ForecastCard key={forecast.id} forecast={forecast} />
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Forecast Tips</Text>
          <View style={styles.tipItem}>
            <Ionicons name="trending-up" size={20} color="#10B981" />
            <Text style={styles.tipText}>Forecasts update automatically based on sensor data</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="calendar" size={20} color="#3B82F6" />
            <Text style={styles.tipText}>Plan harvest timing based on maturity predictions</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="analytics" size={20} color="#F59E0B" />
            <Text style={styles.tipText}>Monitor factor scores to optimize growing conditions</Text>
          </View>
        </View>
      </ScrollView>

      {/* Detail Modal */}
      {selectedCrop && <DetailModal forecast={selectedCrop} />}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  headerRight: {
    width: 36,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  forecastsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  forecastCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cropInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  cropIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cropDetails: {
    flex: 1,
  },
  cropName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  plotName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  yieldInfo: {
    alignItems: 'flex-end',
  },
  yieldValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
  },
  yieldUnit: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  factorsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  factorItem: {
    alignItems: 'center',
    flex: 1,
  },
  factorLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 2,
  },
  factorValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
  },
  stageText: {
    fontSize: 12,
    fontWeight: '500',
  },
  harvestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  harvestText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  factorDetail: {
    marginBottom: 16,
  },
  factorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  factorTitle: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  factorScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  factorBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  factorFill: {
    height: '100%',
    borderRadius: 3,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    flex: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 4,
  },
  shareButton: {
    backgroundColor: '#ECFDF5',
  },
  loadingContainer: {
    flex: 1,
    padding: 20,
  },
  loadingCard: {
    height: 200,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 16,
  },
}); 