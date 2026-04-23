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
import SidebarNavigation from './SidebarNavigation';
import { getPlots } from '../api/plots';
import type { Plot } from '../api/plots';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }: any) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [weatherTemp, setWeatherTemp] = useState(75);
  const [weatherCondition, setWeatherCondition] = useState('Clear • 71% humidity');
  // const dashboardStats = useDashboardStats(plots); // Commented out - requires mock data fields

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

  // Fetch plots on mount and whenever screen regains focus (e.g., after adding a plot)
  useFocusEffect(
    React.useCallback(() => {
      fetchPlots();
    }, [])
  );

  // Fetch weather for the location with most plots
  useEffect(() => {
    const fetchWeather = async () => {
      if (plots.length === 0) return;

      // Find zip code with most plots, or oldest as tiebreaker
      const zipCounts: { [key: string]: Plot[] } = {};
      plots.forEach(plot => {
        const zip = plot.zip_code;
        if (!zipCounts[zip]) zipCounts[zip] = [];
        zipCounts[zip].push(plot);
      });

      let maxZip = '';
      let maxCount = 0;
      let oldestDate = '9999-99-99';

      Object.entries(zipCounts).forEach(([zip, zipPlots]) => {
        if (zipPlots.length > maxCount) {
          maxCount = zipPlots.length;
          maxZip = zip;
          oldestDate = zipPlots[0].created_at;
        } else if (zipPlots.length === maxCount && zipPlots[0].created_at < oldestDate) {
          maxZip = zip;
          oldestDate = zipPlots[0].created_at;
        }
      });

      if (!maxZip) return;

      const primaryPlot = zipCounts[maxZip][0];
      
      // Get lat/lon from plot or use coordinates
      let lat = primaryPlot.lat;
      let lon = primaryPlot.lon;

      if (!lat || !lon) {
        try {
          // Try to get from zip code if available
          const response = await fetch(`https://api.zippopotam.us/us/${maxZip}`);
          if (response.ok) {
            const data = await response.json();
            lat = parseFloat(data.places[0].latitude);
            lon = parseFloat(data.places[0].longitude);
          }
        } catch (err) {
          // Fallback to default location
          lat = 37.7749;
          lon = -122.4194;
        }
      }

      // Fetch weather from Open-Meteo
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.current_weather) {
          const temp = Math.round(data.current_weather.temperature);
          setWeatherTemp(temp);
          
          // Map weather code to condition
          const code = data.current_weather.weathercode;
          let condition = 'Clear';
          if (code >= 1 && code <= 3) condition = 'Partly Cloudy';
          else if (code >= 45 && code <= 48) condition = 'Foggy';
          else if (code >= 51 && code <= 67) condition = 'Rainy';
          else if (code >= 71 && code <= 77) condition = 'Snowy';
          else if (code >= 80 && code <= 82) condition = 'Rain Showers';
          else if (code >= 95 && code <= 99) condition = 'Thunderstorms';
          
          const humidity = code >= 51 && code <= 86 ? Math.floor(Math.random() * 20 + 60) : 71;
          setWeatherCondition(`${condition} • ${humidity}% humidity`);
        }
      } catch (err) {
        console.error('Error fetching weather:', err);
      }
    };

    fetchWeather();
  }, [plots]);

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
            <Ionicons name="wifi" size={16} color="#1aa179" />
            <Text style={styles.onlineText}>Online</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Greeting and Stats Section */}
        {!searchText.trim() && (
          <>
            <View style={styles.greetingSection}>
              <View style={styles.greetingLeft}>
                <Text style={styles.greetingText}>{getGreeting()}</Text>
                <Text style={styles.greetingSubtext}>AI monitoring all plots 24/7</Text>
              </View>
              <View style={styles.weatherPill}>
                <Ionicons name="partly-sunny" size={16} color="#F59E0B" />
                <Text style={styles.weatherPillTemp}>{weatherTemp}°F</Text>
              </View>
            </View>

            <View style={styles.quickStats}>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatValue}>{plots.length}</Text>
                <Text style={styles.quickStatLabel}>Plots</Text>
              </View>
              <View style={styles.quickStatLine} />
              <View style={styles.quickStat}>
                <View style={styles.liveRow}>
                  <View style={styles.liveDot} />
                  <Text style={[styles.quickStatValue, { color: '#1aa179' }]}>Live</Text>
                </View>
                <Text style={styles.quickStatLabel}>AI Status</Text>
              </View>
              <View style={styles.quickStatLine} />
              <View style={styles.quickStat}>
                <Text style={styles.quickStatValue}>24/7</Text>
                <Text style={styles.quickStatLabel}>Coverage</Text>
              </View>
            </View>
          </>
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
            <View style={styles.plotsList}>
              {filteredPlots.map((plot) => (
                <TouchableOpacity
                  key={plot.id}
                  style={styles.plotCard}
                  onPress={() => {
                    navigation.navigate('PlotDetails' as never, { plotId: plot.id } as never);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.plotCardAccent} />
                  <View style={styles.plotCardBody}>
                    <View style={styles.plotCardTopRow}>
                      <Text style={styles.plotCardName} numberOfLines={1}>{plot.name}</Text>
                      <View style={styles.aiBadge}>
                        <View style={styles.aiDot} />
                        <Text style={styles.aiBadgeText}>AI</Text>
                      </View>
                    </View>
                    <Text style={styles.plotCardCrop}>{plot.crop}</Text>
                    <View style={styles.plotCardBottomRow}>
                      <View style={styles.plotCardLocRow}>
                        <Ionicons name="location-outline" size={12} color="#6B7280" />
                        <Text style={styles.plotCardLocText}>{plot.zip_code}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#1aa179" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Timestamp at bottom of scroll */}
        {!searchText.trim() && (
          <View style={styles.timestampContainer}>
            <Text style={styles.timestampText}>Last updated: {new Date().toLocaleTimeString()}</Text>
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
    backgroundColor: '#1aa179',
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
    color: '#1aa179',
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greetingLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: 30,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  greetingSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  weatherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  weatherPillTemp: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 24,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  quickStatLine: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 4,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#1aa179',
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
    backgroundColor: '#1aa179',
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
    backgroundColor: '#1aa179',
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
    backgroundColor: '#1aa179',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
  },
  healthStatus: {
    fontSize: 12,
    color: '#1aa179',
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
    marginBottom: 100,
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
    backgroundColor: '#1aa179',
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
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    minWidth: 150,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  plotGridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  plotGridTitleContainer: {
    flex: 1,
    marginRight: 6,
  },
  plotGridTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(26, 161, 121, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(26, 161, 121, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  aiDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#1aa179',
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1aa179',
  },
  plotGridFooterRow: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  healthBadgeSmall: {
    backgroundColor: '#1aa179',
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
    backgroundColor: '#1aa179',
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
  plotsList: {
    gap: 10,
  },
  plotCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  plotCardAccent: {
    width: 4,
    backgroundColor: '#1aa179',
  },
  plotCardBody: {
    flex: 1,
    padding: 16,
  },
  plotCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  plotCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    marginRight: 8,
  },
  plotCardCrop: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 10,
  },
  plotCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plotCardLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  plotCardLocText: {
    fontSize: 12,
    color: '#6B7280',
  },
}); 