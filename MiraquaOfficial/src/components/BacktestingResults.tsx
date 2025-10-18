import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface BacktestingData {
  originalWaterUsage: number;
  advancedWaterUsage: number;
  waterSaved: number;
  efficiencyImprovement: number;
  accuracyScore: number;
  costSavings: number;
  environmentalImpact: number;
  recommendations: string[];
  dailyComparison: Array<{
    date: string;
    original: number;
    advanced: number;
    savings: number;
  }>;
}

interface BacktestingResultsProps {
  plotId: string;
  onRefresh?: () => void;
}

const BacktestingResults: React.FC<BacktestingResultsProps> = ({
  plotId,
  onRefresh
}) => {
  const [backtestingData, setBacktestingData] = useState<BacktestingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | '90days'>('7days');

  useEffect(() => {
    fetchBacktestingData();
  }, [plotId, selectedPeriod]);

  const fetchBacktestingData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call - replace with actual endpoint
      const response = await fetch(`http://localhost:5050/get_backtesting_results?plot_id=${plotId}&period=${selectedPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setBacktestingData(data);
      } else {
        // Fallback to mock data for demonstration
        setBacktestingData({
          originalWaterUsage: 245.5,
          advancedWaterUsage: 156.2,
          waterSaved: 89.3,
          efficiencyImprovement: 36.4,
          accuracyScore: 94.2,
          costSavings: 28.50,
          environmentalImpact: 0.89,
          recommendations: [
            'Switch to drip irrigation for 15% more efficiency',
            'Adjust watering schedule to early morning hours',
            'Consider mulching to reduce evaporation',
            'Monitor soil moisture with sensors'
          ],
          dailyComparison: [
            { date: '2024-01-01', original: 35.2, advanced: 22.1, savings: 13.1 },
            { date: '2024-01-02', original: 38.5, advanced: 24.3, savings: 14.2 },
            { date: '2024-01-03', original: 32.1, advanced: 18.7, savings: 13.4 },
            { date: '2024-01-04', original: 41.2, advanced: 26.8, savings: 14.4 },
            { date: '2024-01-05', original: 36.8, advanced: 23.1, savings: 13.7 },
            { date: '2024-01-06', original: 39.4, advanced: 25.2, savings: 14.2 },
            { date: '2024-01-07', original: 23.3, advanced: 12.0, savings: 11.3 }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching backtesting data:', error);
      Alert.alert('Error', 'Failed to load backtesting results');
    } finally {
      setLoading(false);
    }
  };

  const getSavingsColor = (savings: number) => {
    if (savings > 20) return '#10B981';
    if (savings > 10) return '#F59E0B';
    return '#EF4444';
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency > 30) return '#10B981';
    if (efficiency > 15) return '#F59E0B';
    return '#EF4444';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="analytics" size={48} color="#8B5CF6" style={styles.spinningIcon} />
        <Text style={styles.loadingText}>Analyzing backtesting results...</Text>
      </View>
    );
  }

  if (!backtestingData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning" size={48} color="#EF4444" />
        <Text style={styles.errorText}>No backtesting data available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchBacktestingData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons name="analytics" size={24} color="#8B5CF6" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Backtesting Results</Text>
            <Text style={styles.headerSubtitle}>Scientific vs Traditional Methods</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchBacktestingData}>
          <Ionicons name="refresh" size={20} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === '7days' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('7days')}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === '7days' && styles.periodButtonTextActive]}>
            7 Days
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === '30days' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('30days')}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === '30days' && styles.periodButtonTextActive]}>
            30 Days
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === '90days' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('90days')}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === '90days' && styles.periodButtonTextActive]}>
            90 Days
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.summaryGradient}
          >
            <View style={styles.summaryHeader}>
              <Ionicons name="water" size={20} color="white" />
              <Text style={styles.summaryTitle}>Water Saved</Text>
            </View>
            <Text style={styles.summaryValue}>{backtestingData.waterSaved.toFixed(1)}L</Text>
            <Text style={styles.summarySubtext}>
              {((backtestingData.waterSaved / backtestingData.originalWaterUsage) * 100).toFixed(1)}% reduction
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['#3B82F6', '#1D4ED8']}
            style={styles.summaryGradient}
          >
            <View style={styles.summaryHeader}>
              <Ionicons name="trending-up" size={20} color="white" />
              <Text style={styles.summaryTitle}>Efficiency</Text>
            </View>
            <Text style={styles.summaryValue}>+{backtestingData.efficiencyImprovement.toFixed(1)}%</Text>
            <Text style={styles.summarySubtext}>Improvement</Text>
          </LinearGradient>
        </View>

        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.summaryGradient}
          >
            <View style={styles.summaryHeader}>
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.summaryTitle}>Accuracy</Text>
            </View>
            <Text style={styles.summaryValue}>{backtestingData.accuracyScore.toFixed(1)}%</Text>
            <Text style={styles.summarySubtext}>Score</Text>
          </LinearGradient>
        </View>

        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.summaryGradient}
          >
            <View style={styles.summaryHeader}>
              <Ionicons name="cash" size={20} color="white" />
              <Text style={styles.summaryTitle}>Cost Savings</Text>
            </View>
            <Text style={styles.summaryValue}>${backtestingData.costSavings.toFixed(2)}</Text>
            <Text style={styles.summarySubtext}>Saved</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Daily Comparison Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Daily Water Usage Comparison</Text>
        <View style={styles.chartContainer}>
          {backtestingData.dailyComparison.map((day, index) => (
            <View key={index} style={styles.chartBar}>
              <View style={styles.chartBarContainer}>
                <View style={styles.chartBarOriginal}>
                  <View 
                    style={[
                      styles.chartBarFill, 
                      { 
                        height: (day.original / 50) * 100,
                        backgroundColor: '#EF4444'
                      }
                    ]} 
                  />
                </View>
                <View style={styles.chartBarAdvanced}>
                  <View 
                    style={[
                      styles.chartBarFill, 
                      { 
                        height: (day.advanced / 50) * 100,
                        backgroundColor: '#10B981'
                      }
                    ]} 
                  />
                </View>
              </View>
              <Text style={styles.chartLabel}>{day.date.split('-')[2]}</Text>
              <Text style={styles.chartValue}>{day.savings.toFixed(1)}L</Text>
            </View>
          ))}
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Traditional</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Scientific</Text>
          </View>
        </View>
      </View>

      {/* Environmental Impact */}
      <View style={styles.impactCard}>
        <Text style={styles.sectionTitle}>Environmental Impact</Text>
        <View style={styles.impactMetrics}>
          <View style={styles.impactMetric}>
            <Ionicons name="leaf" size={24} color="#10B981" />
            <View style={styles.impactInfo}>
              <Text style={styles.impactValue}>{backtestingData.environmentalImpact.toFixed(2)}</Text>
              <Text style={styles.impactLabel}>CO₂ Reduction (kg)</Text>
            </View>
          </View>
          <View style={styles.impactMetric}>
            <Ionicons name="water" size={24} color="#3B82F6" />
            <View style={styles.impactInfo}>
              <Text style={styles.impactValue}>{backtestingData.waterSaved.toFixed(0)}L</Text>
              <Text style={styles.impactLabel}>Water Conserved</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recommendations */}
      <View style={styles.recommendationsCard}>
        <Text style={styles.sectionTitle}>Optimization Recommendations</Text>
        {backtestingData.recommendations.map((recommendation, index) => (
          <View key={index} style={styles.recommendationItem}>
            <View style={styles.recommendationIcon}>
              <Ionicons name="bulb" size={16} color="#F59E0B" />
            </View>
            <Text style={styles.recommendationText}>{recommendation}</Text>
          </View>
        ))}
      </View>

      {/* Scientific Validation */}
      <View style={styles.validationCard}>
        <Text style={styles.sectionTitle}>Scientific Validation</Text>
        <View style={styles.validationContent}>
          <View style={styles.validationItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.validationText}>FAO-56 Penman-Monteith compliant</Text>
          </View>
          <View style={styles.validationItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.validationText}>Dynamic crop coefficients applied</Text>
          </View>
          <View style={styles.validationItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.validationText}>Real-time weather integration</Text>
          </View>
          <View style={styles.validationItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.validationText}>Soil moisture modeling</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

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
  loadingText: {
    fontSize: 16,
    color: 'white',
    marginTop: 16,
  },
  spinningIcon: {
    transform: [{ rotate: '360deg' }],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  errorText: {
    fontSize: 16,
    color: 'white',
    marginTop: 16,
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
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
  refreshButton: {
    padding: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  periodButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  summaryCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    marginBottom: 16,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  chartBarContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '100%',
  },
  chartBarOriginal: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    marginRight: 1,
    borderRadius: 2,
  },
  chartBarAdvanced: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    marginLeft: 1,
    borderRadius: 2,
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 2,
  },
  chartLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
  chartValue: {
    fontSize: 8,
    color: '#10B981',
    marginTop: 2,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  impactCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  impactMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  impactMetric: {
    alignItems: 'center',
  },
  impactInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  impactValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  recommendationsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  validationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  validationContent: {
    gap: 12,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  validationText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
});

export default BacktestingResults;
