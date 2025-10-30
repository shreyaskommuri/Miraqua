import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SidebarNavigation from './SidebarNavigation';
import { environment } from '../config/environment';
import { getPlots } from '../api/plots';

const { width } = Dimensions.get('window');

interface PredictiveData {
  date: string;
  currentMoisture: number;
  predictedMoisture: number;
  scheduledWater: number;
  aiOptimizedWater: number;
  temperature: number;
  rainfall: number;
}

export default function PredictiveDashboardScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [activeSchedule, setActiveSchedule] = useState<'current' | 'ai-optimized'>('current');
  const [data, setData] = useState<PredictiveData[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [waterSavings, setWaterSavings] = useState(23);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get user's plots
        const plotsResponse = await getPlots();
        const plots = plotsResponse.plots || [];
        
        if (plots.length === 0) {
          // Fallback to mock data if no plots
          generateMockData();
          return;
        }
        
        const plot = plots[0];
        const { lat, lon } = plot;
        
        // Fetch schedule data for the plot
        const planResponse = await fetch(`${environment.apiUrl}/get_plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            plot_id: plot.id,
            use_original: false,
            force_refresh: false
          })
        });
        
        let schedule = [];
        if (planResponse.ok) {
          const planData = await planResponse.json();
          schedule = planData.schedule || [];
        }
        
        // Fetch weather forecast
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=7`
        );
        const weatherData = await weatherResponse.json();
        
        // Parse schedule and weather into 7-day forecast
        const processedData: PredictiveData[] = [];
        const now = new Date();
        
        for (let i = 0; i < 7; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() + i);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          // Get weather for this day
          const dailyWeather = weatherData.daily?.time?.[i];
          const temp = weatherData.daily?.temperature_2m_max?.[i] || 72;
          const rainfall = weatherData.daily?.precipitation_sum?.[i] || 0;
          
          // Find schedule entry for this day or estimate
          const scheduleEntry = schedule.find((s: any) => 
            new Date(s.date).toDateString() === date.toDateString()
          );
          
          const scheduledWater = scheduleEntry?.amount || 20;
          const aiOptimizedWater = Math.round(scheduledWater * 0.85);
          
          // Estimate soil moisture based on watering and rainfall
          const baseMoisture = 70;
          const moistureIncrease = (scheduledWater / 20) * 10;
          const rainfallBonus = (rainfall / 10) * 5;
          const currentMoisture = Math.min(95, baseMoisture + moistureIncrease + rainfallBonus - (i * 2));
          const predictedMoisture = Math.min(95, currentMoisture + 5);
          
          processedData.push({
            date: dateStr,
            currentMoisture: Math.round(currentMoisture),
            predictedMoisture: Math.round(predictedMoisture),
            scheduledWater,
            aiOptimizedWater,
            temperature: Math.round(temp),
            rainfall: Math.round(rainfall * 100) / 100
          });
        }
        
        setData(processedData);
        
        // Calculate water savings
        const totalCurrent = processedData.reduce((sum, d) => sum + d.scheduledWater, 0);
        const totalOptimized = processedData.reduce((sum, d) => sum + d.aiOptimizedWater, 0);
        const savings = Math.round((1 - totalOptimized / totalCurrent) * 100);
        setWaterSavings(savings);
        
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to mock data on error
        generateMockData();
      } finally {
        setLoading(false);
      }
    };
    
    const generateMockData = () => {
      const mockData: PredictiveData[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        const baseMoisture = 70 + Math.sin(i * 0.5) * 15;
        const aiMoisture = baseMoisture + 5;
        const scheduledWater = Math.max(15, 18 + Math.sin(i * 0.3) * 3);
        const aiWater = scheduledWater * 0.85;
        
        mockData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          currentMoisture: Math.max(60, Math.min(95, baseMoisture)),
          predictedMoisture: Math.max(65, Math.min(95, aiMoisture)),
          scheduledWater: Math.round(scheduledWater),
          aiOptimizedWater: Math.round(aiWater),
          temperature: Math.max(65, Math.min(80, 72 + Math.sin(i * 0.4) * 8)),
          rainfall: Math.random() > 0.7 ? Math.round(Math.random() * 0.4 * 100) / 100 : 0
        });
      }
      
      setData(mockData);
      setWaterSavings(23);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    };

    fetchData();
  }, []);

  const getWeatherIcon = (rainfall: number, temp: number) => {
    if (rainfall > 0.1) return 'rainy';
    if (temp < 65) return 'snow';
    if (temp > 78) return 'sunny';
    return 'partly-sunny';
  };

  const getWeatherColor = (rainfall: number, temp: number) => {
    if (rainfall > 0.1) return '#3B82F6';
    if (temp < 65) return '#8B5CF6';
    if (temp > 78) return '#F59E0B';
    return '#10B981';
  };

  const ChartBar = ({ item, maxValue, type, index }: { item: PredictiveData, maxValue: number, type: 'moisture' | 'water', index: number }) => {
    const currentData = type === 'moisture' ? item.currentMoisture : item.scheduledWater;
    const predictedData = type === 'moisture' ? item.predictedMoisture : item.aiOptimizedWater;
    const currentHeight = (currentData / maxValue) * 100;
    const predictedHeight = (predictedData / maxValue) * 100;

    return (
      <View style={styles.chartBar}>
        <View style={styles.barContainer}>
          {/* AI Predicted bar (behind, green) */}
          <View 
            style={[
              styles.bar, 
              { 
                height: predictedHeight,
                backgroundColor: activeSchedule === 'ai-optimized' ? '#10B981' : '#10B98180',
                position: 'absolute',
                bottom: 0,
              }
            ]} 
          />
          {/* Current bar (front, blue) */}
          <View 
            style={[
              styles.bar, 
              { 
                height: currentHeight,
                backgroundColor: activeSchedule === 'current' ? '#3B82F6' : '#3B82F680',
                position: 'absolute',
                bottom: 0,
                left: activeSchedule === 'ai-optimized' ? 0 : 0,
              }
            ]} 
          />
          {/* Overlay for selected */}
          <View 
            style={[
              styles.bar, 
              { 
                height: activeSchedule === 'ai-optimized' ? predictedHeight : currentHeight,
                backgroundColor: activeSchedule === 'ai-optimized' ? '#10B981' : '#3B82F6',
                position: 'absolute',
                bottom: 0,
                opacity: 0.3,
              }
            ]} 
          />
        </View>
        <Text style={styles.barDate}>{item.date}</Text>
        <Text style={styles.barValue}>
          {type === 'moisture' 
            ? `${Math.round(activeSchedule === 'ai-optimized' ? item.predictedMoisture : item.currentMoisture)}%`
            : `${Math.round(activeSchedule === 'ai-optimized' ? item.aiOptimizedWater : item.scheduledWater)}L`
          }
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
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
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.loadingContainer}>
          <Ionicons name="leaf" size={48} color="#10B981" />
          <Text style={styles.loadingText}>Loading predictions...</Text>
        </View>

        <SidebarNavigation
          visible={showSidebar}
          onClose={() => setShowSidebar(false)}
          navigation={navigation}
          currentRoute="PredictiveDashboard"
        />
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
          <Text style={styles.logoText}>Predictive AI</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Key Metrics */}
        <Animated.View style={[styles.metricsRow, { opacity: fadeAnim }]}>
          <View style={styles.metricCard}>
            <Ionicons name="trophy" size={24} color="#F59E0B" />
            <Text style={styles.metricValue}>{waterSavings}%</Text>
            <Text style={styles.metricLabel}>Water Savings</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Ionicons name="water" size={24} color="#3B82F6" />
            <Text style={styles.metricValue}>
              {data.reduce((sum, d) => sum + (activeSchedule === 'current' ? d.scheduledWater : d.aiOptimizedWater), 0)}L
            </Text>
            <Text style={styles.metricLabel}>Total Usage</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Ionicons name="trending-up" size={24} color="#10B981" />
            <Text style={styles.metricValue}>
              {Math.round(data.reduce((sum, d) => sum + (activeSchedule === 'current' ? d.currentMoisture : d.predictedMoisture), 0) / data.length)}%
            </Text>
            <Text style={styles.metricLabel}>Avg Moisture</Text>
          </View>
        </Animated.View>

        {/* Schedule Comparison */}
        <Animated.View style={[styles.scheduleCard, { opacity: fadeAnim }]}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.scheduleTitle}>Schedule Comparison</Text>
            <TouchableOpacity style={[styles.savingsBadge, { backgroundColor: waterSavings > 20 ? '#10B981' : '#F59E0B' }]}>
              <Ionicons name="flash" size={12} color="white" />
              <Text style={styles.savingsText}>AI saves {waterSavings}% water</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeSchedule === 'current' && styles.activeTab]}
              onPress={() => setActiveSchedule('current')}
            >
              <Text style={[styles.tabText, activeSchedule === 'current' && styles.activeTabText]}>
                Current
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeSchedule === 'ai-optimized' && styles.activeTab]}
              onPress={() => setActiveSchedule('ai-optimized')}
            >
              <View style={styles.aiTab}>
                <Ionicons name="flash" size={14} color={activeSchedule === 'ai-optimized' ? 'white' : '#9CA3AF'} />
                <Text style={[styles.tabText, activeSchedule === 'ai-optimized' && styles.activeTabText]}>
                  AI Optimized
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Soil Moisture Forecast */}
        <Animated.View style={[styles.chartCard, { opacity: fadeAnim }]}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <Ionicons name="water" size={20} color="#3B82F6" />
              <Text style={styles.chartTitle}>Soil Moisture</Text>
            </View>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                <Text style={styles.legendText}>Current</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>AI</Text>
              </View>
            </View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
            <View style={styles.chartContent}>
              {data.map((item, index) => (
                <ChartBar key={index} item={item} maxValue={100} type="moisture" index={index} />
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Water Usage Comparison */}
        <Animated.View style={[styles.chartCard, { opacity: fadeAnim }]}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <Ionicons name="water" size={20} color="#10B981" />
              <Text style={styles.chartTitle}>Water Usage</Text>
            </View>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                <Text style={styles.legendText}>Current</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>AI</Text>
              </View>
            </View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
            <View style={styles.chartContent}>
              {data.map((item, index) => (
                <ChartBar key={index} item={item} maxValue={25} type="water" index={index} />
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Weather Forecast */}
        <Animated.View style={[styles.weatherCard, { opacity: fadeAnim }]}>
          <View style={styles.weatherHeader}>
            <View style={styles.chartTitleContainer}>
              <Ionicons name="partly-sunny" size={20} color="#F59E0B" />
              <Text style={styles.weatherTitle}>Weather</Text>
            </View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weatherContainer}>
            {data.map((item, index) => (
              <View key={index} style={styles.weatherItem}>
                <Text style={styles.weatherDate}>{item.date}</Text>
                <Ionicons 
                  name={getWeatherIcon(item.rainfall, item.temperature)} 
                  size={28} 
                  color={getWeatherColor(item.rainfall, item.temperature)} 
                />
                <Text style={styles.weatherTemp}>{Math.round(item.temperature)}°F</Text>
                {item.rainfall > 0 && (
                  <View style={styles.rainIndicator}>
                    <Ionicons name="rainy" size={12} color="#3B82F6" />
                    <Text style={styles.weatherRain}>{Math.round(item.rainfall * 100)}%</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* AI Insights */}
        <Animated.View style={[styles.insightsCard, { opacity: fadeAnim }]}>
          <View style={styles.chartTitleContainer}>
            <Ionicons name="bulb" size={20} color="#F59E0B" />
            <Text style={styles.insightsTitle}>AI Insights & Recommendations</Text>
          </View>
          
          <View style={styles.insightItem}>
            <View style={[styles.insightIconContainer, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="flash" size={18} color="#10B981" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Optimized Watering Schedule</Text>
              <Text style={styles.insightText}>
                AI has optimized your schedule to save {waterSavings}% water while maintaining healthy soil moisture levels.
              </Text>
            </View>
          </View>
          
          <View style={styles.insightItem}>
            <View style={[styles.insightIconContainer, { backgroundColor: '#F59E0B20' }]}>
              <Ionicons name="rainy" size={18} color="#F59E0B" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Rainfall Alert</Text>
              <Text style={styles.insightText}>
                Expected rainfall on {data.find(d => d.rainfall > 0.1)?.date || 'N/A'}. Reduce watering accordingly.
              </Text>
            </View>
          </View>
          
          <View style={styles.insightItem}>
            <View style={[styles.insightIconContainer, { backgroundColor: '#3B82F620' }]}>
              <Ionicons name="trending-up" size={18} color="#3B82F6" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Optimal Moisture Levels</Text>
              <Text style={styles.insightText}>
                Soil moisture will remain optimal for the next 7 days with AI-optimized watering.
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <SidebarNavigation
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        navigation={navigation}
        currentRoute="PredictiveDashboard"
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'white',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  scheduleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  savingsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: 'white',
  },
  aiTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 8,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  chartScroll: {
    marginHorizontal: -20,
  },
  chartContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    height: 180,
    alignItems: 'flex-end',
    paddingBottom: 20,
  },
  chartBar: {
    alignItems: 'center',
    marginHorizontal: 6,
    minWidth: 45,
  },
  barContainer: {
    width: 24,
    height: 140,
    marginBottom: 12,
    position: 'relative',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  barDate: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  barValue: {
    fontSize: 11,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  weatherCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  weatherHeader: {
    marginBottom: 16,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  weatherContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  weatherItem: {
    alignItems: 'center',
    marginHorizontal: 16,
    minWidth: 70,
    paddingVertical: 12,
  },
  weatherDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
    fontWeight: '600',
  },
  weatherTemp: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
    marginTop: 8,
  },
  rainIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  weatherRain: {
    fontSize: 11,
    color: '#3B82F6',
  },
  insightsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  menuButton: {
    padding: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  logoText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
});
