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
import SidebarNavigation from './SidebarNavigation';

interface AnalyticsData {
  totalWaterUsed: number;
  waterSavings: number;
  avgMoisture: number;
  activePlots: number;
  weeklyData: Array<{
    day: string;
    water: number;
    moisture: number;
  }>;
}

export default function AnalyticsScreen({ navigation }: any) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showSidebar, setShowSidebar] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalWaterUsed: 0,
    waterSavings: 0,
    avgMoisture: 0,
    activePlots: 0,
    weeklyData: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnalyticsData({
        totalWaterUsed: 142,
        waterSavings: 23,
        avgMoisture: 68,
        activePlots: 3,
        weeklyData: [
          { day: "Mon", water: 12, moisture: 65 },
          { day: "Tue", water: 15, moisture: 68 },
          { day: "Wed", water: 10, moisture: 72 },
          { day: "Thu", water: 8, moisture: 70 },
          { day: "Fri", water: 14, moisture: 66 },
          { day: "Sat", water: 16, moisture: 64 },
          { day: "Sun", water: 13, moisture: 69 }
        ]
      });
    } catch (err) {
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnalytics();
    setIsRefreshing(false);
  };

  const handleDayClick = (day: any) => {
    navigation.navigate('SpecificDay', { plotId: 1, day: day.day.toLowerCase() });
  };

  const StatCard = ({ title, value, subtitle, icon, color }: {
    title: string;
    value: string;
    subtitle?: string;
    icon: string;
    color: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const WeeklyChart = () => (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Weekly Water Usage</Text>
      <View style={styles.chartContainer}>
        {analyticsData.weeklyData.map((day, index) => (
          <TouchableOpacity
            key={day.day}
            style={styles.chartBar}
            onPress={() => handleDayClick(day)}
          >
            <View style={[styles.bar, { height: (day.water / 20) * 100 }]} />
            <Text style={styles.barLabel}>{day.day}</Text>
            <Text style={styles.barValue}>{day.water}L</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const MoistureChart = () => (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Soil Moisture Levels</Text>
      <View style={styles.moistureContainer}>
        {analyticsData.weeklyData.map((day, index) => (
          <View key={day.day} style={styles.moistureItem}>
            <View style={styles.moistureBar}>
              <View 
                style={[
                  styles.moistureFill, 
                  { 
                    height: `${day.moisture}%`,
                    backgroundColor: day.moisture > 70 ? '#10B981' : 
                                   day.moisture > 50 ? '#F59E0B' : '#EF4444'
                  }
                ]} 
              />
            </View>
            <Text style={styles.moistureLabel}>{day.day}</Text>
            <Text style={styles.moistureValue}>{day.moisture}%</Text>
          </View>
        ))}
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
          <Text style={styles.headerTitle}>Analytics</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Ionicons name="refresh" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          {Array.from({ length: 6 }).map((_, i) => (
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
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchAnalytics}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* KPI Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Water Used"
            value={`${analyticsData.totalWaterUsed}L`}
            subtitle="This month"
            icon="water"
            color="#3B82F6"
          />
          <StatCard
            title="Water Savings"
            value={`${analyticsData.waterSavings}%`}
            subtitle="vs. traditional"
            icon="trending-up"
            color="#10B981"
          />
          <StatCard
            title="Avg Moisture"
            value={`${analyticsData.avgMoisture}%`}
            subtitle="Optimal range"
            icon="thermometer"
            color="#F59E0B"
          />
          <StatCard
            title="Active Plots"
            value={analyticsData.activePlots.toString()}
            subtitle="Monitored"
            icon="leaf"
            color="#8B5CF6"
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'trends' && styles.activeTab]}
            onPress={() => setActiveTab('trends')}
          >
            <Text style={[styles.tabText, activeTab === 'trends' && styles.activeTabText]}>
              Trends
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'efficiency' && styles.activeTab]}
            onPress={() => setActiveTab('efficiency')}
          >
            <Text style={[styles.tabText, activeTab === 'efficiency' && styles.activeTabText]}>
              Efficiency
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            <WeeklyChart />
            <MoistureChart />
          </View>
        )}

        {activeTab === 'trends' && (
          <View style={styles.tabContent}>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Monthly Trends</Text>
              <Text style={styles.comingSoonText}>Detailed trend analysis coming soon...</Text>
            </View>
          </View>
        )}

        {activeTab === 'efficiency' && (
          <View style={styles.tabContent}>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Water Efficiency</Text>
              <Text style={styles.comingSoonText}>Efficiency metrics coming soon...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sidebar Navigation */}
      <SidebarNavigation
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        navigation={navigation}
        currentRoute="Analytics"
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
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
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
  tabContent: {
    marginBottom: 20,
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  bar: {
    width: 20,
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  barValue: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  moistureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  moistureItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  moistureBar: {
    width: 20,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  moistureFill: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderRadius: 4,
  },
  moistureLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  moistureValue: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  comingSoonText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    padding: 20,
  },
  loadingCard: {
    height: 120,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 