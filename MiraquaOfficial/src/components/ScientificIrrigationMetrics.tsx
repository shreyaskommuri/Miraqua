import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface ScientificMetrics {
  et0: number;
  kc: number;
  etc: number;
  soilMoisture: number;
  irrigationNeeded: boolean;
  liters: number;
  explanation: string;
  optimalTime: string;
}

interface ScientificIrrigationMetricsProps {
  metrics: ScientificMetrics;
  onInfoPress?: () => void;
}

const ScientificIrrigationMetrics: React.FC<ScientificIrrigationMetricsProps> = ({
  metrics,
  onInfoPress
}) => {
  const getMoistureColor = (moisture: number) => {
    if (moisture < 0.2) return '#EF4444'; // Red - too dry
    if (moisture < 0.3) return '#F59E0B'; // Orange - dry
    if (moisture < 0.4) return '#10B981'; // Green - optimal
    if (moisture < 0.5) return '#3B82F6'; // Blue - moist
    return '#8B5CF6'; // Purple - too wet
  };

  const getMoistureStatus = (moisture: number) => {
    if (moisture < 0.2) return 'Critical';
    if (moisture < 0.3) return 'Dry';
    if (moisture < 0.4) return 'Optimal';
    if (moisture < 0.5) return 'Moist';
    return 'Saturated';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons name="analytics" size={20} color="#8B5CF6" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Scientific Metrics</Text>
            <Text style={styles.headerSubtitle}>FAO-56 Penman-Monteith Analysis</Text>
          </View>
        </View>
        {onInfoPress && (
          <TouchableOpacity style={styles.infoButton} onPress={onInfoPress}>
            <Ionicons name="information-circle" size={20} color="#8B5CF6" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.metricsGrid}>
        {/* ET₀ (Reference Evapotranspiration) */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons name="sunny" size={16} color="#F59E0B" />
            <Text style={styles.metricLabel}>ET₀</Text>
          </View>
          <Text style={styles.metricValue}>{metrics.et0.toFixed(3)}</Text>
          <Text style={styles.metricUnit}>mm/day</Text>
          <Text style={styles.metricDescription}>Reference Evapotranspiration</Text>
        </View>

        {/* Kc (Crop Coefficient) */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons name="leaf" size={16} color="#10B981" />
            <Text style={styles.metricLabel}>Kc</Text>
          </View>
          <Text style={styles.metricValue}>{metrics.kc.toFixed(2)}</Text>
          <Text style={styles.metricUnit}>ratio</Text>
          <Text style={styles.metricDescription}>Crop Coefficient</Text>
        </View>

        {/* ETc (Crop Evapotranspiration) */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons name="water" size={16} color="#3B82F6" />
            <Text style={styles.metricLabel}>ETc</Text>
          </View>
          <Text style={styles.metricValue}>{metrics.etc.toFixed(3)}</Text>
          <Text style={styles.metricUnit}>mm/day</Text>
          <Text style={styles.metricDescription}>Crop Evapotranspiration</Text>
        </View>

        {/* Soil Moisture */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons name="thermometer" size={16} color={getMoistureColor(metrics.soilMoisture)} />
            <Text style={styles.metricLabel}>Soil</Text>
          </View>
          <Text style={[styles.metricValue, { color: getMoistureColor(metrics.soilMoisture) }]}>
            {(metrics.soilMoisture * 100).toFixed(1)}%
          </Text>
          <Text style={styles.metricUnit}>moisture</Text>
          <Text style={styles.metricDescription}>{getMoistureStatus(metrics.soilMoisture)}</Text>
        </View>
      </View>

      {/* Irrigation Recommendation */}
      <View style={styles.recommendationCard}>
        <LinearGradient
          colors={metrics.irrigationNeeded ? ['#3B82F6', '#1D4ED8'] : ['#10B981', '#059669']}
          style={styles.recommendationGradient}
        >
          <View style={styles.recommendationHeader}>
            <Ionicons 
              name={metrics.irrigationNeeded ? "water" : "checkmark-circle"} 
              size={24} 
              color="white" 
            />
            <Text style={styles.recommendationTitle}>
              {metrics.irrigationNeeded ? 'Irrigation Recommended' : 'No Irrigation Needed'}
            </Text>
          </View>
          
          {metrics.irrigationNeeded && (
            <View style={styles.irrigationDetails}>
              <Text style={styles.irrigationAmount}>{metrics.liters.toFixed(1)}L</Text>
              <Text style={styles.irrigationTime}>Best time: {metrics.optimalTime}</Text>
            </View>
          )}
          
          <Text style={styles.explanation}>{metrics.explanation}</Text>
        </LinearGradient>
      </View>

      {/* Scientific Formula Display */}
      <View style={styles.formulaCard}>
        <Text style={styles.formulaTitle}>Scientific Calculation</Text>
        <Text style={styles.formulaText}>
          ETc = ET₀ × Kc
        </Text>
        <Text style={styles.formulaSubtext}>
          ETc = {metrics.et0.toFixed(3)} × {metrics.kc.toFixed(2)} = {metrics.etc.toFixed(3)} mm/day
        </Text>
        <Text style={styles.formulaDescription}>
          Based on FAO-56 Penman-Monteith equation and dynamic crop coefficients
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
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
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  infoButton: {
    padding: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    width: (width - 80) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  metricUnit: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  metricDescription: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  recommendationCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  recommendationGradient: {
    padding: 16,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  irrigationDetails: {
    alignItems: 'center',
    marginBottom: 12,
  },
  irrigationAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  irrigationTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  explanation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  formulaCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  formulaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  formulaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
    textAlign: 'center',
    marginBottom: 8,
  },
  formulaSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  formulaDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ScientificIrrigationMetrics;
