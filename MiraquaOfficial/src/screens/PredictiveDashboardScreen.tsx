import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SidebarNavigation from './SidebarNavigation';

interface PredictiveData {
  date: string;
  currentMoisture: number;
  predictedMoisture: number;
  scheduledWater: number;
  aiOptimizedWater: number;
  temperature: number;
  rainfall: number;
}

const { width } = Dimensions.get('window');

export default function PredictiveDashboardScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [activeSchedule, setActiveSchedule] = useState<'current' | 'ai-optimized'>('current');
  const [data, setData] = useState<PredictiveData[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock 14-day forecast data
        const mockData: PredictiveData[] = [];
        for (let i = 0; i < 14; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          
          mockData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            currentMoisture: Math.max(20, Math.min(95, 70 + Math.sin(i * 0.5) * 20 + Math.random() * 10)),
            predictedMoisture: Math.max(25, Math.min(90, 75 + Math.sin(i * 0.4) * 15 + Math.random() * 8)),
            scheduledWater: Math.max(0, 15 + Math.sin(i * 0.3) * 5 + Math.random() * 3),
            aiOptimizedWater: Math.max(0, 12 + Math.sin(i * 0.35) * 4 + Math.random() * 2),
            temperature: Math.max(60, Math.min(85, 72 + Math.sin(i * 0.2) * 8 + Math.random() * 4)),
            rainfall: Math.random() > 0.7 ? Math.random() * 0.5 : 0
          });
        }
        
        setData(mockData);
      } catch (error) {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const SimpleChart = ({ data, type }: { data: PredictiveData[], type: 'moisture' | 'water' }) => {
    const maxValue = type === 'moisture' ? 100 : 20;
    const currentData = type === 'moisture' ? 'currentMoisture' : 'scheduledWater';
    const predictedData = type === 'moisture' ? 'predictedMoisture' : 'aiOptimizedWater';
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>
            {type === 'moisture' ? 'Soil Moisture Forecast' : 'Water Usage Comparison'}
          </Text>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.legendText}>Current</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>AI Predicted</Text>
            </View>
          </View>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
          <View style={styles.chartContent}>
            {data.map((item, index) => (
              <View key={index} style={styles.chartBar}>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: (item[currentData as keyof PredictiveData] as number / maxValue) * 120,
                        backgroundColor: '#3B82F6'
                      }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: (item[predictedData as keyof PredictiveData] as number / maxValue) * 120,
                        backgroundColor: '#10B981',
                        position: 'absolute',
                        bottom: 0,
                        opacity: 0.7
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.barLabel}>{item.date}</Text>
                <Text style={styles.barValue}>
                  {type === 'moisture' 
                    ? `${Math.round(item.currentMoisture)}%`
                    : `${Math.round(item.scheduledWater)}L`
                  }
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const WeatherCard = ({ data }: { data: PredictiveData[] }) => (
    <View style={styles.weatherCard}>
      <Text style={styles.weatherTitle}>Weather Forecast</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.weatherContainer}>
          {data.slice(0, 7).map((item, index) => (
            <View key={index} style={styles.weatherItem}>
              <Text style={styles.weatherDate}>{item.date}</Text>
              <Ionicons 
                name={item.rainfall > 0 ? "rainy" : "sunny"} 
                size={24} 
                color={item.rainfall > 0 ? "#3B82F6" : "#F59E0B"} 
              />
              <Text style={styles.weatherTemp}>{Math.round(item.temperature)}°F</Text>
              {item.rainfall > 0 && (
                <Text style={styles.weatherRain}>{Math.round(item.rainfall * 100)}%</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

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
          <View style={styles.loadingCard} />
          <View style={styles.loadingCard} />
          <View style={styles.loadingCard} />
        </View>

        {/* Sidebar Navigation */}
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
          <Text style={styles.logoText}>Miraqua</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Schedule Toggle */}
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.scheduleTitle}>Schedule Comparison</Text>
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>AI saves 23% water</Text>
            </View>
          </View>
          
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeSchedule === 'current' && styles.activeTab]}
              onPress={() => setActiveSchedule('current')}
            >
              <Text style={[styles.tabText, activeSchedule === 'current' && styles.activeTabText]}>
                Current Schedule
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeSchedule === 'ai-optimized' && styles.activeTab]}
              onPress={() => setActiveSchedule('ai-optimized')}
            >
              <View style={styles.aiTab}>
                <Ionicons name="flash" size={16} color={activeSchedule === 'ai-optimized' ? 'white' : '#6B7280'} />
                <Text style={[styles.tabText, activeSchedule === 'ai-optimized' && styles.activeTabText]}>
                  AI Optimized
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Moisture Forecast Chart */}
        <View style={styles.chartCard}>
          <SimpleChart data={data} type="moisture" />
        </View>

        {/* Water Usage Comparison */}
        <View style={styles.chartCard}>
          <SimpleChart data={data} type="water" />
        </View>

        {/* Weather Forecast */}
        <View style={styles.chartCard}>
          <WeatherCard data={data} />
        </View>

        {/* AI Insights */}
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>AI Insights</Text>
          <View style={styles.insightItem}>
            <Ionicons name="bulb" size={20} color="#10B981" />
            <Text style={styles.insightText}>
              Reduce watering by 15% tomorrow due to expected rainfall
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="trending-up" size={20} color="#3B82F6" />
            <Text style={styles.insightText}>
              Soil moisture will remain optimal for the next 5 days
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="thermometer" size={20} color="#F59E0B" />
            <Text style={styles.insightText}>
              Temperature spike expected on Friday - increase morning watering
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sidebar Navigation */}
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
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scheduleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  savingsBadge: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  savingsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  activeTabText: {
    color: 'white',
    fontWeight: '600',
  },
  aiTab: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  chartContainer: {
    marginTop: 8,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: 'white',
  },
  chartScroll: {
    marginHorizontal: -20,
  },
  chartContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    height: 160,
    alignItems: 'flex-end',
  },
  chartBar: {
    alignItems: 'center',
    marginHorizontal: 8,
    minWidth: 40,
  },
  barContainer: {
    width: 20,
    height: 120,
    marginBottom: 8,
    position: 'relative',
  },
  bar: {
    width: '100%',
    borderRadius: 2,
  },
  barLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  barValue: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  weatherCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  weatherContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  weatherItem: {
    alignItems: 'center',
    marginHorizontal: 12,
    minWidth: 60,
  },
  weatherDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  weatherTemp: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginTop: 4,
  },
  weatherRain: {
    fontSize: 10,
    color: '#3B82F6',
    marginTop: 2,
  },
  insightsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: 'white',
    marginLeft: 12,
    lineHeight: 20,
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
    borderRadius: 8,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
}); 