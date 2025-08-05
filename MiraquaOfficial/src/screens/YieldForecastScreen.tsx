import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SidebarNavigation from './SidebarNavigation';

interface YieldData {
  crop: string;
  currentYield: number;
  predictedYield: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

const { width } = Dimensions.get('window');

export default function YieldForecastScreen({ navigation }: any) {
  const [isLoading, setIsLoading] = useState(true);
  const [yieldData, setYieldData] = useState<YieldData[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    fetchYieldData();
  }, []);

  const fetchYieldData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setYieldData([
        {
          crop: 'Tomatoes',
          currentYield: 45.2,
          predictedYield: 48.5,
          confidence: 87,
          factors: ['Weather: 85%', 'Soil: 92%', 'Water: 88%', 'Nutrients: 76%'],
          recommendations: ['Optimize watering schedule', 'Monitor weather forecasts', 'Consider additional fertilization']
        },
        {
          crop: 'Lettuce',
          currentYield: 12.8,
          predictedYield: 13.5,
          confidence: 94,
          factors: ['Weather: 90%', 'Soil: 88%', 'Water: 85%', 'Nutrients: 92%'],
          recommendations: ['Monitor weather forecasts', 'Plan harvest timing', 'Optimize watering schedule']
        },
        {
          crop: 'Peppers',
          currentYield: 18.5,
          predictedYield: 19.0,
          confidence: 72,
          factors: ['Weather: 78%', 'Soil: 85%', 'Water: 82%', 'Nutrients: 70%'],
          recommendations: ['Monitor weather forecasts', 'Plan harvest timing', 'Optimize watering schedule']
        }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load yield data');
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

  const YieldCard = ({ data }: { data: YieldData }) => (
    <TouchableOpacity 
      style={styles.yieldCard}
      onPress={() => setSelectedCrop(data.crop)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cropInfo}>
          <View style={[styles.cropIcon, { backgroundColor: getStageColor(data.crop) + '20' }]}>
            <Ionicons name="leaf" size={20} color={getStageColor(data.crop)} />
          </View>
          <View style={styles.cropDetails}>
            <Text style={styles.cropName}>{data.crop}</Text>
            <Text style={styles.currentYield}>Current Yield: {data.currentYield.toFixed(1)} kg</Text>
            <Text style={styles.predictedYield}>Predicted Yield: {data.predictedYield.toFixed(1)} kg</Text>
          </View>
        </View>
        <View style={styles.yieldInfo}>
          <Text style={styles.yieldValue}>{data.predictedYield.toFixed(1)}</Text>
          <Text style={styles.yieldUnit}>kg</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Confidence</Text>
          <Text style={styles.progressValue}>{data.confidence}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${data.confidence}%`,
                backgroundColor: getConfidenceColor(data.confidence)
              }
            ]} 
          />
        </View>
      </View>

      <View style={styles.factorsGrid}>
        {data.factors.map((factor, index) => (
          <View key={index} style={styles.factorItem}>
            <Ionicons name="sunny" size={16} color="#F59E0B" />
            <Text style={styles.factorLabel}>{factor}</Text>
          </View>
        ))}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.recommendationsSection}>
          <Text style={styles.recommendationsTitle}>Recommendations</Text>
          {data.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Ionicons name="bulb" size={16} color="#10B981" />
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const DetailModal = ({ data }: { data: YieldData }) => (
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
              <Text style={styles.detailValue}>{data.crop}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Current Yield:</Text>
              <Text style={styles.detailValue}>{data.currentYield.toFixed(1)} kg</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Predicted Yield:</Text>
              <Text style={styles.detailValue}>{data.predictedYield.toFixed(1)} kg</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Confidence:</Text>
              <Text style={[styles.detailValue, { color: getConfidenceColor(data.confidence) }]}>
                {data.confidence}%
              </Text>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Growth Factors</Text>
            {data.factors.map((factor, index) => (
              <View key={index} style={styles.factorDetail}>
                <View style={styles.factorHeader}>
                  <Ionicons name="sunny" size={20} color="#F59E0B" />
                  <Text style={styles.factorTitle}>{factor}</Text>
                </View>
                <View style={styles.factorBar}>
                  <View style={[styles.factorFill, { width: '100%', backgroundColor: '#F59E0B' }]} />
                </View>
              </View>
            ))}
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {data.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Ionicons name="bulb" size={16} color="#10B981" />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('PlotDetails', { plot: { id: 'plot-1', name: data.crop } })}
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
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowSidebar(true)} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="leaf" size={20} color="white" />
          </View>
          <Text style={styles.logoText}>Miraqua</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchYieldData}>
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Section */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Total Predicted Yield</Text>
            <Text style={styles.summaryValue}>
              {yieldData.reduce((sum, d) => sum + d.predictedYield, 0).toFixed(1)} kg
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Average Confidence</Text>
            <Text style={styles.summaryValue}>
              {Math.round(yieldData.reduce((sum, d) => sum + d.confidence, 0) / yieldData.length)}%
            </Text>
          </View>
        </View>

        {/* Yields List */}
        <View style={styles.yieldsSection}>
          <Text style={styles.sectionTitle}>Crop Forecasts</Text>
          {yieldData.map((data, index) => (
            <YieldCard key={index} data={data} />
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Forecasting Tips</Text>
          <View style={styles.tipItem}>
            <Ionicons name="trending-up" size={20} color="#10B981" />
            <Text style={styles.tipText}>Monitor weather patterns for accurate predictions</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="water" size={20} color="#3B82F6" />
            <Text style={styles.tipText}>Optimize irrigation based on growth stage</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="nutrition" size={20} color="#F59E0B" />
            <Text style={styles.tipText}>Maintain soil fertility for maximum yield</Text>
          </View>
        </View>
      </ScrollView>

      {/* Detail Modal */}
      {selectedCrop && yieldData.find(d => d.crop === selectedCrop) && <DetailModal data={yieldData.find(d => d.crop === selectedCrop)!} />}

      {/* Sidebar Navigation */}
      <SidebarNavigation
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        navigation={navigation}
        currentRoute="YieldForecast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#111827',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  summarySection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  yieldsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  yieldCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    color: 'white',
    marginBottom: 4,
  },
  currentYield: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  predictedYield: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
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
    color: 'rgba(255, 255, 255, 0.7)',
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
    color: 'rgba(255, 255, 255, 0.7)',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    textAlign: 'center',
  },
  factorValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  cardFooter: {
    marginTop: 16,
  },
  recommendationsSection: {
    marginTop: 16,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  tipsSection: {
    marginBottom: 24,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: 'white',
    marginLeft: 12,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
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
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: 'white',
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
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  factorScore: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  factorBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  factorFill: {
    height: '100%',
    borderRadius: 3,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flex: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 4,
  },
  shareButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  loadingContainer: {
    flex: 1,
    padding: 20,
  },
  loadingCard: {
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
  },
  menuButton: {
    padding: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
}); 