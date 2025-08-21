import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SidebarNavigation from './SidebarNavigation';
import { getPlots, Plot } from '../api/plots';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }: any) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch plots from Supabase
  const fetchPlots = async () => {
    try {
      setLoading(true);
      const response = await getPlots();
      if (response.success) {
        setPlots(response.plots || []);
      } else {
        console.error('Failed to fetch plots:', response.error);
        setPlots([]);
      }
    } catch (error) {
      console.error('Error fetching plots:', error);
      setPlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlots();
  }, []);

  // Refresh plots when screen comes into focus (e.g., after adding a plot)
  useFocusEffect(
    React.useCallback(() => {
      fetchPlots();
    }, [])
  );

  // Filter plots based on search text
  const filteredPlots = plots.filter(plot => {
    if (!searchText.trim()) return true;
    
    const searchLower = searchText.toLowerCase();
    return (
      plot.name.toLowerCase().includes(searchLower) ||
      plot.crop.toLowerCase().includes(searchLower) ||
      plot.zip_code.toLowerCase().includes(searchLower)
    );
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 17) return 'Good afternoon!';
    return 'Good evening!';
  };

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
          <View style={styles.onlineStatus}>
            <Ionicons name="wifi" size={16} color="#10B981" />
            <Text style={styles.onlineText}>Online</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications" size={20} color="white" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Greeting and Weather Section */}
        {!searchText.trim() && (
          <View style={styles.greetingSection}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>
                {getGreeting()} 👋
              </Text>
              <Text style={styles.greetingSubtext}>
                Your gardens are looking great today
              </Text>
            </View>
            
            <View style={styles.weatherCard}>
              <Ionicons name="partly-sunny" size={24} color="#F59E0B" />
              <Text style={styles.temperature}>75°F</Text>
              <Text style={styles.weatherConditions}>Clear • 71% humidity</Text>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search plots, crops, or locations..."
              placeholderTextColor="#6B7280"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Top Row Metrics */}
        {!searchText.trim() && (
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Ionicons name="location" size={20} color="#3B82F6" />
              <Text style={styles.metricValue}>{filteredPlots.length}</Text>
              <Text style={styles.metricLabel}>Active Plots</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Ionicons name="water" size={20} color="#3B82F6" />
              <Text style={styles.metricValue}>26L</Text>
              <Text style={styles.metricLabel}>This week</Text>
            </View>
          </View>
        )}

        {!searchText.trim() && (
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Ionicons name="trending-down" size={20} color="#F59E0B" />
              <Text style={styles.metricChange}>-3%</Text>
              <Text style={styles.metricValue}>55%</Text>
              <Text style={styles.metricLabel}>Avg Moisture</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '55%' }]} />
              </View>
            </View>
            
            <View style={styles.metricCard}>
              <Ionicons name="time" size={20} color="#8B5CF6" />
              <Text style={styles.metricValue}>2h 0m</Text>
              <Text style={styles.metricLabel}>Next Watering</Text>
            </View>
          </View>
        )}

        {/* Bottom Row Metrics */}
        {!searchText.trim() && (
          <View style={styles.bottomMetricsRow}>
            <View style={styles.bottomMetricCard}>
              <Ionicons name="wifi" size={20} color="#10B981" />
              <Text style={styles.bottomMetricValue}>{filteredPlots.length}</Text>
              <Text style={styles.bottomMetricLabel}>Total Plots</Text>
              <Text style={styles.bottomMetricSubtext}>All active</Text>
            </View>
            
            <View style={styles.bottomMetricCard}>
              <Ionicons name="water" size={20} color="#3B82F6" />
              <Text style={[styles.bottomMetricValue, { color: '#3B82F6' }]}>55%</Text>
              <Text style={styles.bottomMetricLabel}>Avg Moisture</Text>
              <Text style={styles.bottomMetricSubtext}>Good</Text>
            </View>
            
            <View style={styles.bottomMetricCard}>
              <Ionicons name="heart" size={20} color="#EF4444" />
              <Text style={[styles.bottomMetricValue, { color: '#10B981' }]}>84%</Text>
              <Text style={styles.bottomMetricLabel}>Avg Health</Text>
              <Text style={styles.bottomMetricSubtext}>Thriving</Text>
            </View>
          </View>
        )}

        {/* Your Plots Section */}
        <View style={styles.plotsSection}>
          <View style={styles.plotsHeader}>
            <Text style={styles.plotsTitle}>
              {searchText.trim() ? `Search Results (${filteredPlots.length})` : `Your Plots (${filteredPlots.length})`}
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchPlots}>
              <Ionicons name="refresh" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {searchText.trim() && filteredPlots.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search" size={48} color="#6B7280" />
              <Text style={styles.noResultsTitle}>No plots found</Text>
              <Text style={styles.noResultsSubtext}>
                Try searching with different keywords or check your plot names
              </Text>
            </View>
          ) : !searchText.trim() && filteredPlots.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <Ionicons name="leaf" size={48} color="#6B7280" />
              <Text style={styles.noResultsTitle}>No plots available</Text>
              <Text style={styles.noResultsSubtext}>
                Add your first plot to get started
              </Text>
            </View>
          ) : (
            <View style={styles.plotsGrid}>
              {filteredPlots.map((plot) => (
                <TouchableOpacity 
                  key={plot.id}
                  style={styles.plotGridCard}
                  onPress={() => {
                    console.log(`${plot.name} pressed`);
                    navigation.navigate('PlotDetails' as never, { plotId: plot.id } as never);
                  }}
                  activeOpacity={0.7}
                >
                                                  <View style={styles.plotGridHeader}>
                                  <View style={styles.plotGridTitleContainer}>
                                    <Text style={styles.plotGridTitle}>{plot.name}</Text>
                                    <Ionicons name="wifi" size={14} color="#10B981" />
                                  </View>
                                  <View style={styles.healthBadgeSmall}>
                                    <Ionicons name="heart" size={10} color="white" />
                                    <Text style={styles.healthPercentageSmall}>85%</Text>
                                  </View>
                                </View>

                                <Text style={styles.plotGridType}>{plot.crop}</Text>
                                
                                <View style={styles.plotGridLocation}>
                                  <Ionicons name="location" size={12} color="#9CA3AF" />
                                  <Text style={styles.plotGridLocationText}>{plot.zip_code}</Text>
                                </View>

                                {/* Compact Sensor Readings */}
                                <View style={styles.plotGridSensors}>
                                  <View style={styles.plotGridSensor}>
                                    <Ionicons name="water" size={12} color="#3B82F6" />
                                    <Text style={styles.plotGridSensorValue}>50%</Text>
                                  </View>
                                  <View style={styles.plotGridSensor}>
                                    <Ionicons name="thermometer" size={12} color="#F59E0B" />
                                    <Text style={styles.plotGridSensorValue}>70°F</Text>
                                  </View>
                                  <View style={styles.plotGridSensor}>
                                    <Ionicons name="sunny" size={12} color="#F59E0B" />
                                    <Text style={styles.plotGridSensorValue}>80%</Text>
                                  </View>
                                </View>

                                {/* Compact Status */}
                                <View style={styles.plotGridFooter}>
                                  <View style={styles.plotGridStatus}>
                                    <View style={styles.onlineDotSmall} />
                                    <Text style={styles.plotGridStatusText}>Online</Text>
                                  </View>
                                  <Text style={styles.plotGridNextWatering}>Tomorrow 6AM</Text>
                                </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Timestamp */}
        {!searchText.trim() && (
          <View style={styles.timestampContainer}>
            <Text style={styles.timestampText}>Last updated: 2:34:56 PM</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('SetupPlot')}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Sidebar Navigation */}
      <SidebarNavigation
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        navigation={navigation}
        currentRoute="home"
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
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  onlineText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 4,
    fontWeight: '500',
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  greetingSubtext: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 22,
  },
  weatherCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
  },
  temperature: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginTop: 4,
  },
  weatherConditions: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2,
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    marginLeft: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    flex: 1,
    marginHorizontal: 4,
    position: 'relative',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  bottomMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  bottomMetricCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  bottomMetricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  bottomMetricLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  bottomMetricSubtext: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2,
  },
  plotsSection: {
    marginBottom: 24,
  },
  plotsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  plotsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  refreshButton: {
    padding: 4,
  },
  plotCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  plotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  plotTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  plotTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginRight: 8,
  },
  healthBadge: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthPercentage: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  plotType: {
    fontSize: 14,
    color: 'white',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  sensorReadings: {
    marginBottom: 16,
  },
  sensorItem: {
    marginBottom: 12,
  },
  sensorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sensorValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  sensorProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 2,
    overflow: 'hidden',
  },
  sensorProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  sensorLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  wateringSchedule: {
    marginBottom: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scheduleText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 4,
  },
  lastWatered: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 18,
  },
  plotFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
  },
  healthStatus: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  wateringScheduleWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scheduleContainer: {
    flex: 1,
  },
  waterButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  waterButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  timestampContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  timestampText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  plotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  plotGridCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    minWidth: 150,
  },
  plotGridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  plotGridTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  plotGridTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginRight: 4,
  },
  healthBadgeSmall: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthPercentageSmall: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  plotGridType: {
    fontSize: 12,
    color: 'white',
    marginBottom: 4,
  },
  plotGridLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  plotGridLocationText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 3,
  },
  plotGridSensors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  plotGridSensor: {
    alignItems: 'center',
  },
  plotGridSensorValue: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginTop: 2,
  },
  plotGridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plotGridStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  plotGridStatusText: {
    fontSize: 10,
    color: 'white',
  },
  plotGridNextWatering: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
}); 