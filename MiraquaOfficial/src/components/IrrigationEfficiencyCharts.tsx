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

interface EfficiencyData {
  waterUsage: {
    traditional: number[];
    scientific: number[];
    dates: string[];
  };
  costAnalysis: {
    traditional: number;
    scientific: number;
    savings: number;
  };
  environmentalImpact: {
    co2Reduction: number;
    waterConserved: number;
    energySaved: number;
  };
  cropYield: {
    traditional: number;
    scientific: number;
    improvement: number;
  };
  soilHealth: {
    traditional: number;
    scientific: number;
    improvement: number;
  };
}

interface IrrigationEfficiencyChartsProps {
  plotId: string;
  onRefresh?: () => void;
}

const IrrigationEfficiencyCharts: React.FC<IrrigationEfficiencyChartsProps> = ({
  plotId,
  onRefresh
}) => {
  const [efficiencyData, setEfficiencyData] = useState<EfficiencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState<'water' | 'cost' | 'environment' | 'yield'>('water');

  useEffect(() => {
    fetchEfficiencyData();
  }, [plotId]);

  const fetchEfficiencyData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call - replace with actual endpoint
      const response = await fetch(`http://localhost:5050/get_efficiency_analysis?plot_id=${plotId}`);
      if (response.ok) {
        const data = await response.json();
        setEfficiencyData(data);
      } else {
        // Fallback to mock data for demonstration
        setEfficiencyData({
          waterUsage: {
            traditional: [35.2, 38.5, 32.1, 41.2, 36.8, 39.4, 23.3],
            scientific: [22.1, 24.3, 18.7, 26.8, 23.1, 25.2, 12.0],
            dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          },
          costAnalysis: {
            traditional: 45.60,
            scientific: 28.40,
            savings: 17.20
          },
          environmentalImpact: {
            co2Reduction: 2.3,
            waterConserved: 89.3,
            energySaved: 12.5
          },
          cropYield: {
            traditional: 85.2,
            scientific: 94.7,
            improvement: 11.2
          },
          soilHealth: {
            traditional: 78.5,
            scientific: 91.3,
            improvement: 16.3
          }
        });
      }
    } catch (error) {
      console.error('Error fetching efficiency data:', error);
      Alert.alert('Error', 'Failed to load efficiency analysis');
    } finally {
      setLoading(false);
    }
  };

  const renderWaterUsageChart = () => {
    if (!efficiencyData) return null;

    const maxValue = Math.max(...efficiencyData.waterUsage.traditional, ...efficiencyData.waterUsage.scientific);

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Daily Water Usage (Liters)</Text>
          <Text style={styles.chartSubtitle}>7-day comparison</Text>
        </View>
        
        <View style={styles.chartBars}>
          {efficiencyData.waterUsage.dates.map((date, index) => (
            <View key={index} style={styles.chartBarGroup}>
              <View style={styles.chartBarContainer}>
                <View style={styles.chartBarTraditional}>
                  <View 
                    style={[
                      styles.chartBarFill, 
                      { 
                        height: (efficiencyData.waterUsage.traditional[index] / maxValue) * 120,
                        backgroundColor: '#EF4444'
                      }
                    ]} 
                  />
                </View>
                <View style={styles.chartBarScientific}>
                  <View 
                    style={[
                      styles.chartBarFill, 
                      { 
                        height: (efficiencyData.waterUsage.scientific[index] / maxValue) * 120,
                        backgroundColor: '#10B981'
                      }
                    ]} 
                  />
                </View>
              </View>
              <Text style={styles.chartLabel}>{date}</Text>
              <View style={styles.chartValues}>
                <Text style={styles.chartValueTraditional}>
                  {efficiencyData.waterUsage.traditional[index]}L
                </Text>
                <Text style={styles.chartValueScientific}>
                  {efficiencyData.waterUsage.scientific[index]}L
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderCostAnalysisChart = () => {
    if (!efficiencyData) return null;

    const totalCost = efficiencyData.costAnalysis.traditional + efficiencyData.costAnalysis.scientific;
    const traditionalPercentage = (efficiencyData.costAnalysis.traditional / totalCost) * 100;
    const scientificPercentage = (efficiencyData.costAnalysis.scientific / totalCost) * 100;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Cost Analysis</Text>
          <Text style={styles.chartSubtitle}>Monthly irrigation costs</Text>
        </View>
        
        <View style={styles.costChart}>
          <View style={styles.costBar}>
            <View style={styles.costBarTraditional}>
              <View 
                style={[
                  styles.costBarFill, 
                  { 
                    width: `${traditionalPercentage}%`,
                    backgroundColor: '#EF4444'
                  }
                ]} 
              />
            </View>
            <View style={styles.costBarScientific}>
              <View 
                style={[
                  styles.costBarFill, 
                  { 
                    width: `${scientificPercentage}%`,
                    backgroundColor: '#10B981'
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.costDetails}>
            <View style={styles.costItem}>
              <View style={[styles.costColor, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.costLabel}>Traditional: ${efficiencyData.costAnalysis.traditional.toFixed(2)}</Text>
            </View>
            <View style={styles.costItem}>
              <View style={[styles.costColor, { backgroundColor: '#10B981' }]} />
              <Text style={styles.costLabel}>Scientific: ${efficiencyData.costAnalysis.scientific.toFixed(2)}</Text>
            </View>
          </View>
          
          <View style={styles.savingsHighlight}>
            <Ionicons name="trending-down" size={20} color="#10B981" />
            <Text style={styles.savingsText}>
              Savings: ${efficiencyData.costAnalysis.savings.toFixed(2)} ({((efficiencyData.costAnalysis.savings / efficiencyData.costAnalysis.traditional) * 100).toFixed(1)}%)
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEnvironmentalChart = () => {
    if (!efficiencyData) return null;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Environmental Impact</Text>
          <Text style={styles.chartSubtitle}>Positive environmental benefits</Text>
        </View>
        
        <View style={styles.environmentalMetrics}>
          <View style={styles.environmentalMetric}>
            <View style={styles.environmentalIcon}>
              <Ionicons name="leaf" size={24} color="#10B981" />
            </View>
            <View style={styles.environmentalInfo}>
              <Text style={styles.environmentalValue}>{efficiencyData.environmentalImpact.co2Reduction.toFixed(1)}</Text>
              <Text style={styles.environmentalLabel}>CO₂ Reduction (kg)</Text>
            </View>
          </View>
          
          <View style={styles.environmentalMetric}>
            <View style={styles.environmentalIcon}>
              <Ionicons name="water" size={24} color="#3B82F6" />
            </View>
            <View style={styles.environmentalInfo}>
              <Text style={styles.environmentalValue}>{efficiencyData.environmentalImpact.waterConserved.toFixed(0)}</Text>
              <Text style={styles.environmentalLabel}>Water Conserved (L)</Text>
            </View>
          </View>
          
          <View style={styles.environmentalMetric}>
            <View style={styles.environmentalIcon}>
              <Ionicons name="flash" size={24} color="#F59E0B" />
            </View>
            <View style={styles.environmentalInfo}>
              <Text style={styles.environmentalValue}>{efficiencyData.environmentalImpact.energySaved.toFixed(1)}</Text>
              <Text style={styles.environmentalLabel}>Energy Saved (kWh)</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderYieldChart = () => {
    if (!efficiencyData) return null;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Crop Yield & Soil Health</Text>
          <Text style={styles.chartSubtitle}>Performance improvements</Text>
        </View>
        
        <View style={styles.yieldMetrics}>
          <View style={styles.yieldMetric}>
            <Text style={styles.yieldLabel}>Crop Yield</Text>
            <View style={styles.yieldBar}>
              <View style={styles.yieldBarTraditional}>
                <Text style={styles.yieldValue}>{efficiencyData.cropYield.traditional.toFixed(1)}%</Text>
              </View>
              <View style={styles.yieldBarScientific}>
                <Text style={styles.yieldValue}>{efficiencyData.cropYield.scientific.toFixed(1)}%</Text>
              </View>
            </View>
            <Text style={styles.yieldImprovement}>
              +{efficiencyData.cropYield.improvement.toFixed(1)}% improvement
            </Text>
          </View>
          
          <View style={styles.yieldMetric}>
            <Text style={styles.yieldLabel}>Soil Health</Text>
            <View style={styles.yieldBar}>
              <View style={styles.yieldBarTraditional}>
                <Text style={styles.yieldValue}>{efficiencyData.soilHealth.traditional.toFixed(1)}%</Text>
              </View>
              <View style={styles.yieldBarScientific}>
                <Text style={styles.yieldValue}>{efficiencyData.soilHealth.scientific.toFixed(1)}%</Text>
              </View>
            </View>
            <Text style={styles.yieldImprovement}>
              +{efficiencyData.soilHealth.improvement.toFixed(1)}% improvement
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSelectedChart = () => {
    switch (selectedChart) {
      case 'water': return renderWaterUsageChart();
      case 'cost': return renderCostAnalysisChart();
      case 'environment': return renderEnvironmentalChart();
      case 'yield': return renderYieldChart();
      default: return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="analytics" size={48} color="#8B5CF6" style={styles.spinningIcon} />
        <Text style={styles.loadingText}>Analyzing efficiency data...</Text>
      </View>
    );
  }

  if (!efficiencyData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning" size={48} color="#EF4444" />
        <Text style={styles.errorText}>No efficiency data available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchEfficiencyData}>
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
            <Ionicons name="trending-up" size={24} color="#8B5CF6" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Efficiency Analysis</Text>
            <Text style={styles.headerSubtitle}>Scientific vs Traditional Methods</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchEfficiencyData}>
          <Ionicons name="refresh" size={20} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      {/* Chart Selector */}
      <View style={styles.chartSelector}>
        <TouchableOpacity
          style={[styles.chartButton, selectedChart === 'water' && styles.chartButtonActive]}
          onPress={() => setSelectedChart('water')}
        >
          <Ionicons name="water" size={16} color={selectedChart === 'water' ? '#8B5CF6' : 'rgba(255, 255, 255, 0.6)'} />
          <Text style={[styles.chartButtonText, selectedChart === 'water' && styles.chartButtonTextActive]}>
            Water
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.chartButton, selectedChart === 'cost' && styles.chartButtonActive]}
          onPress={() => setSelectedChart('cost')}
        >
          <Ionicons name="cash" size={16} color={selectedChart === 'cost' ? '#8B5CF6' : 'rgba(255, 255, 255, 0.6)'} />
          <Text style={[styles.chartButtonText, selectedChart === 'cost' && styles.chartButtonTextActive]}>
            Cost
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.chartButton, selectedChart === 'environment' && styles.chartButtonActive]}
          onPress={() => setSelectedChart('environment')}
        >
          <Ionicons name="leaf" size={16} color={selectedChart === 'environment' ? '#8B5CF6' : 'rgba(255, 255, 255, 0.6)'} />
          <Text style={[styles.chartButtonText, selectedChart === 'environment' && styles.chartButtonTextActive]}>
            Environment
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.chartButton, selectedChart === 'yield' && styles.chartButtonActive]}
          onPress={() => setSelectedChart('yield')}
        >
          <Ionicons name="flower" size={16} color={selectedChart === 'yield' ? '#8B5CF6' : 'rgba(255, 255, 255, 0.6)'} />
          <Text style={[styles.chartButtonText, selectedChart === 'yield' && styles.chartButtonTextActive]}>
            Yield
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chart Content */}
      <View style={styles.chartContent}>
        {renderSelectedChart()}
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Efficiency Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>36.4%</Text>
            <Text style={styles.summaryLabel}>Water Saved</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>$17.20</Text>
            <Text style={styles.summaryLabel}>Cost Savings</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>11.2%</Text>
            <Text style={styles.summaryLabel}>Yield Increase</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>16.3%</Text>
            <Text style={styles.summaryLabel}>Soil Health</Text>
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
  chartSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 8,
  },
  chartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 4,
  },
  chartButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  chartButtonText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  chartButtonTextActive: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  chartContent: {
    padding: 20,
  },
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  chartBarGroup: {
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
  chartBarTraditional: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    marginRight: 1,
    borderRadius: 2,
  },
  chartBarScientific: {
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
  chartValues: {
    marginTop: 4,
  },
  chartValueTraditional: {
    fontSize: 8,
    color: '#EF4444',
  },
  chartValueScientific: {
    fontSize: 8,
    color: '#10B981',
  },
  costChart: {
    gap: 16,
  },
  costBar: {
    height: 40,
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  costBarTraditional: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  costBarScientific: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  costBarFill: {
    height: '100%',
  },
  costDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  costItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  costLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  savingsHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  savingsText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  environmentalMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  environmentalMetric: {
    alignItems: 'center',
  },
  environmentalIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  environmentalInfo: {
    alignItems: 'center',
  },
  environmentalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  environmentalLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  yieldMetrics: {
    gap: 20,
  },
  yieldMetric: {
    gap: 8,
  },
  yieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  yieldBar: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
  },
  yieldBarTraditional: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yieldBarScientific: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yieldValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  yieldImprovement: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    width: (width - 80) / 2,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});

export default IrrigationEfficiencyCharts;
