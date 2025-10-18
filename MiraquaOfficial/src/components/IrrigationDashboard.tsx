import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface WeatherData {
  temp_c: number;
  humidity: number;
  wind_speed: number;
  pressure: number;
  solar_radiation: number;
  rainfall: number;
}

interface IrrigationData {
  et0: number;
  kc: number;
  etc: number;
  soilMoisture: number;
  irrigationNeeded: boolean;
  liters: number;
  efficiency: number;
  waterSaved: number;
}

interface IrrigationDashboardProps {
  plotId: string;
  onRefresh?: () => void;
}

const IrrigationDashboard: React.FC<IrrigationDashboardProps> = ({
  plotId,
  onRefresh
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [irrigationData, setIrrigationData] = useState<IrrigationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE_URL = 'http://localhost:5050';

  useEffect(() => {
    fetchDashboardData();
  }, [plotId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch weather data
      const weatherResponse = await fetch(`${API_BASE_URL}/get_weather?plot_id=${plotId}`);
      if (weatherResponse.ok) {
        const weather = await weatherResponse.json();
        setWeatherData(weather);
      }

      // Fetch irrigation data
      const irrigationResponse = await fetch(`${API_BASE_URL}/get_irrigation_metrics?plot_id=${plotId}`);
      if (irrigationResponse.ok) {
        const irrigation = await irrigationResponse.json();
        setIrrigationData(irrigation);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    if (onRefresh) onRefresh();
    setRefreshing(false);
  };

  const getWeatherIcon = (temp: number, humidity: number) => {
    if (temp < 10) return 'snow';
    if (temp < 20) return 'cloudy';
    if (humidity > 80) return 'rainy';
    if (temp > 30) return 'sunny';
    return 'partly-sunny';
  };

  const getWeatherColor = (temp: number) => {
    if (temp < 10) return '#3B82F6';
    if (temp < 20) return '#6B7280';
    if (temp < 30) return '#F59E0B';
    return '#EF4444';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="refresh" size={48} color="#10B981" style={styles.spinningIcon} />
        <Text style={styles.loadingText}>Loading irrigation dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons name="analytics" size={24} color="#8B5CF6" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Irrigation Dashboard</Text>
            <Text style={styles.headerSubtitle}>Real-time scientific analysis</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={20} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      {/* Weather Overview */}
      {weatherData && (
        <View style={styles.weatherCard}>
          <LinearGradient
            colors={['#3B82F6', '#1D4ED8']}
            style={styles.weatherGradient}
          >
            <View style={styles.weatherHeader}>
              <View style={styles.weatherIcon}>
                <Ionicons 
                  name={getWeatherIcon(weatherData.temp_c, weatherData.humidity)} 
                  size={32} 
                  color="white" 
                />
              </View>
              <View style={styles.weatherInfo}>
                <Text style={styles.weatherTemp}>{weatherData.temp_c.toFixed(1)}°C</Text>
                <Text style={styles.weatherDesc}>Current Conditions</Text>
              </View>
            </View>
            
            <View style={styles.weatherMetrics}>
              <View style={styles.weatherMetric}>
                <Ionicons name="water" size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.weatherMetricText}>{weatherData.humidity}%</Text>
                <Text style={styles.weatherMetricLabel}>Humidity</Text>
              </View>
              <View style={styles.weatherMetric}>
                <Ionicons name="airplane" size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.weatherMetricText}>{weatherData.wind_speed} m/s</Text>
                <Text style={styles.weatherMetricLabel}>Wind</Text>
              </View>
              <View style={styles.weatherMetric}>
                <Ionicons name="sunny" size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.weatherMetricText}>{weatherData.solar_radiation} W/m²</Text>
                <Text style={styles.weatherMetricLabel}>Solar</Text>
              </View>
              <View style={styles.weatherMetric}>
                <Ionicons name="rainy" size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.weatherMetricText}>{weatherData.rainfall} mm</Text>
                <Text style={styles.weatherMetricLabel}>Rain</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Irrigation Metrics */}
      {irrigationData && (
        <View style={styles.metricsCard}>
          <Text style={styles.sectionTitle}>Scientific Irrigation Analysis</Text>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="sunny" size={20} color="#F59E0B" />
                <Text style={styles.metricLabel}>ET₀</Text>
              </View>
              <Text style={styles.metricValue}>{irrigationData.et0.toFixed(3)}</Text>
              <Text style={styles.metricUnit}>mm/day</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="leaf" size={20} color="#10B981" />
                <Text style={styles.metricLabel}>Kc</Text>
              </View>
              <Text style={styles.metricValue}>{irrigationData.kc.toFixed(2)}</Text>
              <Text style={styles.metricUnit}>ratio</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="water" size={20} color="#3B82F6" />
                <Text style={styles.metricLabel}>ETc</Text>
              </View>
              <Text style={styles.metricValue}>{irrigationData.etc.toFixed(3)}</Text>
              <Text style={styles.metricUnit}>mm/day</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="thermometer" size={20} color="#8B5CF6" />
                <Text style={styles.metricLabel}>Soil</Text>
              </View>
              <Text style={styles.metricValue}>{(irrigationData.soilMoisture * 100).toFixed(1)}%</Text>
              <Text style={styles.metricUnit}>moisture</Text>
            </View>
          </View>
        </View>
      )}

      {/* Irrigation Recommendation */}
      {irrigationData && (
        <View style={styles.recommendationCard}>
          <LinearGradient
            colors={irrigationData.irrigationNeeded ? ['#10B981', '#059669'] : ['#6B7280', '#4B5563']}
            style={styles.recommendationGradient}
          >
            <View style={styles.recommendationHeader}>
              <Ionicons 
                name={irrigationData.irrigationNeeded ? "water" : "checkmark-circle"} 
                size={24} 
                color="white" 
              />
              <Text style={styles.recommendationTitle}>
                {irrigationData.irrigationNeeded ? 'Irrigation Recommended' : 'No Irrigation Needed'}
              </Text>
            </View>
            
            {irrigationData.irrigationNeeded && (
              <View style={styles.irrigationDetails}>
                <Text style={styles.irrigationAmount}>{irrigationData.liters.toFixed(1)}L</Text>
                <Text style={styles.irrigationEfficiency}>
                  Efficiency: {(irrigationData.efficiency * 100).toFixed(1)}%
                </Text>
              </View>
            )}
            
            <Text style={styles.recommendationText}>
              {irrigationData.irrigationNeeded 
                ? `Water ${irrigationData.liters.toFixed(1)}L based on FAO-56 calculations`
                : 'Soil moisture is optimal, no irrigation needed'
              }
            </Text>
          </LinearGradient>
        </View>
      )}

      {/* Efficiency Metrics */}
      {irrigationData && (
        <View style={styles.efficiencyCard}>
          <Text style={styles.sectionTitle}>Water Efficiency</Text>
          
          <View style={styles.efficiencyMetrics}>
            <View style={styles.efficiencyMetric}>
              <View style={styles.efficiencyIcon}>
                <Ionicons name="trending-up" size={20} color="#10B981" />
              </View>
              <View style={styles.efficiencyInfo}>
                <Text style={styles.efficiencyValue}>{(irrigationData.efficiency * 100).toFixed(1)}%</Text>
                <Text style={styles.efficiencyLabel}>Irrigation Efficiency</Text>
              </View>
            </View>

            <View style={styles.efficiencyMetric}>
              <View style={styles.efficiencyIcon}>
                <Ionicons name="leaf" size={20} color="#3B82F6" />
              </View>
              <View style={styles.efficiencyInfo}>
                <Text style={styles.efficiencyValue}>{irrigationData.waterSaved.toFixed(1)}L</Text>
                <Text style={styles.efficiencyLabel}>Water Saved Today</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Scientific Formula */}
      <View style={styles.formulaCard}>
        <Text style={styles.sectionTitle}>Scientific Calculation</Text>
        <View style={styles.formulaContent}>
          <Text style={styles.formulaText}>ETc = ET₀ × Kc</Text>
          {irrigationData && (
            <Text style={styles.formulaSubtext}>
              ETc = {irrigationData.et0.toFixed(3)} × {irrigationData.kc.toFixed(2)} = {irrigationData.etc.toFixed(3)} mm/day
            </Text>
          )}
          <Text style={styles.formulaDescription}>
            Based on FAO-56 Penman-Monteith equation with real-time weather data
          </Text>
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
  weatherCard: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  weatherGradient: {
    padding: 20,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherTemp: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  weatherDesc: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  weatherMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherMetric: {
    alignItems: 'center',
    flex: 1,
  },
  weatherMetricText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
  weatherMetricLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  metricsCard: {
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: (width - 80) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  metricUnit: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  recommendationCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  recommendationGradient: {
    padding: 20,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  irrigationDetails: {
    alignItems: 'center',
    marginBottom: 12,
  },
  irrigationAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  irrigationEfficiency: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  recommendationText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  efficiencyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  efficiencyMetrics: {
    gap: 16,
  },
  efficiencyMetric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  efficiencyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  efficiencyInfo: {
    flex: 1,
  },
  efficiencyValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  efficiencyLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  formulaCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  formulaContent: {
    alignItems: 'center',
  },
  formulaText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  formulaSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  formulaDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default IrrigationDashboard;
